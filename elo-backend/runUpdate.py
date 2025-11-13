import pandas as pd

# -------- CONFIGURATION --------
INITIAL_ELO = 1500
HOME_ADV = 50
K = 20

# -------- DATA CLEANING --------
def standardize_team_name(name):
    # Normalize club names to avoid mismatches
    return str(name).strip().replace('ŠNK ', '').replace('NK ', '').replace('(S)', '').replace('(C)', '').replace('.', '').replace(',', '')

# -------- ELO CORE FUNCTIONS --------
def expected_score(r1, r2):
    return 1 / (1 + 10 ** ((r2 - r1) / 400))

def result_points(home_goals, away_goals):
    if home_goals > away_goals:
        return 1, 0
    elif home_goals == away_goals:
        return 0.5, 0.5
    else:
        return 0, 1

def margin_k(base_k, goal_diff):
    # Increase K if goal difference > 1 for more rating impact
    return base_k + 5 * (abs(goal_diff) - 1) if abs(goal_diff) > 1 else base_k

def elo_update(r1, r2, s1, s2, k=K, home_adv=HOME_ADV):
    r1a = r1 + home_adv  # home advantage applied only to home team
    exp1 = expected_score(r1a, r2)
    exp2 = expected_score(r2, r1a)
    pts1, pts2 = result_points(s1, s2)
    margin = int(abs(s1 - s2))
    use_k = margin_k(k, margin)
    r1_new = r1 + use_k * (pts1 - exp1)
    r2_new = r2 + use_k * (pts2 - exp2)
    return r1_new, r2_new

# -------- UPDATE ELO WITH NEW ROUND --------
def update_elo_with_new_round(round_csv_or_df, rating_dict):
    """
    Update Elo ratings based on new round results.
    round_csv_or_df: file path or DataFrame with columns homeTeam, awayTeam, homeScore, awayScore.
    rating_dict: dict of current Elo ratings per club.
    New clubs get the lowest Elo score present in rating_dict or INITIAL_ELO if empty.
    """
    if isinstance(round_csv_or_df, str):
        df = pd.read_csv(round_csv_or_df, sep=';')  # Use sep=';' for your newround.csv
    else:
        df = round_csv_or_df.copy()

    # Clean team names
    for c in ['homeTeam', 'awayTeam']:
        df[c] = df[c].apply(standardize_team_name)

    df['homeScore'] = pd.to_numeric(df['homeScore'], errors='coerce')
    df['awayScore'] = pd.to_numeric(df['awayScore'], errors='coerce')
    df = df.dropna(subset=['homeScore', 'awayScore'])

    # Assign starting Elo for new clubs as lowest current Elo
    if rating_dict:
        lowest_elo = min(rating_dict.values())
    else:
        lowest_elo = INITIAL_ELO

    new_clubs = set(df['homeTeam']).union(set(df['awayTeam'])) - rating_dict.keys()
    for club in new_clubs:
        rating_dict[club] = lowest_elo

    # Update Elo match-by-match
    for _, row in df.iterrows():
        h, a = row['homeTeam'], row['awayTeam']
        hs, as_ = row['homeScore'], row['awayScore']
        rh = rating_dict[h]
        ra = rating_dict[a]
        rating_dict[h], rating_dict[a] = elo_update(rh, ra, hs, as_)

    return rating_dict

# -------- USAGE EXAMPLE --------
if __name__ == '__main__':
    # Load example current Elo from CSV or init empty
    try:
        rating_df = pd.read_csv('current_elo.csv', index_col=0)
        rating_series = rating_df['ELO']  # Explicitly select the 'ELO' column by name
        rating_dict = rating_series.to_dict()
        print("Loaded current Elo ratings.")
    except FileNotFoundError:
        print("No existing elo CSV found, starting fresh with empty ratings.")
        rating_dict = {}

    # Update Elo with new round file (adjust filename)
    new_round_file = 'newround12.csv'  # Replace with actual round file
    rating_dict = update_elo_with_new_round(new_round_file, rating_dict)
    print("Updated Elo ratings with new round results:")

    # Display updated Elo
    for team, elo in sorted(rating_dict.items(), key=lambda x: -x[1]):
        print(f"{team:30s}: {elo:.0f}")

    # Save updated ratings for future use
    pd.Series(rating_dict).to_csv('current_elo.csv', header=['ELO'])
