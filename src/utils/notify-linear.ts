import * as dotenv from 'dotenv';
import { TC_TO_LINEAR, QASE_TO_TC } from './test-data';

dotenv.config();

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const QASE_TOKEN    = process.env.QASE_TESTOPS_API_TOKEN;
const QASE_PROJECT  = 'STA';
const QASE_API      = 'https://api.qase.io/v1';

if (!LINEAR_API_KEY) {
  console.error('❌ LINEAR_API_KEY not found in .env file');
  process.exit(1);
}

if (!QASE_TOKEN) {
  console.error('❌ QASE_TESTOPS_API_TOKEN not found in .env file');
  process.exit(1);
}

// Parse optional --run-id argument
function getRunIdArg(): number | null {
  const idx = process.argv.indexOf('--run-id');
  if (idx !== -1 && process.argv[idx + 1]) {
    const id = parseInt(process.argv[idx + 1]);
    if (!isNaN(id)) return id;
    console.error('❌ Invalid --run-id value. Must be a number.');
    process.exit(1);
  }
  return null;
}

// Fetch a specific Qase run by ID
async function fetchRunById(runId: number): Promise<{
  id: number;
  title: string;
  stats: { passed: number; failed: number; total: number };
} | null> {
  const response = await fetch(
    `${QASE_API}/run/${QASE_PROJECT}/${runId}`,
    {
      headers: {
        'Token': QASE_TOKEN!,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json() as any;
  if (!data.status) {
    console.error(`❌ Qase run #${runId} not found.`);
    process.exit(1);
  }

  const run = data.result;
  return {
    id:    run.id,
    title: run.title,
    stats: {
      passed: run.stats?.passed || 0,
      failed: run.stats?.failed || 0,
      total:  run.stats?.total  || 0,
    },
  };
}

// Fetch the latest Qase run
async function fetchLatestRun(): Promise<{
  id: number;
  title: string;
  stats: { passed: number; failed: number; total: number };
} | null> {
  const response = await fetch(
    `${QASE_API}/run/${QASE_PROJECT}?limit=100`,
    {
      headers: {
        'Token': QASE_TOKEN!,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json() as any;
  if (!data.status || !data.result?.entities?.length) return null;

  // Sort by ID descending — highest ID is the most recent run
  const runs = data.result.entities as any[];
  runs.sort((a, b) => b.id - a.id);
  const run = runs[0];

  return {
    id:    run.id,
    title: run.title,
    stats: {
      passed: run.stats?.passed || 0,
      failed: run.stats?.failed || 0,
      total:  run.stats?.total  || 0,
    },
  };
}

// Fetch results from a specific Qase run
async function fetchRunResults(runId: number): Promise<Array<{
  tc: string;
  status: string;
  duration: string;
}>> {
  const response = await fetch(
    `${QASE_API}/result/${QASE_PROJECT}?run_id=${runId}&limit=50`,
    {
      headers: {
        'Token': QASE_TOKEN!,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json() as any;
  if (!data.status || !data.result?.entities) return [];

  return data.result.entities
    .filter((r: any) => QASE_TO_TC[r.case_id])
    .map((r: any) => ({
      tc:       QASE_TO_TC[r.case_id],
      status:   r.status === 'passed' ? 'PASSED' : 'FAILED',
      duration: r.time_ms ? `${(r.time_ms / 1000).toFixed(1)}s` : '—',
    }));
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
      'Authorization': LINEAR_API_KEY!,
    },
    body: JSON.stringify({
      query,
      variables: { input: { issueId, body } },
    }),
  });

  const data = await response.json() as any;
  if (data.errors) throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
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
      'Authorization': LINEAR_API_KEY!,
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json() as any;
  if (data.errors) throw new Error(`Cannot find issue ${identifier}`);
  return data.data.issue.id;
}

// Build the comment body
function buildComment(
  run: { id: number; stats: { passed: number; failed: number; total: number } },
  results: Array<{ tc: string; status: string; duration: string }>,
  relevantTCs: string[]
): string {
  const icon = run.stats.failed === 0 ? '✅' : '❌';
  const type = run.stats.failed === 0 ? 'PASSED' : 'FAILED';
  const date = new Date().toISOString().split('T')[0];

  const tcLines = relevantTCs.map(tc => {
    const result = results.find(r => r.tc === tc);
    const status = result ? result.status : 'NOT RUN';
    const dur    = result ? ` (${result.duration})` : '';
    const icon   = status === 'PASSED' ? '✅' : '❌';
    return `${icon} ${tc} — ${status}${dur}`;
  }).join('\n');

  return [
    `${icon} AUTOMATED TEST EXECUTION — ${type}`,
    `Date: ${date}`,
    `Executed by: Playwright + TypeScript Framework`,
    `Environment: https://www.saucedemo.com`,
    `Browser: Chromium`,
    `Framework: Playwright v1 + TypeScript`,
    ``,
    `RESULTS:`,
    tcLines,
    ``,
    `Total: ${run.stats.passed}/${run.stats.total} passed`,
    `Qase Run: https://app.qase.io/run/${QASE_PROJECT}/dashboard/${run.id}`,
  ].join('\n');
}

// Main
async function main(): Promise<void> {
  const runIdArg = getRunIdArg();

  console.log('\n🚀 Notifying Linear with latest Qase results...\n');

  if (runIdArg) {
    console.log(`🔍 Using specified Qase run #${runIdArg}\n`);
  }

  // Fetch the run — specific or latest
  process.stdout.write(
    runIdArg
      ? `⏳ Fetching Qase run #${runIdArg}...`
      : '⏳ Fetching latest Qase run...'
  );

  const run = runIdArg
    ? await fetchRunById(runIdArg)
    : await fetchLatestRun();

  if (!run) {
    console.error('\n❌ No Qase run found. Run tests first.');
    process.exit(1);
  }
  console.log(` ✅ Run #${run.id} — "${run.title}"`);

  // Fetch results from that run
  process.stdout.write('⏳ Fetching results...');
  const results = await fetchRunResults(run.id);
  console.log(` ✅ ${results.length} results found`);

  console.log(`📊 Results: ${run.stats.passed}/${run.stats.total} passed\n`);

  // Build issue → TC mapping
  const issuesToNotify = new Map<string, string[]>();

  for (const [tc, issues] of Object.entries(TC_TO_LINEAR)) {
    for (const issueId of issues) {
      if (!issuesToNotify.has(issueId)) {
        issuesToNotify.set(issueId, []);
      }
      const ranInQase = results.some(r => r.tc === tc);
      if (ranInQase && !issuesToNotify.get(issueId)!.includes(tc)) {
        issuesToNotify.get(issueId)!.push(tc);
      }
    }
  }

  // Post to each Linear issue
  for (const [identifier, tcs] of issuesToNotify) {
    try {
      process.stdout.write(`⏳ Posting to ${identifier}...`);
      const internalId = await getIssueId(identifier);
      const comment    = buildComment(run, results, tcs);
      await postComment(internalId, comment);
      console.log(` ✅ Done`);
    } catch (err) {
      console.log(` ❌ Failed — ${err}`);
    }
  }

  console.log('\n✅ Linear notifications complete!\n');
}

main();