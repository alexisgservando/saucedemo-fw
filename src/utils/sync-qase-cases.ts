import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { LINEAR_ISSUES, QASE_TO_TC } from './test-data';

dotenv.config();

const TOKEN        = process.env.QASE_TESTOPS_API_TOKEN;
const QASE_API     = 'https://api.qase.io/v1';
const QASE_PROJECT = 'STA';
const TEST_DATA_PATH = path.join(__dirname, 'test-data.ts');

if (!TOKEN) {
  console.error('❌ QASE_TESTOPS_API_TOKEN not found in .env file');
  process.exit(1);
}

// Suite ID mapping — matches Qase project STA
const SUITE_MAP: Record<string, number> = {
  'SAU-7':  1, // Login
  'SAU-8':  1, // Login
  'SAU-9':  1, // Login
  'SAU-10': 2, // Inventory
  'SAU-11': 3, // Checkout
};

// TC → suite ID lookup
function getSuiteId(tc: string): number {
  for (const issue of LINEAR_ISSUES) {
    if (issue.tcs.includes(tc)) {
      return SUITE_MAP[issue.id] || 1;
    }
  }
  return 1;
}

// Auto-update QASE_TO_TC in test-data.ts
function updateTestDataFile(qaseId: number, tcId: string): void {
  const content = fs.readFileSync(TEST_DATA_PATH, 'utf-8');

  // Check if mapping already exists — idempotent guard
  if (content.includes(`${qaseId}: '${tcId}'`) || content.includes(`${qaseId}: "${tcId}"`)) {
    console.log(`   ℹ️  QASE_TO_TC already contains ${qaseId} → ${tcId} — skipping`);
    return;
  }

  // Find the closing brace of QASE_TO_TC block
  // Pattern: find "export const QASE_TO_TC" then find its closing "};"
  const qaseToTcStart = content.indexOf('export const QASE_TO_TC');
  if (qaseToTcStart === -1) {
    console.error('   ❌ Could not find QASE_TO_TC in test-data.ts — update manually');
    return;
  }

  // Find the closing "};" after QASE_TO_TC
  const closingBrace = content.indexOf('};', qaseToTcStart);
  if (closingBrace === -1) {
    console.error('   ❌ Could not find closing brace of QASE_TO_TC — update manually');
    return;
  }

  // Insert new entry before closing brace
  const newEntry = `  ${qaseId}: '${tcId}',\n`;
  const updated  = content.slice(0, closingBrace) + newEntry + content.slice(closingBrace);

  fs.writeFileSync(TEST_DATA_PATH, updated, 'utf-8');
  console.log(`   ✅ Updated QASE_TO_TC in test-data.ts: ${qaseId} → ${tcId}`);
}

// Fetch all existing cases from Qase
async function fetchExistingCases(): Promise<Map<string, number>> {
  const response = await fetch(
    `${QASE_API}/case/${QASE_PROJECT}?limit=100`,
    {
      headers: {
        'Token': TOKEN!,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json() as any;
  if (!data.status) throw new Error(`Failed to fetch cases: ${JSON.stringify(data)}`);

  const existing = new Map<string, number>();
  for (const c of data.result.entities) {
    existing.set(c.title.trim(), c.id);
  }
  return existing;
}

// Create a new case in Qase
async function createCase(title: string, suiteId: number): Promise<number> {
  const response = await fetch(
    `${QASE_API}/case/${QASE_PROJECT}`,
    {
      method: 'POST',
      headers: {
        'Token': TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        suite_id: suiteId,
        type:     2, // functional
        priority: 2, // medium
      }),
    }
  );

  const data = await response.json() as any;
  if (!data.status) throw new Error(`Failed to create case: ${JSON.stringify(data)}`);
  return data.result.id;
}

// Build TC title from TC ID and Linear issue
function buildTitle(tc: string): string {
  for (const issue of LINEAR_ISSUES) {
    if (issue.tcs.includes(tc)) {
      const index = issue.tcs.indexOf(tc);
      if (issue.tcs.length === 1) return issue.title;
      return `${issue.title} — scenario ${index + 1}`;
    }
  }
  return tc;
}

// Main
async function main(): Promise<void> {
  console.log('\n🚀 Syncing test cases to Qase...\n');

  const allTCs = Object.values(QASE_TO_TC);

  process.stdout.write('⏳ Fetching existing Qase cases...');
  const existing = await fetchExistingCases();
  console.log(` ✅ Found ${existing.size} existing cases`);

  const existingQaseIds = new Set(Object.keys(QASE_TO_TC).map(Number));

  const created: Array<{ tc: string; qaseId: number; title: string }> = [];
  const skipped: Array<{ tc: string; qaseId: number }> = [];

  for (const tc of allTCs) {
    const existingId = Object.entries(QASE_TO_TC).find(([, v]) => v === tc)?.[0];
    if (existingId && existingQaseIds.has(Number(existingId))) {
      skipped.push({ tc, qaseId: Number(existingId) });
      continue;
    }

    const title   = buildTitle(tc);
    const suiteId = getSuiteId(tc);

    process.stdout.write(`⏳ Creating ${tc} in Qase...`);
    const newId = await createCase(title, suiteId);
    created.push({ tc, qaseId: newId, title });
    console.log(` ✅ Created as STA-${newId}`);

    // Auto-update test-data.ts
    updateTestDataFile(newId, tc);
  }

  console.log('\n--- SUMMARY ---\n');

  if (skipped.length > 0) {
    console.log(`✅ Already in Qase (${skipped.length}):`);
    for (const s of skipped) {
      console.log(`   ${s.tc} → STA-${s.qaseId}`);
    }
  }

  if (created.length > 0) {
    console.log(`\n🆕 Newly created (${created.length}):`);
    for (const c of created) {
      console.log(`   ${c.tc} → STA-${c.qaseId} — "${c.title}"`);
      console.log(`   Add to spec: qase.id(${c.qaseId});`);
    }
    console.log('\n⚠️  Remember to:');
    console.log('   1. Add the qase.id(N) annotations above to your spec files');
    console.log('   ✅ QASE_TO_TC in test-data.ts updated automatically');
  } else {
    console.log('\n✅ All test cases already exist in Qase — nothing to create.');
  }

  console.log('');
}

main();