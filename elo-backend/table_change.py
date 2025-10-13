import pandas as pd
import os
import matplotlib.pyplot as plt

clubs_order = [
    "Zadrugar", "Mladost SL", "Zelengaj", "Beretinec",
    "Mladost VT", "Drava", "Semovec", "Nova Ves",
    "Sloboda", "Plitvica", "Dubravka", "Obres"
]

results_per_round = []
for i in range(1, 9):
    filename = f"newround{i}.csv"
    if os.path.exists(filename):
        df = pd.read_csv(filename, sep=';')
        results_per_round.append(df)
    else:
        results_per_round.append(pd.DataFrame(columns=["homeTeam","awayTeam","homeScore","awayScore","dateOfMatch"]))

club_history = {club: [] for club in clubs_order}
club_stats = {club: {'points': 0, 'gf': 0, 'ga': 0} for club in clubs_order}

for round_idx, round_df in enumerate(results_per_round):
    round_tally = {club: club_stats[club].copy() for club in clubs_order}
    for _, row in round_df.iterrows():
        home, away = row['homeTeam'], row['awayTeam']
        hs, as_ = int(row['homeScore']), int(row['awayScore'])
        round_tally[home]['gf'] += hs
        round_tally[home]['ga'] += as_
        round_tally[away]['gf'] += as_
        round_tally[away]['ga'] += hs
        if hs > as_:
            round_tally[home]['points'] += 3
        elif hs < as_:
            round_tally[away]['points'] += 3
        else:
            round_tally[home]['points'] += 1
            round_tally[away]['points'] += 1
    for club in clubs_order:
        club_stats[club] = round_tally[club].copy()
        club_history[club].append((club_stats[club]['points'], club_stats[club]['gf']-club_stats[club]['ga']))

positions = {club: [] for club in clubs_order}
for rnd in range(len(results_per_round)):
    table = []
    for club in clubs_order:
        pts, gr = club_history[club][rnd]
        table.append((pts, gr, club))
    table_sorted = sorted(table, key=lambda x: (-x[0], -x[1], clubs_order.index(x[2])))
    for pos, (_, _, club) in enumerate(table_sorted, 1):
        positions[club].append(pos)

plt.figure(figsize=(14, 7))
for club, pos_list in positions.items():
    if club == "Zelengaj":
        plt.plot(range(1, 9), pos_list, marker='o', label=club, color='green', linewidth=6, markersize=16, zorder=2)
    else:
        plt.plot(range(1, 9), pos_list, marker='o', color='lightgray', linewidth=1.5, markersize=8, zorder=1)

plt.gca().invert_yaxis()
plt.xticks(range(1, 9))
plt.xlabel('Kolo', fontsize=13)
plt.ylabel('Pozicija', fontsize=13)
plt.title('Praćenje promjena na tablici po klubovima')

# DODAJEMO LEGENDU SA STRANE, sortirano po poziciji u zadnjem kolu:
final_table = sorted([(pos_list[-1], club) for club, pos_list in positions.items()])
for i, (final_pos, club) in enumerate(final_table, 1):
    y = final_pos
    plt.text(8.3, y, club, va='center', fontsize=13, color='green' if club == 'Zelengaj' else 'gray', fontweight='bold' if club == 'Zelengaj' else 'normal')

plt.xlim(1, 9.7)
plt.tight_layout()
plt.show()
