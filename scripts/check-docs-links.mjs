#!/usr/bin/env node
// Simple docs consistency checks: relative links existence, changelog sync, Next.js version
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const includeRoots = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
];

const docsDir = path.join(root, 'docs');
const wikiDir = path.join(root, 'wiki');

function walk(dir, exts = new Set(['.md', '.mdx'])) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, exts));
    } else if (exts.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

const errors = [];

function stripCodeBlocks(s) {
  // Remove fenced code blocks ``` ... ``` and ```mdx ... ```
  return s.replace(/```[\s\S]*?```/g, '');
}

function checkLinks(file) {
  const content = stripCodeBlocks(read(file));
  const dir = path.dirname(file);
  const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
  let m;
  while ((m = linkRe.exec(content)) !== null) {
    const href = m[1].trim();
    if (!href || href.startsWith('#')) continue;
    if (href.startsWith('http://') || href.startsWith('https://')) continue;
    if (href.startsWith('mailto:') || href.startsWith('data:')) continue;
    // Treat site-absolute routes as OK
    if (href.startsWith('/')) continue;
    // Handle anchors
    const [relPath, anchor] = href.split('#');
    let candidate = path.resolve(dir, relPath || '.');
    if (!fs.existsSync(candidate)) {
      // Try extensionless Markdown paths (e.g., wiki links like user/guide)
      if (!path.extname(candidate) && fs.existsSync(candidate + '.md')) {
        candidate = candidate + '.md';
      }
    }
    if (!fs.existsSync(candidate)) {
      errors.push(`Missing link target: ${file.replace(root + '/', '')} -> ${href}`);
      continue;
    }
    if (anchor) {
      try {
        const base = fs.existsSync(candidate) ? candidate : candidate + '.md';
        const targetPath = fs.statSync(base).isDirectory()
          ? path.join(base, 'README.md')
          : base;
        const tcontent = stripCodeBlocks(read(targetPath));
        const headings = Array.from(tcontent.matchAll(/^#{1,6}\s+(.+)$/gm)).map(([, t]) => t.trim());
        const slug = (s) => s
          .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
          .toLowerCase()
          .replace(/[\s]+/g, '-')
          .replace(/[^a-z0-9\-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
        const anchors = new Set(headings.map(slug));
        if (!anchors.has(anchor.toLowerCase())) {
          // Try relaxed compare by removing punctuation from anchor
          const normAnchor = slug(anchor);
          if (!anchors.has(normAnchor)) {
            errors.push(`Missing anchor: ${file.replace(root + '/', '')} -> ${href}`);
          }
        }
      } catch {}
    }
  }
}

// 1) Relative links
const filesToCheck = [
  ...includeRoots.map((f) => path.join(root, f)).filter((f) => fs.existsSync(f)),
  ...fs.existsSync(docsDir) ? walk(docsDir) : [],
  ...fs.existsSync(wikiDir) ? walk(wikiDir) : [],
];
filesToCheck.forEach(checkLinks);

// 2) Changelog sync (top version)
try {
  const md = read(path.join(root, 'CHANGELOG.md'));
  const topMd = (md.match(/##\s*\[([0-9]+\.[0-9]+\.[0-9]+)\]/) || [])[1];
  const mdx = read(path.join(docsDir, 'changelog.mdx'));
  const topMdx = (mdx.match(/##[^\[]*\[v?([0-9]+\.[0-9]+\.[0-9]+)\]/) || [])[1];
  if (topMd && topMdx && topMd !== topMdx) {
    errors.push(`Changelog out of sync: CHANGELOG.md=${topMd} docs/changelog.mdx=${topMdx}`);
  }
} catch {}

// 3) Next.js version check (README vs package.json)
try {
  const pkg = JSON.parse(read(path.join(root, 'package.json')));
  const nextVersion = (pkg.dependencies && pkg.dependencies.next) || '';
  const major = (nextVersion.match(/^(\d+)/) || [])[1];
  if (major) {
    const readme = read(path.join(root, 'README.md'));
    if (!readme.includes(`Next.js ${major}`) && !readme.includes(`Next.js-${major}`)) {
      errors.push(`README Next.js version mismatch: expected ${major}`);
    }
  }
} catch {}

if (errors.length) {
  console.error('Docs check found issues:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
} else {
  console.log('Docs check passed ✅');
}
