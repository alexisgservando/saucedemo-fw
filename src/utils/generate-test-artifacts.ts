import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.LINEAR_API_KEY;
const OUTPUT_DIR = 'src/test-artifacts';

if (!API_KEY) {
  console.error('❌ LINEAR_API_KEY not found in .env file');
  process.exit(1);
}

// The 5 issues we want to generate .md files for
const ISSUES = [
  { id: 'SAU-7',  file: 'SAU-07-test-cases.md' },
  { id: 'SAU-8',  file: 'SAU-08-test-cases.md' },
  { id: 'SAU-9',  file: 'SAU-09-test-cases.md' },
  { id: 'SAU-10', file: 'SAU-10-test-cases.md' },
  { id: 'SAU-11', file: 'SAU-11-test-cases.md' },
];

// GraphQL query to fetch issue + comments
function buildQuery(issueId: string): string {
  return `{
    issue(id: "${issueId}") {
      identifier
      title
      description
      state { name }
      url
      comments {
        nodes {
          body
          createdAt
        }
      }
    }
  }`;
}

// Call Linear GraphQL API
async function fetchIssue(issueId: string): Promise<any> {
  const response = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': API_KEY!,
    },
    body: JSON.stringify({ query: buildQuery(issueId) }),
  });

  const data = await response.json() as any;

  if (data.errors) {
    throw new Error(`Linear API error: ${JSON.stringify(data.errors)}`);
  }

  return data.data.issue;
}

// Generate markdown content from issue data
function generateMarkdown(issue: any): string {
  const comments = issue.comments.nodes as Array<{body: string; createdAt: string}>;

  // Separate test cases, execution history and other comments
  const testCaseComments = comments.filter((c: any) =>
    c.body.startsWith('TC-') || c.body.includes('TC-0')
  );

  const executionComments = comments.filter((c: any) =>
    c.body.includes('MANUAL TEST EXECUTION') ||
    c.body.includes('AUTOMATED TEST EXECUTION') ||
    c.body.includes('REGRESSION')
  );

  // Build test cases section
  let testCasesSection = '';
  if (testCaseComments.length > 0) {
    testCasesSection = testCaseComments
      .map((c: any) => c.body)
      .join('\n\n---\n\n');
  } else {
    testCasesSection = '_No test cases found._';
  }

  // Build execution history table
  let historyRows = '';
  const sortedExec = [...executionComments].reverse();
  for (const c of sortedExec) {
    const date   = c.createdAt.split('T')[0];
    const type   = c.body.includes('MANUAL') ? 'Manual'
                 : c.body.includes('REGRESSION') ? 'Regression'
                 : 'Automated';
    const result = c.body.includes('PASSED') ? '✅ PASSED' : '❌ FAILED';
    historyRows += `| ${date} | ${type} | ${result} | Playwright / Alexis Guardado |\n`;
  }

  const lines = [
    `# ${issue.identifier} — ${issue.title}`,
    ``,
    `**Linear:** ${issue.url}`,
    `**Project:** SauceDemo Test Automation`,
    `**Status:** ${issue.state.name}`,
    ``,
    `---`,
    ``,
    `## User Story`,
    ``,
    issue.description || '_No description provided._',
    ``,
    `---`,
    ``,
    `## Test Cases`,
    ``,
    testCasesSection,
    ``,
    `---`,
    ``,
    `## Execution History`,
    ``,
    `| Date | Type | Result | Executed by |`,
    `|------|------|--------|-------------|`,
    historyRows,
    `---`,
    ``,
    `## Evidence`,
    ``,
    `Screenshots per step stored in:`,
    `\`test-results/YYYY-MM-DD/run-{timestamp}/screenshots/\``,
    ``,
    `_Generated automatically on ${new Date().toISOString().split('T')[0]}_`,
  ];

  return lines.join('\n');
}

// Main function
async function main(): Promise<void> {
  console.log('\n🚀 Generating test artifact .md files from Linear...\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const { id, file } of ISSUES) {
    try {
      process.stdout.write(`⏳ Fetching ${id}...`);
      const issue    = await fetchIssue(id);
      const markdown = generateMarkdown(issue);
      const filePath = path.join(OUTPUT_DIR, file);

      fs.writeFileSync(filePath, markdown);
      console.log(` ✅ ${file}`);
    } catch (error) {
      console.log(` ❌ Failed — ${error}`);
    }
  }

  console.log('\n✅ All files generated in src/test-artifacts/\n');
}

main();