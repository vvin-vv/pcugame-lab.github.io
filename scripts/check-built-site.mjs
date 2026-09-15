import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const origin = 'https://pcugame-lab.github.io';
const errors = [];
async function walk(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? walk(path.join(directory, entry.name))
    : entry.name.endsWith('.html') ? [path.join(directory, entry.name)] : []))).flat();
}
function descendants(node) {
  return [node, ...(node.childNodes ?? []).flatMap(descendants)];
}
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const hasClass = (node, name) => (attr(node, 'class') ?? '').split(/\s+/).includes(name);
const documents = new Map();
for (const file of await walk(root)) {
  const source = await readFile(file, 'utf8');
  const relative = path.relative(root, file);
  const url = '/' + relative.split(path.sep).join('/').replace(/index\.html$/, '');
  const tree = parse(source, {onParseError(error) {
    errors.push(`${url}: HTML ${error.code}`);
  }});
  documents.set(file, {url, nodes: descendants(tree)});
}
for (const {url, nodes} of documents.values()) {
  if (nodes.filter((node) => node.tagName === 'h1').length !== 1) errors.push(`${url}: h1은 한 개여야 합니다.`);
  for (const node of nodes) {
    const href = attr(node, 'href');
    if (node.tagName !== 'a' || !href) continue;
    const target = new URL(href, origin + url);
    if (target.origin !== origin) continue;
    const pathname = decodeURIComponent(target.pathname);
    const targetFile = path.join(root, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
    try { await access(targetFile); }
    catch { errors.push(`${url}: 내부 링크 대상이 없습니다: ${href}`); continue; }
    const targetDoc = documents.get(targetFile);
    if (target.hash && targetDoc && !targetDoc.nodes.some((item) => attr(item, 'id') === decodeURIComponent(target.hash.slice(1)))) {
      errors.push(`${url}: 링크 위치가 없습니다: ${href}`);
    }
    if (hasClass(node, 'next-project')) {
      if (target.pathname === url) errors.push(`${url}: 다음 항목이 현재 항목과 같습니다.`);
      if (target.pathname.split('/')[1] !== url.split('/')[1]) errors.push(`${url}: 다음 항목의 유형이 다릅니다.`);
    }
  }
  const kind = url === '/research/' ? 'research' : url === '/projects/' ? 'projects' : null;
  if (kind) {
    for (const card of nodes.filter((node) => hasClass(node, 'project-card'))) {
      const links = descendants(card).filter((node) => node.tagName === 'a').map((node) => attr(node, 'href'));
      if (links.some((href) => !href?.startsWith(`/${kind}/`) && !href?.startsWith('/people/'))) {
        errors.push(`${url}: 다른 유형의 활동 카드가 있습니다.`);
      }
    }
  }
}
if (!documents.size) errors.push('생성된 HTML이 없습니다.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`Built site validation passed (${documents.size} pages).`);
