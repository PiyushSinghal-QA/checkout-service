#!/usr/bin/env node
/**
 * Turns this repo into: `main` (clean) + 5 `bug/*` branches, each introducing one
 * reproducible defect. The checkout-e2e suite catches them; AutoFix fixes them.
 * Rebuilds from scratch each run (deterministic), pinning LF endings.
 *
 *   npm run seed:bugs
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { readFileSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (cmd) => execSync(`git ${cmd}`, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

const TEXT_EXT = new Set(['.ts', '.js', '.mjs', '.json', '.md', '.css', '.html', '.yml']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage']);
function normalize(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.git')) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP.has(e.name)) normalize(full); }
    else if (TEXT_EXT.has(extname(e.name))) {
      const o = readFileSync(full, 'utf8'); const lf = o.replace(/\r\n/g, '\n');
      if (lf !== o) writeFileSync(full, lf);
    }
  }
}
function edit(rel, edits) {
  const full = join(repo, rel);
  let c = readFileSync(full, 'utf8').replace(/\r\n/g, '\n');
  for (const { find, replace } of edits) {
    if (!c.includes(find)) throw new Error(`seed snippet not found in ${rel}:\n${find}`);
    c = c.replace(find, replace);
  }
  writeFileSync(full, c);
}

const BUGS = [
  {
    id: 'null-check', message: 'checkout: drop cart null-guard (regression)',
    files: [{ path: 'src/checkout/checkout.service.ts', edits: [
      { find: 'const cart = this.carts.find(dto.cartId);', replace: 'const cart = this.carts.find(dto.cartId)!;' },
      { find: '    if (!cart) {\n      throw new NotFoundException(`Cart ${dto.cartId} not found`);\n    }\n', replace: '' },
    ] }],
  },
  {
    id: 'typo', message: 'checkout: rename total field',
    files: [{ path: 'src/checkout/checkout.service.ts', edits: [
      { find: 'formattedTotal: formatMoney(total),', replace: 'formatedTotal: formatMoney(total),' },
    ] }],
  },
  {
    id: 'wrong-import', message: 'pricing: switch tax source',
    files: [{ path: 'src/pricing/pricing.service.ts', edits: [
      { find: "import { calcTax } from './tax';", replace: "import { calcTax } from './tax.legacy';" },
    ] }],
  },
  {
    id: 'missing-validation', message: 'app: simplify module providers',
    files: [{ path: 'src/app.module.ts', edits: [
      { find: "import { Module, ValidationPipe } from '@nestjs/common';", replace: "import { Module } from '@nestjs/common';" },
      { find: "import { APP_PIPE } from '@nestjs/core';\n", replace: '' },
      { find:
        '  providers: [\n' +
        '    // Global input-validation guard. Bug branch `bug/missing-validation` removes it.\n' +
        '    {\n' +
        '      provide: APP_PIPE,\n' +
        '      useValue: new ValidationPipe({\n' +
        '        whitelist: true,\n' +
        '        transform: true,\n' +
        '        forbidNonWhitelisted: false,\n' +
        '      }),\n' +
        '    },\n' +
        '  ],\n',
        replace: '' },
    ] }],
  },
  {
    id: 'unhandled-error', message: 'checkout: inline payment charge',
    files: [{ path: 'src/checkout/checkout.service.ts', edits: [
      { find:
        '    let receipt;\n' +
        '    try {\n' +
        '      receipt = await this.payment.charge({ amount: total, customer: dto.customer });\n' +
        '    } catch (err) {\n' +
        '      throw new BadRequestException(`Payment failed: ${(err as Error).message}`);\n' +
        '    }',
        replace: '    const receipt = await this.payment.charge({ amount: total, customer: dto.customer });' },
    ] }],
  },
];

normalize(repo);
if (existsSync(join(repo, '.git'))) rmSync(join(repo, '.git'), { recursive: true, force: true });
writeFileSync(join(repo, '.gitattributes'), '* text=auto eol=lf\n');
git('init -b main');
git('config core.autocrlf false');
try { if (!git('config user.name').trim()) throw 0; } catch { git('config user.name "Piyush Singhal"'); git('config user.email "piyush@example.com"'); }
git('add -A');
git('commit -m "checkout-service: REST API + storefront UI"');
console.log('• committed clean baseline on main');
for (const bug of BUGS) {
  git(`checkout -B bug/${bug.id} main`);
  for (const f of bug.files) edit(f.path, f.edits);
  git('add -A');
  git(`commit -m ${JSON.stringify(bug.message)}`);
  console.log(`• built branch bug/${bug.id}`);
}
git('checkout main');
console.log('\nSeed complete:\n' + git('branch --list').trim());
