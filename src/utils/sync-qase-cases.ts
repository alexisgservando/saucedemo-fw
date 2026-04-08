import * as dotenv from 'dotenv';
import { LINEAR_ISSUES, QASE_TO_TC } from './test-data';

dotenv.config();

const TOKEN        = process.env.QASE_TESTOPS_API_TOKEN;
const QASE_API     = 'https://api.qase.io/v1';
const QASE_PROJECT = 'STA';

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

  // Map title → case ID for existing cases
  const existing = new Map<string, number>();
  for (const c of data.result.entities) {
    existing.set(c.title.trim(), c.id);
  }
  return existing;
}

// Create a new case in Qase
async function createCase(
  title: string,
  suiteId: number
): Promise<number> {
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
        type:      2, // functional
        priority:  2, // medium
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

  // All TC IDs we know about
  const allTCs = Object.values(QASE_TO_TC);

  // Fetch what already exists in Qase
  process.stdout.write('⏳ Fetching existing Qase cases...');
  const existing = await fetchExistingCases();
  console.log(` ✅ Found ${existing.size} existing cases`);

  // Existing Qase case IDs (reverse lookup)
  const existingQaseIds = new Set(Object.keys(QASE_TO_TC).map(Number));

  const created: Array<{ tc: string; qaseId: number; title: string }> = [];
  const skipped: Array<{ tc: string; qaseId: number }> = [];

  for (const tc of allTCs) {
    // Check if TC already has a Qase ID in test-data.ts
    const existingId = Object.entries(QASE_TO_TC).find(([, v]) => v === tc)?.[0];
    if (existingId && existingQaseIds.has(Number(existingId))) {
      skipped.push({ tc, qaseId: Number(existingId) });
      continue;
    }

    // TC not in Qase yet — create it
    const title   = buildTitle(tc);
    const suiteId = getSuiteId(tc);

    process.stdout.write(`⏳ Creating ${tc} in Qase...`);
    const newId = await createCase(title, suiteId);
    created.push({ tc, qaseId: newId, title });
    console.log(` ✅ Created as STA-${newId}`);
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
    console.log('   2. Update QASE_TO_TC in src/utils/test-data.ts with the new IDs');
  } else {
    console.log('\n✅ All test cases already exist in Qase — nothing to create.');
  }

  console.log('');
}

main();