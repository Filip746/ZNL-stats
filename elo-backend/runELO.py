import random
import math
import numpy as np

def simulate_match(home_team_elo, away_team_elo, home_advantage=50, k=20):
    adjusted_home_elo = home_team_elo + home_advantage
    elo_diff = adjusted_home_elo - away_team_elo
    home_win_probability = 1 / (1 + math.pow(10, -elo_diff / 400))

    result = random.random()
    if result < home_win_probability:
        outcome = 1
        home_score, away_score = 3, 0
    elif result < home_win_probability + 0.25:
        outcome = 0.5
        home_score, away_score = 1, 1
    else:
        outcome = 0
        home_score, away_score = 0, 3

    elo_change = k * (outcome - home_win_probability)
    new_home_elo = home_team_elo + elo_change
    new_away_elo = away_team_elo - elo_change

    return home_score, away_score, new_home_elo, new_away_elo


def simulate_league(teams, fixtures, initial_points, k=20):
    points = initial_points.copy()
    current_elos = teams.copy()

    for home_team, away_team in fixtures:
        home_points, away_points, new_home_elo, new_away_elo = simulate_match(
            current_elos[home_team], current_elos[away_team], k=k
        )
        points[home_team] += home_points
        points[away_team] += away_points
        current_elos[home_team] = new_home_elo
        current_elos[away_team] = new_away_elo

    return points, current_elos


def run_multiple_simulations(teams, fixtures, initial_points, num_simulations=10000, k=20):
    num_teams = len(teams)
    position_counts = {team: [0] * num_teams for team in teams}
    total_points = {team: 0 for team in teams}

    for _ in range(num_simulations):
        final_points, _ = simulate_league(teams, fixtures, initial_points, k=k)
        sorted_results = sorted(final_points.items(), key=lambda x: x[1], reverse=True)

        for position, (team, points) in enumerate(sorted_results):
            position_counts[team][position] += 1
            total_points[team] += points

    position_probabilities = {
        team: [count / num_simulations * 100 for count in counts]
        for team, counts in position_counts.items()
    }
    average_points = {team: round((total / num_simulations), 2) for team, total in total_points.items()}
    qualification_probabilities_top8 = {team: sum(probs[:1]) for team, probs in position_probabilities.items()}
    qualification_probabilities_top24 = {team: sum(probs[:6]) for team, probs in position_probabilities.items()}

    return position_probabilities, average_points, qualification_probabilities_top8, qualification_probabilities_top24


def print_results(position_probabilities, average_points, qualification_probabilities_top8, qualification_probabilities_top24):
    print("Šanse za osvajanje HNL-a i top 6")
    print("=" * 116)

    sorted_teams = sorted(average_points.items(), key=lambda x: x[1], reverse=True)

    print("Team".ljust(20) + "Proj. Points".ljust(15) + "Prvak (%)".ljust(20) + "Top 6 (%)")
    print("-" * 116)
    for team, points in sorted_teams:
        qual_prob_top8 = qualification_probabilities_top8[team]
        qual_prob_top24 = qualification_probabilities_top24[team]
        print(f"{team.ljust(20)}{points}".ljust(35) + f"{qual_prob_top8:.2f}".ljust(20) + f"{qual_prob_top24:.2f}")

    print("\nVjerojatnosti pozicija za svaki klub (%)")
    print("=" * 116)

    # Header
    print("Team".ljust(20) + "".join(f"{i:>8}" for i in range(1, 13)))
    print("-" * 116)

    # Data
    for team in sorted_teams:
        probs = position_probabilities[team[0]]
        print(f"{team[0].ljust(20)}" + "".join(f"{prob:>8.2f}" for prob in probs[:12]))

    print("=" * 116)


def assign_competition_numbers(sorted_teams):
    comp_nums = {}
    for i in range(3):
        comp_nums[sorted_teams[i]] = i + 1
    comp_nums[sorted_teams[3]] = 6
    comp_nums[sorted_teams[4]] = 5
    comp_nums[sorted_teams[5]] = 4
    return comp_nums


