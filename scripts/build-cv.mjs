/**
 * Compiles `resume.tex` into `static/resume-en.pdf`.
 *
 * Run this locally whenever the resume changes, then commit the PDF — Cloudflare's Pages
 * build image has no LaTeX toolchain, so this cannot run in CI.
 *
 *   npm run cv
 */
import { execFileSync } from 'node:child_process';
import { renameSync, rmSync, existsSync } from 'node:fs';

const OUT_DIR = 'static';
const FINAL = `${OUT_DIR}/resume-en.pdf`;

try {
	// Twice, so `tabularx` column widths settle.
	for (let pass = 0; pass < 2; pass++) {
		execFileSync(
			'pdflatex',
			['-interaction=nonstopmode', '-halt-on-error', `-output-directory=${OUT_DIR}`, 'resume.tex'],
			{ stdio: 'pipe' }
		);
	}
} catch (err) {
	console.error('pdflatex failed. Is a LaTeX distribution (MiKTeX/TeX Live) on your PATH?');
	if (err.stdout) console.error(err.stdout.toString().split('\n').slice(-25).join('\n'));
	process.exit(1);
}

renameSync(`${OUT_DIR}/resume.pdf`, FINAL);
for (const ext of ['aux', 'log', 'out']) {
	const junk = `${OUT_DIR}/resume.${ext}`;
	if (existsSync(junk)) rmSync(junk, { force: true });
}

console.log(`Wrote ${FINAL}`);
