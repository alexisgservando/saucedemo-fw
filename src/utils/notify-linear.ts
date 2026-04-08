import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.LINEAR_API_KEY;

if (!API_KEY) {
    console.error('❌ LINEAR_API_KEY not found in .env file');
    process.exit(1);
}

// Linear issue IDs to notify
const ISSUE_MAP: Record<string, string[]> = {
    'TC-001': ['SAU-7'],
    'TC-002': ['SAU-8'],
    'TC-003': ['SAU-8'],
    'TC-004': ['SAU-8'],
    'TC-005': ['SAU-9'],
    'TC-006': ['SAU-10'],
    'TC-007': ['SAU-11'],
};

// Find the latest run folder
function findLatestRun(): string | null {
    const evidenceDir = 'evidence';
    if (!fs.existsSync(evidenceDir)) return null;

    const dates = fs.readdirSync(evidenceDir)
        .filter(f => /^\d{4}-\d{2}-\d{2}$/.test(f))
        .sort()
        .reverse();

    if (dates.length === 0) return null;

    const latestDate = path.join(evidenceDir, dates[0]);
    const runs = fs.readdirSync(latestDate)
        .filter(f => /^run-\d+$/.test(f))
        .sort((a, b) => {
            const na = parseInt(a.replace('run-', ''));
            const nb = parseInt(b.replace('run-', ''));
            return nb - na;
        });

    if (runs.length === 0) return null;
    return path.join(latestDate, runs[0]);
}

// Parse summary.md into structured data
function parseSummary(runFolder: string): {
    date: string;
    total: number;
    passed: number;
    failed: number;
    duration: string;
    status: string;
    results: Array<{ tc: string; status: string; duration: string }>;
} | null {
    const summaryPath = path.join(runFolder, 'summary.md');
    if (!fs.existsSync(summaryPath)) return null;

    const content = fs.readFileSync(summaryPath, 'utf-8');
    const lines = content.split('\n');

    let date = '', total = 0, passed = 0, failed = 0, duration = '', status = '';
    const results: Array<{ tc: string; status: string; duration: string }> = [];

    for (const line of lines) {
        // Skip table separator rows
        if (line.includes('---')) continue;

        // Parse metadata
        if (line.startsWith('**Date:**')) {
            date = line.replace('**Date:**', '').trim();
        }

        // Parse results table — match exact cell values
        const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);

        if (cells.length >= 2) {
            if (cells[0] === 'Total') total = parseInt(cells[1]) || 0;
            if (cells[0] === 'Passed') passed = parseInt(cells[1]) || 0;
            if (cells[0] === 'Failed') failed = parseInt(cells[1]) || 0;
            if (cells[0] === 'Duration') duration = cells[1];
            if (cells[0] === 'Status') status = cells[1];
        }

        // Parse test case rows — format: | TC-007 — title | ✅ passed | 1.2s |
        if (cells.length >= 3 && cells[0].match(/^TC-\d+/)) {
            const tcId = cells[0].match(/^(TC-\d+)/)?.[1] || '';
            const isPassed = cells[1].includes('passed') || cells[1].includes('✅');
            const dur = cells[2];
            if (tcId) {
                results.push({
                    tc: tcId,
                    status: isPassed ? 'PASSED' : 'FAILED',
                    duration: dur,
                });
            }
        }
    }

    return { date, total, passed, failed, duration, status, results };
}

// Post comment to Linear issue
async function postComment(issueId: string, body: string): Promise<void> {
    const query = `
    mutation CreateComment($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
      }
    }
  `;

    const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY!,
        },
        body: JSON.stringify({
            query,
            variables: {
                input: {
                    issueId,
                    body,
                },
            },
        }),
    });

    const data = await response.json() as any;
    if (data.errors) {
        throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
    }
}

// Get Linear internal ID from identifier (e.g. SAU-7)
async function getIssueId(identifier: string): Promise<string> {
    const query = `{
    issue(id: "${identifier}") {
      id
      identifier
    }
  }`;

    const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': API_KEY!,
        },
        body: JSON.stringify({ query }),
    });

    const data = await response.json() as any;
    if (data.errors) throw new Error(`Cannot find issue ${identifier}`);
    return data.data.issue.id;
}

// Build the comment body
function buildComment(
    summary: ReturnType<typeof parseSummary>,
    runFolder: string,
    relevantTCs: string[]
): string {
    if (!summary) return '';

    const icon = summary.failed === 0 ? '✅' : '❌';
    const type = summary.failed === 0 ? 'PASSED' : 'FAILED';
    const tcLines = relevantTCs.map(tc => {
        const result = summary.results.find(r => r.tc === tc);
        const status = result ? result.status : 'NOT RUN';
        const dur = result ? ` (${result.duration})` : '';
        const icon = status === 'PASSED' ? '✅' : '❌';
        return `${icon} ${tc} — ${status}${dur}`;
    }).join('\n');

    return [
        `${icon} AUTOMATED TEST EXECUTION — ${type}`,
        `Date: ${summary.date}`,
        `Executed by: Playwright + TypeScript Framework`,
        `Environment: https://www.saucedemo.com`,
        `Browser: Chromium`,
        `Framework: Playwright v1 + TypeScript`,
        ``,
        `RESULTS:`,
        tcLines,
        ``,
        `Total: ${summary.passed}/${summary.total} passed in ${summary.duration}`,
        `Evidence: ${runFolder}/`,
        `Screenshots: ${runFolder}/screenshots/`,
    ].join('\n');
}

// Main
async function main(): Promise<void> {
    console.log('\n🚀 Notifying Linear with latest test results...\n');

    const runFolder = findLatestRun();
    if (!runFolder) {
        console.error('❌ No evidence folder found. Run tests first.');
        process.exit(1);
    }

    console.log(`📁 Latest run: ${runFolder}`);

    const summary = parseSummary(runFolder);
    if (!summary) {
        console.error('❌ No summary.md found in latest run folder.');
        process.exit(1);
    }

    console.log(`📊 Results: ${summary.passed}/${summary.total} passed\n`);

    // Build issue → TC mapping from ISSUE_MAP directly
    // This ensures ALL TCs per issue are included, not just ones in current run
    const issuesToNotify = new Map<string, string[]>();

    // First populate from ISSUE_MAP to get correct TC groupings per issue
    for (const [tc, issues] of Object.entries(ISSUE_MAP)) {
        for (const issueId of issues) {
            if (!issuesToNotify.has(issueId)) {
                issuesToNotify.set(issueId, []);
            }
            // Only include if TC was actually in this run
            const ranInThisRun = summary.results.some(r => r.tc === tc);
            if (ranInThisRun && !issuesToNotify.get(issueId)!.includes(tc)) {
                issuesToNotify.get(issueId)!.push(tc);
            }
        }
    }

    // Post to each issue
    for (const [identifier, tcs] of issuesToNotify) {
        try {
            process.stdout.write(`⏳ Posting to ${identifier}...`);
            const internalId = await getIssueId(identifier);
            const comment = buildComment(summary, runFolder, tcs);
            await postComment(internalId, comment);
            console.log(` ✅ Done`);
        } catch (err) {
            console.log(` ❌ Failed — ${err}`);
        }
    }

    console.log('\n✅ Linear notifications complete!\n');
}

main();