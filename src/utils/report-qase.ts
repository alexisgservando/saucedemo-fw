import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { QASE_TO_TC } from './test-data';

dotenv.config();

const QASE_TOKEN = process.env.QASE_TESTOPS_API_TOKEN;
const QASE_PROJECT = 'STA';
const QASE_API = 'https://api.qase.io/v1';

if (!QASE_TOKEN) {
  console.error('❌ QASE_TESTOPS_API_TOKEN not found in .env file');
  process.exit(1);
}

// TC ID → Qase case ID mapping — sourced from test-data.ts (single source of truth)
const TC_TO_QASE: Record<string, number> = Object.fromEntries(
  Object.entries(QASE_TO_TC).map(([qaseId, tcId]) => [tcId, Number(qaseId)])
);

// Find the latest evidence run folder
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
      return parseInt(b.replace('run-', '')) - parseInt(a.replace('run-', ''));
    });

  if (runs.length === 0) return null;
  return path.join(latestDate, runs[0]);
}

// Parse summary.md for results
function parseSummary(runFolder: string): Array<{
  tc: string;
  status: string;
  duration: number;
}> {
  const summaryPath = path.join(runFolder, 'summary.md');
  if (!fs.existsSync(summaryPath)) return [];

  const content = fs.readFileSync(summaryPath, 'utf-8');
  const results: Array<{ tc: string; status: string; duration: number }> = [];

  for (const line of content.split('\n')) {
    if (line.includes('---')) continue;
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 3 && cells[0].match(/^TC-\d+/)) {
      const tcId = cells[0].match(/^(TC-\d+)/)?.[1] || '';
      const isPassed = cells[1].includes('passed') || cells[1].includes('✅');
      const durStr = cells[2].replace('s', '');
      const duration = Math.round(parseFloat(durStr) * 1000); // ms
      if (tcId) {
        results.push({
          tc: tcId,
          status: isPassed ? 'passed' : 'failed',
          duration,
        });
      }
    }
  }

  return results;
}

// Create a new Qase test run
async function createRun(title: string, caseIds: number[]): Promise<number> {
  const response = await fetch(`${QASE_API}/run/${QASE_PROJECT}`, {
    method: 'POST',
    headers: {
      'Token': QASE_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      cases: caseIds,
      is_autotest: true,
    }),
  });

  const data = await response.json() as any;
  if (!data.status) throw new Error(`Failed to create run: ${JSON.stringify(data)}`);
  return data.result.id;
}

// Post bulk results to Qase
async function postResults(
  runId: number,
  results: Array<{ case_id: number; status: string; time_ms: number }>
): Promise<void> {
  const response = await fetch(`${QASE_API}/result/${QASE_PROJECT}/${runId}/bulk`, {
    method: 'POST',
    headers: {
      'Token': QASE_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ results }),
  });

  const data = await response.json() as any;
  if (!data.status) throw new Error(`Failed to post results: ${JSON.stringify(data)}`);
}

// Complete the run
async function completeRun(runId: number): Promise<void> {
  const response = await fetch(`${QASE_API}/run/${QASE_PROJECT}/${runId}/complete`, {
    method: 'POST',
    headers: {
      'Token': QASE_TOKEN!,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json() as any;
  if (!data.status) throw new Error(`Failed to complete run: ${JSON.stringify(data)}`);
}

// Main
async function main(): Promise<void> {
  console.log('\n🚀 Posting results to Qase...\n');

  const runFolder = findLatestRun();
  if (!runFolder) {
    console.error('❌ No evidence folder found. Run tests first.');
    process.exit(1);
  }

  console.log(`📁 Reading from: ${runFolder}`);

  const testResults = parseSummary(runFolder);
  if (testResults.length === 0) {
    console.error('❌ No test results found in summary.md');
    process.exit(1);
  }

  console.log(`📊 Found ${testResults.length} results\n`);

  // Build Qase results payload
  const qaseResults = testResults
    .filter(r => TC_TO_QASE[r.tc] !== undefined)
    .map(r => ({
      case_id: TC_TO_QASE[r.tc],
      status: r.status,
      time_ms: r.duration,
    }));

  const caseIds = qaseResults.map(r => r.case_id);
  const date = new Date().toISOString().split('T')[0];
  const runTitle = `Manual report — ${date}`;

  // Create run → post results → complete run
  process.stdout.write('⏳ Creating Qase test run...');
  const runId = await createRun(runTitle, caseIds);
  console.log(` ✅ Run #${runId} created`);

  process.stdout.write(`⏳ Posting ${qaseResults.length} results...`);
  await postResults(runId, qaseResults);
  console.log(` ✅ Done`);

  process.stdout.write('⏳ Completing run...');
  await completeRun(runId);
  console.log(` ✅ Done`);

  const passed = qaseResults.filter(r => r.status === 'passed').length;
  const failed = qaseResults.filter(r => r.status === 'failed').length;

  console.log(`\n✅ Qase test run #${runId} complete!`);
  console.log(`   Passed: ${passed} | Failed: ${failed}`);
  console.log(`   View at: https://app.qase.io/run/${QASE_PROJECT}/dashboard/${runId}\n`);
}

main();