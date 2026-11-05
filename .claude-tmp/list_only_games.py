import re, os, json, sys
base = r'C:\Users\hp omen\Downloads\project\lovedove\.claude\worktrees\eloquent-newton-856d11'
src = open(os.path.join(base, 'src/app/games/[slug]/page.tsx'), encoding='utf-8').read()
lines = src.split('\n')
start = next(i for i, l in enumerate(lines) if 'const gameData' in l)
end = next(i for i, l in enumerate(lines) if i > start and l.strip() == '};')
catalog = {}
for l in lines[start:end+1]:
    m = re.match(r"\s*([A-Za-z0-9_]+):\s*\{\s*name:\s*", l)
    if not m:
        continue
    key = m.group(1)
    rest = l[l.index('name:') + 5:].lstrip()
    if not (rest.startswith("'") or rest.startswith('"')):
        continue
    quote = rest[0]
    i = 1
    while i < len(rest):
        if rest[i] == chr(92):  # backslash
            i += 2
            continue
        if rest[i] == quote:
            break
        i += 1
    catalog[key] = rest[1:i]

dedicated = set()
gdir = os.path.join(base, 'src/app/games')
for p in os.listdir(gdir):
    if p in ('[slug]', 'bollywood'):
        continue
    if os.path.isdir(os.path.join(gdir, p)):
        dedicated.add(p)

static_slugs = set(re.findall(r"slug:\s*'([\w-]+)'", open(os.path.join(base, 'src/lib/staticGames.ts'), encoding='utf-8').read()))
bolly_slugs = set(re.findall(r"slug:\s*'([\w-]+)'", open(os.path.join(base, 'src/lib/bollywoodGames.ts'), encoding='utf-8').read()))

only = {k: v for k, v in catalog.items() if k not in dedicated and k not in static_slugs and k not in bolly_slugs}
print(f'gameData total: {len(catalog)} | catch-all-only: {len(only)}')
for k, v in sorted(only.items()):
    print(f'  {k!r}: {v!r},')
with open(os.path.join(base, '.claude-tmp/only_games.json'), 'w', encoding='utf-8') as f:
    json.dump(sorted(only.items()), f)
