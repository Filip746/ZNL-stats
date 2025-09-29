import pandas as pd

# ---- CONFIG ----
INITIAL_ELO = 1500
HOME_ADV = 50
K = 20

# ---- DATA CLEANING ----
def load_clean_results(excel_path):
    df = pd.read_excel(excel_path, sheet_name=None)
    # Support for multi-sheet Excel: get all, same formatting
    dfs = []
    for _, t in df.items():
        t = t.dropna(axis=1, how='all')
        t.columns = [str(c).strip().replace(" ", "").replace("score", "Score") for c in t.columns]
        # Normalize headers
        rename = {}
        for c in t.columns:
            if c.lower() == "hometeam": rename[c] = "homeTeam"
            if c.lower() == "awayteam": rename[c] = "awayTeam"
            if c.lower().startswith("date"): rename[c] = "dateOfMatch"
            if c.lower().startswith("homescore"): rename[c] = "homeScore"
            if c.lower().startswith("awayscore"): rename[c] = "awayScore"
        t = t.rename(columns=rename)
        # select
        t = t[['homeTeam','awayTeam','dateOfMatch','homeScore','awayScore']]
        t = t.dropna(how='all')
        t = t[t['homeTeam'].notnull() & t['awayTeam'].notnull() & t['homeScore'].notnull() & t['awayScore'].notnull()]
        t = t[t['homeTeam'] != 'homeTeam']
        t = t[t['awayTeam'] != 'awayTeam']
        dfs.append(t)
    result = pd.concat(dfs, ignore_index=True)
    # Fix team name variants
    def std_name(x):
        return str(x).strip().replace('ŠNK ','').replace('NK ','').replace('(S)','').replace('(C)','').replace('.','').replace(',','')
    for c in ['homeTeam','awayTeam']:
        result[c] = result[c].apply(std_name)
    result['homeScore'] = pd.to_numeric(result['homeScore'], errors='coerce')
    result['awayScore'] = pd.to_numeric(result['awayScore'], errors='coerce')
    result = result.dropna(subset=['homeScore','awayScore'])
    return result.reset_index(drop=True)

# ---- ELO FUNCTIONS ----
def expected_score(r1, r2): return 1/(1+10**((r2-r1)/400))
def result_points(h, a): 
    if h > a: return 1, 0
    if h == a: return 0.5, 0.5
    return 0, 1
def margin_k(base_k, goal_diff): return base_k+5*(abs(goal_diff)-1) if abs(goal_diff)>1 else base_k
def elo_update(r1, r2, s1, s2, k=K, home_adv=HOME_ADV):
    r1a = r1 + home_adv  # Home adv to home team
    exp1 = expected_score(r1a, r2)
    exp2 = expected_score(r2, r1a)
    pts1, pts2 = result_points(s1, s2)
    margin = int(abs(s1-s2))
    use_k = margin_k(k, margin)
    r1_new = r1 + use_k*(pts1-exp1)
    r2_new = r2 + use_k*(pts2-exp2)
    return r1_new, r2_new

# ---- CALCULATE INIT ELO FROM FULL SEASON ----
def compute_season_elo(df):
    teams = sorted(list(set(df['homeTeam']) | set(df['awayTeam'])))
    rating = {t: INITIAL_ELO for t in teams}
    matchlog = []
    for ix, row in df.iterrows():
        h, a = row['homeTeam'], row['awayTeam']
        hs, as_ = row['homeScore'], row['awayScore']
        rh, ra = rating[h], rating[a]
        new_rh, new_ra = elo_update(rh, ra, hs, as_)
        matchlog.append({
            'rnd': ix + 1,
            'date': row['dateOfMatch'],
            'home': h, 'away': a, 'hs': hs, 'as': as_,
            'home_pre': rh, 'away_pre': ra,
            'home_post': new_rh, 'away_post': new_ra
        })
        rating[h], rating[a] = new_rh, new_ra
    logdf = pd.DataFrame(matchlog)
    return rating, logdf

# ---- ELO UPDATER FOR NEW ROUNDS ----
def update_elo_with_round(round_csv, rating_dict):
    """round_csv: path to csv with columns homeTeam,awayTeam,homeScore,awayScore,dateOfMatch (optional date)
    rating_dict: current elo score per team (dict)
    """
    df = pd.read_csv(round_csv)
    # Clean team names
    def std_name(x):
        return str(x).strip().replace('ŠNK ','').replace('NK ','').replace('(S)','').replace('(C)','').replace('.','').replace(',','')
    for c in ['homeTeam','awayTeam']:
        df[c] = df[c].apply(std_name)
    df['homeScore'] = pd.to_numeric(df['homeScore'], errors='coerce')
    df['awayScore'] = pd.to_numeric(df['awayScore'], errors='coerce')
    df = df.dropna(subset=['homeScore','awayScore'])
    # Apply matches
    for _, row in df.iterrows():
        h, a = row['homeTeam'], row['awayTeam']
        hs, as_ = row['homeScore'], row['awayScore']
        rh = rating_dict.get(h, INITIAL_ELO)
        ra = rating_dict.get(a, INITIAL_ELO)
        rating_dict[h], rating_dict[a] = elo_update(rh, ra, hs, as_)
    return rating_dict

# ---- MAIN EXECUTION ----
if __name__ == '__main__':
    # 1. Generate initial ELO from last season:
    df = load_clean_results('result2425.xlsx')
    elo_rating, elo_log = compute_season_elo(df)
    print('=== FINAL ELO RATINGS ===')
    for team, score in sorted(elo_rating.items(), key=lambda x: -x[1]):
        print(f'{team:30}: {score:.0f}')
    # Save to file for future update use
    pd.Series(elo_rating).to_csv('current_elo.csv', header=['ELO'])
    # 2. Update with new round
    # round_df should have columns: homeTeam,aw...
    # rating_dict = pd.read_csv('current_elo.csv', index_col=0, squeeze=True).to_dict()
    # rating_dict = update_elo_with_round('newround.csv', rating_dict)
    # pd.Series(rating_dict).to_csv('current_elo.csv', header=['rating'])
