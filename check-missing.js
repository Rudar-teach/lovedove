const fs = require('fs');
const games = fs.readFileSync('C:/Users/hp omen/Downloads/project/lovedove/src/app/games/page.tsx', 'utf8');
const slugs = [...games.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const dirs = fs.readdirSync('C:/Users/hp omen/Downloads/project/lovedove/src/app/games').filter(d =>
  fs.existsSync('C:/Users/hp omen/Downloads/project/lovedove/src/app/games/' + d + '/page.tsx')
);
const missing = slugs.filter(s => !dirs.includes(s));
const extra = dirs.filter(d => !slugs.includes(d));
console.log('Total slugs in games page:', slugs.length);
console.log('Existing folders:', dirs.length);
console.log('Missing folders:', missing.length);
if (missing.length) console.log('MISSING:', missing.join('\n'));
if (extra.length) console.log('EXTRA (not referenced):', extra.join('\n'));
