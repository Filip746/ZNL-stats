import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from io import StringIO
import re

# Set a modern font globally (change to 'Arial' or 'Roboto' if preferred and available)
plt.rcParams['font.family'] = 'DejaVu Sans'

# Read your file
file_path = 'predictionTop6.txt'
with open(file_path, encoding='utf-8') as f:
    lines = f.readlines()

# Find position of table header for probability section
start_index = None
for i, line in enumerate(lines):
    if line.strip().startswith('Team') and '1' in line and '10' in line:
        start_index = i
        break

# Extract table lines until next separator (====)
table_lines = []
for line in lines[start_index:]:
    if line.strip().startswith('==='):
        break
    if (not line.strip() or set(line.strip()) in [{'='}, {'-'}, {'|'}] or len(line.strip()) < 3):
        continue
    table_lines.append(line.rstrip())

# Join the lines and normalize spacing to tabs for parsing
table_text = '\n'.join(table_lines)
table_text_fixed = re.sub(r'\s{2,}', '\t', table_text)

# Read as DataFrame
data = pd.read_csv(StringIO(table_text_fixed), sep='\t')
data.set_index('Team', inplace=True)

# Clean column names if necessary
data.columns = [col.strip() for col in data.columns]

# PLOT: Modern, centered, no excess left space
fig, ax = plt.subplots(figsize=(10, 7))
sns.heatmap(
    data,
    annot=True,
    fmt='.2f',
    cmap='Greens',
    cbar_kws={'label': 'Vjerojatnost (%)'},
    linewidths=.5,
    linecolor='white',
    annot_kws={"size":14, "weight":"bold", "color":"#222"},
    vmin=0,
    vmax=70
)

ax.set_title('Vjerovatnost tima po poziciji (%)', fontsize=22, weight='bold', pad=30)
ax.set_xlabel('Pozicija', fontsize=16, weight='bold', labelpad=12)
ax.set_ylabel('Klub', fontsize=16, weight='bold', labelpad=12)
ax.set_xticklabels(ax.get_xticklabels(), fontsize=13, weight='bold', color='#333')
ax.set_yticklabels(ax.get_yticklabels(), fontsize=13, weight='bold', color='#333', rotation=0)
ax.xaxis.set_label_position('top')
ax.xaxis.tick_top()

plt.tight_layout(pad=2)
plt.subplots_adjust(left=0.25, right=0.98, top=0.88, bottom=0.07)

plt.show()