def generate_second_phase_fixtures(liga_teams):
    comp_nums = assign_competition_numbers(liga_teams)
    rounds = [
        [(1, 6), (2, 5), (3, 4)],
        [(6, 4), (5, 3), (1, 2)],
        [(2, 6), (3, 1), (4, 5)],
        [(6, 5), (3, 2), (1, 4)],
        [(3, 6), (5, 1), (4, 2)],
    ]
    num_to_team = {num: team for team, num in comp_nums.items()}
    fixtures_second_phase = []
    for rnd in rounds:
        for home_num, away_num in rnd:
            fixtures_second_phase.append((num_to_team[home_num], num_to_team[away_num]))
    return fixtures_second_phase


def print_phase_table(title, points_dict, pos_prob):
    sorted_teams = sorted(points_dict.items(), key=lambda x: x[1], reverse=True)
    print(f"\n{title}:")
    print("-" * 80)
    print(f"{'Mjesto':<7}{'Tim':<15}{'xPts':<8}" + "".join(f"{i:<6}" for i in range(1, 7)))
    print("-" * 80)
    for i, (team, pts) in enumerate(sorted_teams, 1):
        probs = pos_prob[team][:6]
        prob_str = "".join(f"{p:6.2f}" for p in probs)
        print(f"{i:<7}{team:<15}{pts:<8}{prob_str}")
    print("-" * 80)


# Definicija podataka i simulacije

initial_points = {
    "Mladost SL": 23,
    "Zadrugar": 22,
    "Zelengaj": 21,
    "Beretinec": 19,
    "Nova Ves": 18,
    "Mladost VT": 16,
    "Drava": 14,
    "Semovec": 13,
    "Dubravka": 10,
    "Sloboda": 9,
    "Obres": 9,
    "Plitvica": 8
}

teams = {
    "Beretinec": 1471.4457812345127,
    "Drava": 1451.622154651211,
    "Mladost SL": 1592.7157650805964,
    "Mladost VT": 1455.6034157291513,
    "Nova Ves": 1527.137151976654,
    "Obres": 1441.7629621435683,
    "Plitvica": 1523.5901291904695,
    "Sloboda": 1368.806792452289,
    "Zadrugar": 1599.796380016749,
    "Zelengaj": 1582.3611749101567,
    "Dubravka": 1390.4381185202017,
    "Semovec": 1392.6989663171341
}



fixtures = [
("Zelengaj", "Zadrugar"), ("Plitvica", "Nova Ves"), ("Semovec", "Mladost VT"), ("Dubravka", "Beretinec"), ("Drava", "Mladost SL"), ("Obres", "Sloboda"),
("Mladost SL", "Beretinec"), ("Semovec", "Dubravka"), ("Mladost VT", "Obres"), ("Sloboda", "Plitvica"), ("Nova Ves", "Zelengaj"), ("Zadrugar", "Drava"),

("Zelengaj", "Sloboda"), ("Plitvica", "Mladost VT"), ("Obres", "Semovec"), ("Dubravka", "Mladost SL"), ("Beretinec", "Zadrugar"), ("Drava", "Nova Ves"),
("Mladost SL", "Drava"), ("Plitvica", "Obres"), ("Beretinec", "Nova Ves"), ("Sloboda", "Zelengaj"), ("Mladost VT", "Dubravka"), ("Semovec", "Zadrugar"),
("Drava", "Beretinec"), ("Plitvica", "Semovec"), ("Zelengaj", "Mladost SL"), ("Dubravka", "Sloboda"), ("Zadrugar", "Mladost VT"), ("Nova Ves", "Obres"),

("Obres", "Zelengaj"), ("Nova Ves", "Zadrugar"), ("Plitvica", "Dubravka"), ("Semovec", "Drava"), ("Mladost VT", "Beretinec"), ("Sloboda", "Mladost SL"),
("Zelengaj", "Plitvica"), ("Dubravka", "Nova Ves"), ("Zadrugar", "Sloboda"), ("Mladost SL", "Mladost VT"), ("Beretinec", "Semovec"), ("Drava", "Obres"),
("Beretinec", "Mladost SL"), ("Sloboda", "Drava"), ("Mladost VT", "Zelengaj"), ("Semovec", "Obres"), ("Zadrugar", "Plitvica"), ("Nova Ves", "Dubravka"),

("Beretinec", "Plitvica"), ("Drava", "Zelengaj"), ("Dubravka", "Sloboda"), ("Nova Ves", "Mladost VT"), ("Zadrugar", "Semovec"), ("Mladost SL", "Obres"),
("Mladost VT", "Sloboda"), ("Drava", "Dubravka"), ("Zelengaj", "Beretinec"), ("Plitvica", "Mladost SL"), ("Obres", "Zadrugar"), ("Semovec", "Nova Ves"),
("Zadrugar", "Plitvica"), ("Mladost SL", "Zelengaj"), ("Beretinec", "Drava"), ("Dubravka", "Mladost VT"), ("Sloboda", "Semovec"), ("Nova Ves", "Obres")
]

