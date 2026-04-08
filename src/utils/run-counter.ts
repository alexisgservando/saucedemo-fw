import fs from 'fs';
import path from 'path';

// ✅ ALWAYS stable in Playwright
const PROJECT_ROOT = process.cwd();

// Artifacts
const BASE_DIR = path.resolve(__dirname, '../../evidence');

// Persistent state
const COUNTER_DIR = path.join(PROJECT_ROOT, '.run-state');
const CURRENT_FILE = path.join(COUNTER_DIR, '.current-run-folder');

function getCounterFile(date: string): string {
  return path.join(COUNTER_DIR, `.run-number-${date}`);
}

export function getNextRunFolder(): string {
  const date = new Date().toISOString().split('T')[0];
  const basePath = path.join(BASE_DIR, date);
  const counterFile = getCounterFile(date);

  fs.mkdirSync(basePath, { recursive: true });
  fs.mkdirSync(COUNTER_DIR, { recursive: true });

  let runNumber = 0;

  try {
    const raw = fs.readFileSync(counterFile, 'utf-8').trim();
    runNumber = parseInt(raw, 10);
    if (isNaN(runNumber)) runNumber = 0;
  } catch {
    runNumber = 0;
  }

  runNumber += 1;

  fs.writeFileSync(counterFile, String(runNumber), { flag: 'w' });

  console.log(`🔢 Run number (FINAL): ${runNumber}`);
  console.log(`📄 Counter file path: ${counterFile}`);

  return path.join(basePath, `run-${runNumber}`);
}

export function getCurrentRunFolder(): string {
  try {
    return fs.readFileSync(CURRENT_FILE, 'utf-8').trim();
  } catch {
    return path.join(
      BASE_DIR,
      new Date().toISOString().split('T')[0],
      'run-1'
    );
  }
}

export function setCurrentRunFolder(folder: string): void {
  fs.mkdirSync(COUNTER_DIR, { recursive: true });
  fs.writeFileSync(CURRENT_FILE, folder, { flag: 'w' });
}