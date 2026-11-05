import json, io, os
base = r'C:\Users\hp omen\Downloads\project\lovedove\.claude\worktrees\eloquent-newton-856d11'
pairs = json.load(open(os.path.join(base, '.claude-tmp/only_games.json'), encoding='utf-8'))
entries = ''.join(f"  '{k}': '{v.replace(chr(39), chr(92)+chr(39))}',\n" for k, v in pairs)

p = os.path.join(base, 'src/components/games/GlobalPlayWithFriend.tsx')
s = io.open(p, encoding='utf-8').read()

addition = (
    "\n// Games that exist ONLY in the /games/[slug] catch-all page (no\n"
    "// dedicated directory, not in STATIC_GAMES or the bollywood data).\n"
    "const CATCHALL_GAME_NAMES: Record<string, string> = {\n"
    + entries +
    "};\n"
)
marker = "\nconst PICK_KEY = 'ld_friend_pick';\n"
assert marker in s, "PICK_KEY marker not found"
# insert after the DEDICATED_GAME_NAMES block closing brace, before PICK_KEY
s = s.replace(marker, addition + marker, 1)

old_logic = """    const dedicatedName = DEDICATED_GAME_NAMES[slug];
    if (!staticGame && !bolly && !dedicatedName) {"""
new_logic = """    const catchallName = CATCHALL_GAME_NAMES[slug];
    const dedicatedName = DEDICATED_GAME_NAMES[slug];
    if (!staticGame && !bolly && !dedicatedName && !catchallName) {"""
assert old_logic in s, "activation logic not found"
s = s.replace(old_logic, new_logic, 1)

old_name = "setGameName(staticGame?.name || bolly?.name || dedicatedName || 'Game');"
new_name = "setGameName(staticGame?.name || bolly?.name || dedicatedName || catchallName || 'Game');"
assert old_name in s, "name line not found"
s = s.replace(old_name, new_name, 1)

io.open(p, 'w', encoding='utf-8').write(s)
print('inserted', len(pairs), 'catch-all names')
