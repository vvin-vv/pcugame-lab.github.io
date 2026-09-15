import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { optimizeImages, replaceReferences } from '../scripts/optimize-images.mjs';

async function fixture(t) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'webp-test-'));
  t.after(() => rm(cwd, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q'], { cwd });
  await mkdir(path.join(cwd, 'public/images'), { recursive: true });
  const input = await sharp({ create: { width: 24, height: 16, channels: 4, background: '#ff000080' } }).png().toBuffer();
  await writeFile(path.join(cwd, 'public/images/사진.PNG'), input);
  await writeFile(path.join(cwd, 'README.md'), '![photo](/images/사진.PNG)');
  return { cwd, input };
}

test('converts untracked PNGs, preserves dimensions/alpha, updates references and is repeatable', async (t) => {
  const { cwd } = await fixture(t);
  await writeFile(path.join(cwd, '.gitignore'), 'ignored.png\n');
  await writeFile(path.join(cwd, 'ignored.png'), 'not an image');
  const changeList = path.join(cwd, 'changes.list');
  await optimizeImages(cwd, { changeList });
  assert.deepEqual((await readFile(changeList, 'utf8')).split('\0'),
    ['public/images/사진.PNG', 'public/images/사진.webp', 'README.md', '']);
  await assert.rejects(access(path.join(cwd, 'public/images/사진.PNG')));
  const metadata = await sharp(path.join(cwd, 'public/images/사진.webp')).metadata();
  assert.equal(metadata.width, 24);
  assert.equal(metadata.height, 16);
  assert.equal(metadata.hasAlpha, true);
  assert.equal(await readFile(path.join(cwd, 'README.md'), 'utf8'), '![photo](/images/사진.webp)');
  assert.deepEqual(await optimizeImages(cwd), []);
});

test('a corrupt input leaves all originals and references intact', async (t) => {
  const { cwd, input } = await fixture(t);
  await writeFile(path.join(cwd, 'z-invalid.png'), 'invalid');
  await assert.rejects(optimizeImages(cwd));
  assert.deepEqual(await readFile(path.join(cwd, 'public/images/사진.PNG')), input);
  await assert.rejects(access(path.join(cwd, 'public/images/사진.webp')));
  assert.equal(await readFile(path.join(cwd, 'README.md'), 'utf8'), '![photo](/images/사진.PNG)');
});

test('never overwrites existing WebP or silently flattens APNG', async (t) => {
  const { cwd, input } = await fixture(t);
  const target = path.join(cwd, 'public/images/사진.webp');
  await writeFile(target, 'existing asset');
  await assert.rejects(optimizeImages(cwd), /already exists/);
  assert.equal(await readFile(target, 'utf8'), 'existing asset');
  await rm(target);
  // Insert an acTL chunk marker after the PNG signature to exercise the guard.
  const chunk = Buffer.alloc(20);
  chunk.writeUInt32BE(8);
  chunk.write('acTL', 4);
  await writeFile(path.join(cwd, 'public/images/사진.PNG'), Buffer.concat([input.subarray(0, 8), chunk, input.subarray(8)]));
  await assert.rejects(optimizeImages(cwd), /Animated PNG/);
  await access(path.join(cwd, 'public/images/사진.PNG'));
});

test('rewrites full local paths including query/hash without changing remote URLs or other filenames', () => {
  const input = '"/images/photo.png?v=2" url(../public/images/photo.png#x) "https://host/images/photo.png" "//host/images/photo.png" "/images/photo.png.backup" "/images/other-photo.png"';
  assert.equal(replaceReferences(input, 'src/site.css', [{ source: 'public/images/photo.png' }]),
    '"/images/photo.webp?v=2" url(../public/images/photo.webp#x) "https://host/images/photo.png" "//host/images/photo.png" "/images/photo.png.backup" "/images/other-photo.png"');
});

test('commit guard checks the staged snapshot including Unicode filenames', async (t) => {
  const { cwd } = await fixture(t);
  const guard = path.resolve('scripts/check-png-staging.mjs');
  execFileSync(process.execPath, [guard], { cwd });
  execFileSync('git', ['add', '.'], { cwd });
  assert.throws(() => execFileSync(process.execPath, [guard], { cwd, stdio: 'pipe' }));
  await optimizeImages(cwd);
  // Worktree conversion alone must not allow the staged original through.
  assert.throws(() => execFileSync(process.execPath, [guard], { cwd, stdio: 'pipe' }));
  execFileSync('git', ['add', '-A'], { cwd });
  execFileSync(process.execPath, [guard], { cwd });
});
