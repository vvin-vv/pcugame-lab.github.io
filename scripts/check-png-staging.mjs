import { execFileSync } from 'node:child_process';

const staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { encoding: 'utf8' });
if (staged.split('\0').some((file) => /\.png$/i.test(file))) {
  console.error('PNG files are staged. Run npm run images:optimize, then stage the WebP files, references, and PNG deletions.');
  process.exitCode = 1;
}
