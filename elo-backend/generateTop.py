import pandas as pd
import matplotlib.pyplot as plt
import re
from io import StringIO

plt.rcParams["font.family"] = "DejaVu Sans"

file_path = "predictionTop6.txt"
with open(file_path, encoding="utf-8") as f:
    lines = [line.rstrip('\n') for line in f]

header_idx = None
for i, line in enumerate(lines):
    if line.strip().startswith("Team") and "Proj." in line:
        header_idx = i
        break

data_lines = []
for l in lines[header_idx:]:
    if l.strip() == "" or l.strip().startswith("Vjerojatnosti"):
        break
    if not (set(l.strip()) in [{"="}, {"-"}]):
        data_lines.append(l.strip())

table_text = "\n".join(data_lines)
table_text_fixed = re.sub(r"\s{2,}", "\t", table_text)
df = pd.read_csv(StringIO(table_text_fixed), sep="\t")
df.columns = [col.strip() for col in df.columns]

df['Top 6 (%)'] = df['Top 6 (%)'].astype(float)
df = df.sort_values(by="Top 6 (%)", ascending=False)

# Boje - zeleni gradijent
import matplotlib.cm as cm
import numpy as np

cmap = plt.get_cmap("Greens")
norm = plt.Normalize(df['Top 6 (%)'].min(), df['Top 6 (%)'].max())
colors = [cmap(norm(val)) for val in df['Top 6 (%)']]

# Klubovi na x osi, Top 6 (%) na y osi
plt.figure(figsize=(13, 7))
bars = plt.bar(
    df["Team"],
    df["Top 6 (%)"],
    color=colors,
    edgecolor="black"
)

# Dodaj postotke iznad svakog bara
for idx, v in enumerate(df["Top 6 (%)"]):
    plt.text(idx, v + 2, f"{v:.2f}%", ha="center", fontsize=13, weight="bold", color="#166b29")

plt.ylabel("Vjerojatnost osvajanja Top 6 (%)", fontsize=17, weight="bold", labelpad=12)
plt.xlabel("Klub", fontsize=17, weight="bold", labelpad=12)
plt.title("Vjerojatnost plasmana u Top 6 po klubu (%)", fontsize=24, weight="bold", pad=18)
plt.ylim(0, 105)
plt.xticks(fontsize=13, weight="bold", color="#333", rotation=40, ha="right")
plt.yticks(fontsize=13, weight="bold", color="#333")
plt.tight_layout(pad=2)
plt.show()
