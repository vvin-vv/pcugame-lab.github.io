import { execFileSync } from 'node:child_process';
import { lstat, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const textExtensions = /\.(?:md|mdx|astro|html|css|scss|js|mjs|cjs|jsx|ts|tsx|json|ya?ml|svg|txt)$/i;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function replaceReferences(text, file, images) {
  for (const { source } of images) {
    const relative = path.posix.relative(path.posix.dirname(file), source);
    const aliases = new Set([relative, `./${relative}`]);
    if (source.startsWith('public/')) aliases.add(`/${source.slice(7)}`);
    for (const alias of [...aliases].sort((a, b) => b.length - a.length)) {
      // Require a complete local path: leave remote URLs and longer filenames alone.
      const pattern = new RegExp(`(^|[\\s"'\x60(=<>])(${escapeRegex(alias)})(?=$|[\\s"'\x60)<>?#,])`, 'gm');
      text = text.replace(pattern, (_, prefix, match) => `${prefix}${match.replace(/\.png$/i, '.webp')}`);
    }
  }
  return text;
}

function isAnimatedPng(buffer) {
  for (let offset = 8; offset + 12 <= buffer.length;) {
    if (buffer.toString('ascii', offset + 4, offset + 8) === 'acTL') return true;
    offset += buffer.readUInt32BE(offset) + 12;
  }
  return false;
}

export async function optimizeImages(cwd = process.cwd(), { changeList } = {}) {
  const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd, encoding: 'utf8' });
  const files = [];
  for (const file of new Set(listed.split('\0').filter(Boolean))) {
    const stat = await lstat(path.join(cwd, file)).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
    if (stat?.isFile()) files.push(file);
  }

  const images = [];
  // Prepare and decode every output before changing any source or reference.
  for (const source of files.filter((file) => /\.png$/i.test(file))) {
    const target = source.replace(/\.png$/i, '.webp');
    const exists = await lstat(path.join(cwd, target)).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
    if (exists || images.some((image) => image.target === target)) {
      throw new Error(`WebP destination already exists: ${target}. Resolve the collision first.`);
    }
    const input = await readFile(path.join(cwd, source));
    if (isAnimatedPng(input)) throw new Error(`Animated PNG requires manual conversion: ${source}`);
    const metadata = await sharp(input, { failOn: 'warning' }).metadata();
    if (metadata.format !== 'png') throw new Error(`Not a PNG image: ${source}`);
    const output = await sharp(input, { failOn: 'warning' })
      .webp({ quality: 82, alphaQuality: 100, effort: 4 }).toBuffer();
    const { info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });
    if (info.width !== metadata.width || info.height !== metadata.height) {
      throw new Error(`Image dimensions changed: ${source}`);
    }
    images.push({ source, target, output, originalSize: input.length });
  }

  const edits = [];
  if (images.length) {
    for (const file of files.filter((file) => textExtensions.test(file))) {
      const before = await readFile(path.join(cwd, file), 'utf8');
      const after = replaceReferences(before, file, images);
      if (after !== before) edits.push({ file, before, after });
    }
  }
  const written = [];
  const updated = [];
  try {
    for (const image of images) {
      await writeFile(path.join(cwd, image.target), image.output, { flag: 'wx' });
      written.push(image.target);
    }
    for (const edit of edits) {
      updated.push(edit);
      await writeFile(path.join(cwd, edit.file), edit.after);
    }
  } catch (error) {
    for (const edit of updated) await writeFile(path.join(cwd, edit.file), edit.before);
    for (const file of written) await unlink(path.join(cwd, file));
    throw error;
  }
  for (const image of images) {
    await unlink(path.join(cwd, image.source));
    console.log(`${image.source} → ${image.target}: ${image.originalSize} → ${image.output.length} bytes`);
  }
  if (changeList) {
    const changed = [...images.flatMap(({ source, target }) => [source, target]), ...edits.map(({ file }) => file)];
    await writeFile(changeList, changed.length ? `${changed.join('\0')}\0` : '');
  }
  console.log(`Converted ${images.length} PNG image(s); updated ${edits.length} reference file(s).`);
  return images;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  optimizeImages(process.cwd(), { changeList: process.env.IMAGE_CHANGE_LIST }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
