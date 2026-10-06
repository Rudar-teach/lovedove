import os

base = r'C:\Users\hp omen\Downloads\project\lovedove\src\app\games'

targets = [
    'couple_word_search', 'couple_word_search2', 'couplecharades', 'couplescramble',
    'emojistory', 'heartcolors', 'heartmatch', 'heartrhythm', 'hearts', 'heartspelling',
    'love_emoji2', 'love_word_scramble', 'love_scramble2',
    'couplegolfs', 'flappyheart', 'game2048', 'heartpuzzle', 'kissinggame', 'lovemaze',
    'lovesequences', 'memory', 'numberguess', 'pong', 'puzzlelove', 'rockpaperscissors',
    'snake', 'tictactoe', 'wordchain',
    'love_dares2', 'love_dares', 'love_truths', 'couple_truths', 'love_challenges',
    'lovewheel', 'love_wheel', 'love_horoscope', 'future_together', 'truthordare',
    'couple_goals2', 'couple_goals_2',
    'couple_drawing', 'couple_poetry', 'love_achievements', 'love_resolutions',
    'love_story_builder', 'love_word_search2', 'lovewordsearch', 'lovebingo', 'love_bingo',
    'relationshipbingo', 'loveletters', 'love_letter',
    'love_countdown', 'lovecalculator', 'romantic_calculator', 'couple_playlist',
    'couple_music_quiz',
]

results = []
for t in targets:
    p = os.path.join(base, t, 'page.tsx')
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
        count = len(lines)
        content = ''.join(lines)
        is_stub = False
        if count < 200:
            has_useState = 'useState' in content
            has_useEffect = 'useEffect' in content
            has_game_logic = has_useState or has_useEffect or 'score' in content.lower() or 'player' in content.lower() or 'turn' in content.lower() or 'answer' in content.lower() or 'question' in content.lower() or 'dare' in content.lower() or 'truth' in content.lower() or 'letter' in content.lower() or 'poem' in content.lower() or 'color' in content.lower() or 'math' in content.lower()
            if not has_game_logic or count < 50:
                is_stub = True
            else:
                is_stub = False  # has some logic but under 200
        else:
            is_stub = False
        results.append((t, count, p, is_stub))
    else:
        results.append((t, 'MISSING', p, True))

# Sort by line count ascending
results.sort(key=lambda x: (0 if x[1] == 'MISSING' else (1 if isinstance(x[1], int) else 2), x[1] if isinstance(x[1], int) else 0))

for t, count, p, is_stub in results:
    if count == 'MISSING':
        status = 'MISSING'
    elif is_stub:
        status = 'STUB'
    elif isinstance(count, int) and count < 200:
        status = 'UNDER200'
    else:
        status = 'OK'
    print(f"{status:10} {str(count):>6} lines | {t}")