k = 20
num_simulations = 10000

def calculate_positions_conditional_on_points(teams, fixtures, initial_points, num_simulations=10000, k=20):
    """
    Računa uvjetne vjerojatnosti pozicija na temelju broja bodova
    Returns: dictionary[team][points] = [position_probabilities]
    """
    print("Računam uvjetne vjerojatnosti pozicija...")
    
    # Pokreni simulacije i spremi sve rezultate
    all_results, _, _ = run_complete_championship_simulation(
        teams, fixtures, num_simulations=num_simulations, k=k
    )
    
    # Struktura: {team: {points: {position_counts: [counts for each position]}}}
    conditional_data = {}
    
    for team in teams.keys():
        conditional_data[team] = {}
        team_results = all_results[team]
        
        # Grupiraj rezultate po brojevima bodova
        points_groups = {}
        for final_points in team_results:
            rounded_points = int(round(final_points))
            if rounded_points not in points_groups:
                points_groups[rounded_points] = []
            points_groups[rounded_points].append(final_points)
        
        # Za svaki broj bodova, izračunaj pozicije u tim simulacijama
        for points_value, points_list in points_groups.items():
            if len(points_list) < 5:  # Ignoriraj rijetke scenarije
                continue
                
            position_counts = [0] * len(teams)  # 12 pozicija
            
            # Za sve simulacije s ovim brojem bodova, provjeri poziciju tima
            for sim_idx, target_points in enumerate(points_list):
                # Rekonstruiraj konačnu tablicu za ovu simulaciju
                sim_final_points = {}
                for other_team in teams.keys():
                    if other_team == team:
                        sim_final_points[other_team] = target_points
                    else:
                        # Uzmi odgovarajući rezultat iz iste simulacije
                        other_results = all_results[other_team]
                        if sim_idx < len(other_results):
                            sim_final_points[other_team] = other_results[sim_idx]
                        else:
                            # Fallback - uzmi prosječni rezultat
                            sim_final_points[other_team] = np.mean(other_results)
                
                # Sortiraj tablicu za ovu simulaciju
                sorted_table = sorted(sim_final_points.items(), key=lambda x: x[1], reverse=True)
                
                # Pronađi poziciju našeg tima
                for position, (team_name, _) in enumerate(sorted_table):
                    if team_name == team:
                        if position < len(position_counts):
                            position_counts[position] += 1
                        break
            
            # Izračunaj postotke
            total_sims = len(points_list)
            position_percentages = [(count / total_sims) * 100 for count in position_counts]
            
            conditional_data[team][points_value] = {
                'position_probabilities': position_percentages,
                'sample_size': total_sims,
                'points': points_value
            }
    
    return conditional_data

