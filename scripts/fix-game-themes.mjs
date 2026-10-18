#!/usr/bin/env node
// Re-theme all game pages: dark-theme text → light pastel theme
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const gamesDir = 'src/app/games';
const output = execSync(`find ${gamesDir} -name "page.tsx"`, { encoding: 'utf-8' }).trim().split('\n');
let changed = 0;

for (const file of output) {
  let src = fs.readFileSync(file, 'utf-8');
  let original = src;
  const hadGameBg = src.includes('GameBackground');

  // Remove GameBackground wrapper and import
  src = src.replace(/import GameBackground from '@\/components\/GameBackground';\n?/g, '');
  if (hadGameBg) {
    // Strip the opening <GameBackground> tag
    src = src.replace(/\s*<GameBackground>/g, '');
    // Strip the closing </GameBackground>
    src = src.replace(/<\/GameBackground>\s*/g, '\n');
  }

  // Dark text → light
  src = src
    .replace(/text-white\/80/g, 'text-pink-700/80')
    .replace(/text-white\/60/g, 'text-pink-700/60')
    .replace(/text-white\/50/g, 'text-pink-700/50')
    .replace(/text-white flex/g, 'text-pink-700 flex')
    .replace(/text-white mb-(\d)/g, 'text-pink-700 mb-$1')
    .replace(/text-white px-(\d)/g, 'text-pink-700 px-$1')
    .replace(/text-white text-([0-9]xl)/g, 'text-pink-700 text-$1')
    .replace(/text-white font-bold/g, 'text-pink-700 font-bold')
    .replace(/text-white font-black/g, 'text-pink-700 font-black')
    .replace(/text-white tracking-[\w-]+/g, 'text-pink-700 tracking-widest')
    .replace(/text-white text-sm/g, 'text-pink-700 text-sm')
    .replace(/text-white text-lg/g, 'text-pink-700 text-lg')
    .replace(/text-white text-2xl/g, 'text-pink-700 text-2xl')
    .replace(/text-white text-3xl/g, 'text-pink-700 text-3xl')
    .replace(/text-white text-4xl/g, 'text-pink-700 text-4xl')
    .replace(/text-white text-5xl/g, 'text-pink-700 text-5xl')
    .replace(/text-white text-xl/g, 'text-pink-700 text-xl')
    .replace(/text-white text-base/g, 'text-pink-700 text-base')
    .replace(/text-white text-xs/g, 'text-pink-700 text-xs')
    .replace(/text-white inline-flex/g, 'text-pink-700 inline-flex')
    .replace(/hover:text-white/g, 'hover:text-pink-500')
    .replace(/text-purple-300/g, 'text-purple-600')
    .replace(/text-pink-300(?![0-9])/g, 'text-pink-600');

  // Fix input fields: text-white on bg-pink-100 → text-pink-700
  src = src.replace(/(bg-pink-100 text-white)/g, 'bg-pink-100 text-pink-700');

  if (src !== original) {
    fs.writeFileSync(file, src);
    changed++;
  }
}

console.log(`Re-themed ${changed} game files`);
