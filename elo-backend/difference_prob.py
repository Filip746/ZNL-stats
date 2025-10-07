import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# MOCK podaci: stare i nove vjerojatnosti (po redu s grafa)
teams = [
    "Zadrugar", "Mladost SL", "Nova Ves", "Plitvica", "Mladost VT", "Zelengaj",
    "Semovec", "Beretinec", "Drava", "Dubravka", "Sloboda", "Obres"
]

old_probs = [99.3, 98.3, 71.9, 87.6, 71.9, 71.0, 45.3, 26.0, 17.6, 3.4, 5.3, 3.4]
new_probs = [99.4, 96.4, 57.9, 64.6, 83.4, 89.4, 22.2, 43.5, 35.0, 3.6, 3.9, 0.6]

# Izračun promjene
changes = [new - old for new, old in zip(new_probs, old_probs)]

# Sortiranje tako da su pozitivni na vrhu
df = pd.DataFrame({"Klub": teams, "Promjena": changes})
df = df[df["Promjena"].abs() >= 2].sort_values("Promjena", ascending=False, ignore_index=True)

# Boje: pozitivno = tamno zelena, negativno = tamno crvena
colors = ['#2ecc40' if x > 0 else '#d62d2d' for x in df['Promjena']]

fig, ax = plt.subplots(figsize=(14, 8))
bars = ax.barh(df['Klub'], df['Promjena'],
               color=colors, edgecolor="#222", linewidth=2, alpha=0.96,
               height=0.65)

# Grid, okomita linija na 0
ax.xaxis.grid(True, which='major', linestyle='--', linewidth=1.5, color='#cccccc', alpha=0.6)
ax.axvline(0, color='gray', linestyle='--', lw=1.8)

# Dodaj value label iznad svakog bara s laganim offsetom
for i, (bar, change) in enumerate(zip(bars, df["Promjena"])):
    if change < 0:
        xpos = bar.get_width() * 0.05  # malo desno unutar bara
        ax.text(xpos, bar.get_y() + bar.get_height()/2,
                f"{change:+.2f} %", va='center', ha='left',
                fontsize=19, fontweight='bold', color='#222')
    else:
        xpos = bar.get_width() + 0.5
        ax.text(xpos, bar.get_y() + bar.get_height()/2,
                f"{change:+.2f} %", va='center', ha='left',
                fontsize=19, fontweight='bold', color='#222')

# Podesi stil osi i legendu
ax.set_title("Najveće promjene vjerojatnosti za TOP 6 (kolo 7)", fontsize=26, weight='bold', pad=15)
ax.set_xlabel("Promjena vjerojatnosti (%)", fontsize=18, labelpad=10)
ax.set_yticklabels(df['Klub'], fontsize=17, fontweight='bold')
ax.tick_params(axis='x', labelsize=14)
plt.gca().invert_yaxis()

fig.patch.set_facecolor('#f6f8fa')
ax.set_facecolor('#f6fcf6')

plt.tight_layout(pad=4)
plt.show()