# Alternativna, efikasnija implementacija
def calculate_positions_conditional_optimized(teams, fixtures, initial_points, num_simulations=10000, k=20):
    """
    Optimized version - simulira i odmah računa uvjetne vjerojatnosti
    """
    print(f"Računam uvjetne vjerojatnosti pozicija ({num_simulations} simulacija)...")
    
    # Struktura za čuvanje rezultata: {team: {points: position_counts}}
    conditional_results = {}
    for team in teams.keys():
        conditional_results[team] = {}
    
    # Pokreni simulacije
    for sim in range(num_simulations):
        if sim % 1000 == 0:
            print(f"Simulacija {sim}/{num_simulations}")
        
        # Simuliraj kompletno prvenstvo
        all_team_results, _, _ = run_complete_championship_simulation(
            teams, fixtures, num_simulations=1, k=k  # Jedna simulacija
        )
        
        # Dobij konačne bodove za sve timove u ovoj simulaciji
        final_points = {team: results[0] for team, results in all_team_results.items()}
        
        # Sortiraj tablicu
        sorted_teams = sorted(final_points.items(), key=lambda x: x[1], reverse=True)
        
        # Za svaki tim, zabilježi poziciju i bodove
        for position, (team, points) in enumerate(sorted_teams):
            rounded_points = int(round(points))
            
            if rounded_points not in conditional_results[team]:
                conditional_results[team][rounded_points] = [0] * len(teams)
            
            conditional_results[team][rounded_points][position] += 1
    
    # Pretvori u postotke
    final_results = {}
    for team, points_data in conditional_results.items():
        final_results[team] = {}
        for points, position_counts in points_data.items():
            total_count = sum(position_counts)
            if total_count >= 5:  # Minimum 5 uzoraka
                percentages = [(count / total_count) * 100 for count in position_counts]
                final_results[team][points] = {
                    'position_probabilities': percentages,
                    'sample_size': total_count,
                    'points': points
                }
    
    return final_results

def run_complete_championship_simulation(teams, fixtures_phase1, num_simulations=10000, k=20):
    """
    Pokreće kompletnu simulaciju prvenstva s varijabilnom podjelom liga
    """
    all_results = {team: [] for team in teams.keys()}
    champions_league_appearances = {team: 0 for team in teams.keys()}
    relegation_league_appearances = {team: 0 for team in teams.keys()}
    
    for sim in range(num_simulations):
        # 1. Simuliraj prvu fazu
        points_phase1, elos_phase1 = simulate_league(teams, fixtures_phase1, initial_points, k)
        
        # 2. Podijeli timove na temelju OVOJE simulacije
        sorted_phase1 = sorted(points_phase1.items(), key=lambda x: x[1], reverse=True)
        liga_prvaka = [t for t, _ in sorted_phase1[:6]]
        liga_ostanak = [t for t, _ in sorted_phase1[6:]]
        
        # 3. Evidentiraj pojavljivanje u ligama
        for team in liga_prvaka:
            champions_league_appearances[team] += 1
        for team in liga_ostanak:
            relegation_league_appearances[team] += 1
        
        # 4. Generiraj fixtures za drugu fazu
        fixtures_prvaka = generate_second_phase_fixtures(liga_prvaka)
        fixtures_ostanak = generate_second_phase_fixtures(liga_ostanak)
        
        # 5. Simuliraj drugu fazu
        teams_prvaka = {t: elos_phase1[t] for t in liga_prvaka}
        points_prvaka_start = {t: points_phase1[t] for t in liga_prvaka}
        
        teams_ostanak = {t: elos_phase1[t] for t in liga_ostanak}
        points_ostanak_start = {t: points_phase1[t] for t in liga_ostanak}
        
        points_prvaka_final, _ = simulate_league(teams_prvaka, fixtures_prvaka, points_prvaka_start, k)
        points_ostanak_final, _ = simulate_league(teams_ostanak, fixtures_ostanak, points_ostanak_start, k)
        
        # 6. Spremi konačne rezultate
        for team, points in points_prvaka_final.items():
            all_results[team].append(points)
        for team, points in points_ostanak_final.items():
            all_results[team].append(points)
    
    return all_results, champions_league_appearances, relegation_league_appearances


if __name__ == "__main__":
    print("Pokretanje kompletne simulacije...")
    
    all_results, champ_appearances, releg_appearances = run_complete_championship_simulation(
        teams, fixtures, num_simulations=num_simulations, k=k
    )
    
    # Izračunaj statistike
    average_points = {team: np.mean(points) for team, points in all_results.items()}
    
    print("\n--- KONAČNI REZULTATI ---")
    print(f"{'Tim':<15}{'Avg bodovi':<12}{'Liga prvaka %':<15}{'Liga ostanak %':<15}")
    print("-" * 60)
    
    sorted_teams = sorted(average_points.items(), key=lambda x: x[1], reverse=True)
    
    for team, avg_pts in sorted_teams:
        champ_pct = (champ_appearances[team] / num_simulations) * 100
        releg_pct = (releg_appearances[team] / num_simulations) * 100
        print(f"{team:<15}{avg_pts:<12.2f}{champ_pct:<15.1f}{releg_pct:<15.1f}")