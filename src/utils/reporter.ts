import type {
    Reporter,
    FullConfig,
    Suite,
    TestCase,
    TestResult,
    FullResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { getNextRunFolder, setCurrentRunFolder } from './run-counter';
import { LINEAR_ISSUES } from './test-data';


class LinearReporter implements Reporter {
    private initialized = false;
    private runFolder: string = '';
    private results: Array<{ title: string; status: string; duration: number }> = [];
    private startTime: Date = new Date();

    onBegin(config: FullConfig, suite: Suite): void {
        if (this.initialized) return;
        this.initialized = true;

        this.runFolder = getNextRunFolder();
        this.startTime = new Date();

        fs.mkdirSync(path.join(this.runFolder, 'screenshots'), { recursive: true });

        setCurrentRunFolder(this.runFolder);
        process.env.RUN_FOLDER = this.runFolder;

        console.log(`\n📁 Evidence folder: ${this.runFolder}`);
        console.log(`🚀 Running ${suite.allTests().length} tests...\n`);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        const status = result.status === 'passed' ? '✅' : '❌';
        const duration = (result.duration / 1000).toFixed(1);
        this.results.push({
            title: test.title,
            status: result.status,
            duration: result.duration,
        });
        console.log(`${status} ${test.title} (${duration}s)`);
    }

    onEnd(result: FullResult): void {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const total = this.results.length;
        const duration = ((Date.now() - this.startTime.getTime()) / 1000).toFixed(1);
        const date = new Date().toISOString().split('T')[0];

        const lines: string[] = [
            `# Test Execution Summary`,
            ``,
            `**Date:** ${date}`,
            `**Framework:** Playwright + TypeScript`,
            `**Environment:** https://www.saucedemo.com`,
            `**Browser:** Chromium`,
            ``,
            `## Results`,
            ``,
            `| Metric | Value |`,
            `|--------|-------|`,
            `| Total  | ${total} |`,
            `| Passed | ${passed} |`,
            `| Failed | ${failed} |`,
            `| Duration | ${duration}s |`,
            `| Status | ${failed === 0 ? '✅ ALL PASSED' : '❌ FAILURES FOUND'} |`,
            ``,
            `## Test Cases`,
            ``,
            `| Test | Status | Duration |`,
            `|------|--------|----------|`,
        ];

        for (const r of this.results) {
            const icon = r.status === 'passed' ? '✅' : '❌';
            lines.push(`| ${r.title} | ${icon} ${r.status} | ${(r.duration / 1000).toFixed(1)}s |`);
        }

        lines.push(``);
        lines.push(`## Linear Issues`);
        lines.push(``);
        lines.push(`| Issue | Title | Test Cases |`);
        lines.push(`|-------|-------|------------|`);
        for (const issue of LINEAR_ISSUES) {
            lines.push(`| ${issue.id} | ${issue.title} | ${issue.tcs.join(', ')} |`);
        }
        lines.push(``);
        lines.push(`## Evidence`);
        lines.push(``);
        lines.push(`Screenshots per step: \`${this.runFolder}/screenshots/\``);

        // Save summary.md at run root
        const summaryPath = path.join(this.runFolder, 'summary.md');
        fs.writeFileSync(summaryPath, lines.join('\n'));

        console.log(`\n📊 Summary: ${summaryPath}`);
        console.log(`📸 Screenshots: ${this.runFolder}/screenshots/`);
        console.log(`\n${failed === 0 ? '✅' : '❌'} ${passed}/${total} passed in ${duration}s\n`);
    }
}

export default LinearReporter;