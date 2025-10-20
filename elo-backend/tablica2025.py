import pandas as pd

# Postojeća tablica s podacima za prvih 8 kola
current_table = {
    "Zadrugar": {"O": 9, "P": 6, "N": 3, "I": 0, "GF": 30, "GA": 10, "Bod": 21},
    "Mladost SL": {"O": 9, "P": 5, "N": 2, "I": 2, "GF": 26, "GA": 12, "Bod": 17},
    "Zelengaj": {"O": 9, "P": 5, "N": 3, "I": 1, "GF": 25, "GA": 11, "Bod": 18},
    "Beretinec": {"O": 9, "P": 5, "N": 3, "I": 1, "GF": 19, "GA": 14, "Bod": 18},
    "Mladost VT": {"O": 9, "P": 4, "N": 2, "I": 3, "GF": 16, "GA": 16, "Bod": 14},
    "Nova Ves": {"O": 9, "P": 3, "N": 3, "I": 3, "GF": 13, "GA": 15, "Bod": 12},
    "Drava": {"O": 9, "P": 4, "N": 0, "I": 5, "GF": 16, "GA": 22, "Bod": 12},
    "Mladost (Š)": {"O": 9, "P": 3, "N": 1, "I": 5, "GF": 15, "GA": 24, "Bod": 10},
    "Sloboda": {"O": 9, "P": 2, "N": 2, "I": 5, "GF": 10, "GA": 19, "Bod": 8},
    "Dubravka-Zagorac": {"O": 9, "P": 2, "N": 2, "I": 5, "GF": 9, "GA": 18, "Bod": 8},
    "Plitvica": {"O": 9, "P": 2, "N": 1, "I": 6, "GF": 15, "GA": 22, "Bod": 7},
    "Obres": {"O": 9, "P": 2, "N": 0, "I": 7, "GF": 8, "GA": 19, "Bod": 6}
}

# Učitaj Excel (preskače prvih 99 redova)
df = pd.read_excel(r"C:\Users\filip\Downloads\ELORatin\elo-backend\result2425.xlsx", header=None, skiprows=99)

df.columns = ["Domacin", "Gost", "Datum", "GolDomacin", "GolGost"]

# Klupske statistike u koje ćemo zbrajati postojeće i nove rezultate
tablica = {}

# Učitaj postojeću tablicu u tablica dict
for klub, stats in current_table.items():
    tablica[klub] = stats.copy()

def update_team(team, scored, conceded, win, draw, loss):
    if team not in tablica:
        tablica[team] = {"O": 0, "P": 0, "N": 0, "I": 0, "GF": 0, "GA": 0, "Bod": 0}
    tablica[team]["O"] += 1
    tablica[team]["GF"] += int(scored)
    tablica[team]["GA"] += int(conceded)
    tablica[team]["P"] += win
    tablica[team]["N"] += draw
    tablica[team]["I"] += loss
    tablica[team]["Bod"] += win * 3 + draw

# Ažuriraj statistike novim rezultatima iz Excela
for row in df.itertuples():
    if pd.isna(row.Domacin) or pd.isna(row.Gost):
        continue
    home, away = row.Domacin, row.Gost
    g_home, g_away = row.GolDomacin, row.GolGost

    if g_home > g_away:
        update_team(home, g_home, g_away, 1, 0, 0)
        update_team(away, g_away, g_home, 0, 0, 1)
    elif g_home < g_away:
        update_team(home, g_home, g_away, 0, 0, 1)
        update_team(away, g_away, g_home, 1, 0, 0)
    else: # neriješeno
        update_team(home, g_home, g_away, 0, 1, 0)
        update_team(away, g_away, g_home, 0, 1, 0)

# Sortiraj finalnu tablicu po bodovima i gol razlici
sorted_tablica = sorted(tablica.items(), key=lambda x: (x[1]["Bod"], x[1]["GF"] - x[1]["GA"]), reverse=True)

# Printaj tablicu u formatu markdown
print("| Poz | Klub             | O  | P  | N  | I  | GF:GA  | +/−  | Bod |")
print("|-----|------------------|----|----|----|----|--------|------|-----|")
for i, (klub, stats) in enumerate(sorted_tablica, 1):
    razlika = stats["GF"] - stats["GA"]
    print(f"| {i:3} | {klub:<16} | {stats['O']:2} | {stats['P']:2} | {stats['N']:2} | {stats['I']:2} | {stats['GF']:3}:{stats['GA']:3} | {razlika:4} | {stats['Bod']:3} |")
