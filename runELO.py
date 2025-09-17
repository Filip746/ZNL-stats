
import random
import math
import numpy as np

def simulate_match(home_team_elo, away_team_elo, home_advantage=50, k=20):
    adjusted_home_elo = home_team_elo + home_advantage
    elo_diff = adjusted_home_elo - away_team_elo
    home_win_probability = 1 / (1 + math.pow(10, -elo_diff / 400))

    result = random.random()
    if result < home_win_probability:
        outcome = 1  # Home team wins
        home_score, away_score = 3, 0
    elif result < home_win_probability + 0.25:  # Assuming 25% chance of draw
        outcome = 0.5  # Draw
        home_score, away_score = 1, 1
    else:
        outcome = 0  # Away team wins
        home_score, away_score = 0, 3

    # Update Elo ratings
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


def run_multiple_simulations(teams, fixtures, initial_points, num_simulations, k=20):
    num_teams = len(teams)
    position_counts = {team: [0] * num_teams for team in teams}
    total_points = {team: 0 for team in teams}

    for _ in range(num_simulations):
        final_points, _ = simulate_league(teams, fixtures, initial_points, k=k)
        sorted_results = sorted(final_points.items(), key=lambda x: x[1], reverse=True)

        for position, (team, points) in enumerate(sorted_results):
            position_counts[team][position] += 1
            total_points[team] += points

    position_probabilities = {team: [count / num_simulations * 100 for count in counts]
                              for team, counts in position_counts.items()}
    average_points = {team: round((total / num_simulations),2) for team, total in total_points.items()}
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


initial_points = {
    "Zadrugar": 7,
    "Mladost SL": 7,
    "Nova Ves": 7,
    "Mladost VT": 6,
    "Semovec": 6,
    "Sloboda": 6,
    "Zelengaj": 5,
    "Obres": 3,
    "Beretinec": 2,
    "Dubravka": 1,
    "Drava": 0,
    "Plitvica": 0
}

teams = {
    "Zadrugar": 1586,
    "Mladost SL": 1565,
    "Nova Ves": 1583,
    "Mladost VT": 1461,
    "Semovec": 1412,
    "Sloboda": 1406,
    "Zelengaj": 1567,
    "Obres": 1468,
    "Beretinec": 1396,
    "Dubravka": 1363,
    "Drava": 1374,
    "Plitvica": 1551
}

fixtures = [
    ("Plitvica", "Semovec"), ("Zelengaj", "Mladost VT"), ("Mladost SL", "Zadrugar"), ("Dubravka", "Obres"), ("Drava", "Sloboda"), ("Beretinec", "Nova Ves"),
("Obres", "Plitvica"), ("Zadrugar", "Dubravka"), ("Nova Ves", "Mladost SL"), ("Sloboda", "Beretinec"), ("Mladost VT", "Drava"), ("Mladost SL", "Zelengaj"),
("Zelengaj", "Obres"), ("Zadrugar", "Nova Ves"), ("Dubravka", "Plitvica"), ("Drava", "Mladost SL"), ("Beretinec", "Mladost VT"), ("Mladost SL", "Sloboda"),
("Plitvica", "Zelengaj"), ("Nova Ves", "Dubravka"), ("Sloboda", "Zadrugar"), ("Mladost VT", "Mladost SL"), ("Semovec", "Beretinec"), ("Obres", "Drava"),
("Nova Ves", "Sloboda"), ("Dubravka", "Zelengaj"), ("Drava", "Plitvica"), ("Beretinec", "Obres"), ("Mladost SL", "Semovec"), ("Zadrugar", "Mladost VT"),
("Plitvica", "Beretinec"), ("Zelengaj", "Drava"), ("Sloboda", "Dubravka"), ("Mladost VT", "Nova Ves"), ("Semovec", "Zadrugar"), ("Obres", "Mladost SL"),
("Sloboda", "Mladost VT"), ("Dubravka", "Drava"), ("Beretinec", "Zelengaj"), ("Mladost SL", "Plitvica"), ("Zadrugar", "Obres"), ("Nova Ves", "Semovec"),
("Plitvica", "Zadrugar"), ("Zelengaj", "Mladost SL"), ("Drava", "Beretinec"), ("Mladost VT", "Dubravka"), ("Semovec", "Sloboda"), ("Obres", "Nova Ves"),
("Zelengaj", "Zadrugar"), ("Plitvica", "Nova Ves"), ("Semovec", "Mladost VT"), ("Dubravka", "Beretinec"), ("Drava", "Mladost SL"), ("Obres", "Sloboda"),
("Mladost SL", "Beretinec"), ("Semovec", "Dubravka"), ("Mladost VT", "Obres"), ("Sloboda", "Plitvica"), ("Nova Ves", "Zelengaj"), ("Zadrugar", "Drava"),
("Zelengaj", "Sloboda"), ("Plitvica", "Mladost VT"), ("Obres", "Semovec"), ("Dubravka", "Mladost SL"), ("Beretinec", "Zadrugar"), ("Drava", "Nova Ves"),
("Mladost SL", "Drava"), ("Plitvica", "Obres"), ("Beretinec", "Nova Ves"), ("Sloboda", "Zelengaj"), ("Mladost VT", "Dubravka"), ("Semovec", "Zadrugar"),
("Drava", "Beretinec"), ("Plitvica", "Semovec"), ("Zelengaj", "Mladost SL"), ("Dubravka", "Sloboda"), ("Zadrugar", "Mladost VT"), ("Nova Ves", "Obres"),
("Beretinec", "Sloboda"), ("Sloboda", "Plitvica"), ("Mladost VT", "Drava"), ("Semovec", "Dubravka"), ("Zadrugar", "Nova Ves"), ("Obres", "Zelengaj"),
("Mladost SL", "Beretinec"), ("Drava", "Zadrugar"), ("Plitvica", "Dubravka"), ("Zelengaj", "Semovec"), ("Nova Ves", "Mladost VT"), ("Dubravka", "Obres"),
("Beretinec", "Mladost SL"), ("Sloboda", "Drava"), ("Mladost VT", "Zelengaj"), ("Semovec", "Obres"), ("Zadrugar", "Plitvica"), ("Nova Ves", "Dubravka"),
("Drava", "Mladost SL"), ("Plitvica", "Beretinec"), ("Zelengaj", "Sloboda"), ("Dubravka", "Zadrugar"), ("Obres", "Mladost VT"), ("Mladost VT", "Semovec"),
("Nova Ves", "Zadrugar"), ("Obres", "Sloboda"), ("Mladost SL", "Dubravka"), ("Plitvica", "Semovec"), ("Beretinec", "Zelengaj"), ("Mladost VT", "Drava"),
("Zadrugar", "Plitvica"), ("Mladost SL", "Zelengaj"), ("Beretinec", "Drava"), ("Dubravka", "Mladost VT"), ("Sloboda", "Semovec"), ("Nova Ves", "Obres")
]



num_simulations = 10000
k = 20
position_probabilities, average_points, qualification_probabilities_top8, qualification_probabilities_top24 = run_multiple_simulations(teams, fixtures, initial_points, num_simulations, k=k)

print_results(position_probabilities, average_points, qualification_probabilities_top8, qualification_probabilities_top24)