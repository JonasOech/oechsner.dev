/**
 * Compiles `resume-web-en.tex` into `static/resume-en.pdf`.
 *
 * `resume.tex` and `resume-web-en.tex` are symlinks into the resume's real home
 * (authored alongside `resume-en.tex`/`resume-de.tex`, the employer-facing drivers that
 * are never published here). The `-web-` driver defines `\WEBSITECV`, which redacts the
 * street address and phone number from the header — see the `\bw{full}{website}` macro
 * in `resume.tex` — so the PDF this site links to never leaks contact details that
 * `resume-en.pdf`/`resume-de.pdf` (sent directly to employers) still carry.
 *
 * Run this locally whenever the resume changes, then commit the PDF — Cloudflare's Pages
 * build image has no LaTeX toolchain, so this cannot run in CI.
 *
 *   npm run cv
 */
import { execFileSync } from 'node:child_process';
import { renameSync, rmSync, existsSync } from 'node:fs';

const OUT_DIR = 'static';
const SOURCE = 'resume-web-en';
const FINAL = `${OUT_DIR}/resume-en.pdf`;

try {
	// Twice, so `tabularx` column widths settle.
	for (let pass = 0; pass < 2; pass++) {
		execFileSync(
			'pdflatex',
			[
				'-interaction=nonstopmode',
				'-halt-on-error',
				`-output-directory=${OUT_DIR}`,
				`${SOURCE}.tex`
			],
			{ stdio: 'pipe' }
		);
	}
} catch (err) {
	console.error('pdflatex failed. Is a LaTeX distribution (MiKTeX/TeX Live) on your PATH?');
	if (err.stdout) console.error(err.stdout.toString().split('\n').slice(-25).join('\n'));
	process.exit(1);
}

renameSync(`${OUT_DIR}/${SOURCE}.pdf`, FINAL);
for (const ext of ['aux', 'log', 'out']) {
	const junk = `${OUT_DIR}/${SOURCE}.${ext}`;
	if (existsSync(junk)) rmSync(junk, { force: true });
}

console.log(`Wrote ${FINAL}`);
