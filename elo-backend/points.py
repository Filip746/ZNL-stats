import random
import math
import numpy as np
from collections import Counter
from runELO import (
    teams, fixtures, initial_points, k, num_simulations,
    simulate_league, run_complete_championship_simulation
)

def calculate_points_distribution(team_name, num_simulations=10000):
    """
    Računa distribuciju bodova za određeni tim kroz sve simulacije
    """
    if team_name not in teams:
        return None
    
    print(f"Računam distribuciju bodova za {team_name}...")
    
    # Pokreni kompletnu simulaciju
    all_results, champ_appearances, releg_appearances = run_complete_championship_simulation(
        teams, fixtures, num_simulations=num_simulations, k=k
    )
    
    # Dobij sve bodove za odabrani tim
    team_points = all_results[team_name]
    
    # Izračunaj statistike
    min_points = min(team_points)
    max_points = max(team_points)
    avg_points = np.mean(team_points)
    std_points = np.std(team_points)
    
    # Napravi histogram bodova
    points_counter = Counter([int(round(points)) for points in team_points])
    
    # Izračunaj postotke za svaki broj bodova
    total_simulations = len(team_points)
    distribution = {}
    
    for points in range(int(min_points), int(max_points) + 1):
        count = points_counter.get(points, 0)
        percentage = (count / total_simulations) * 100
        if percentage > 0:  # Samo prikaži bodove s vjerojatnošću > 0%
            distribution[points] = {
                'count': count,
                'percentage': round(percentage, 2)
            }
    
    return {
        'team': team_name,
        'total_simulations': total_simulations,
        'statistics': {
            'min_points': round(min_points, 1),
            'max_points': round(max_points, 1),
            'avg_points': round(avg_points, 2),
            'std_points': round(std_points, 2)
        },
        'distribution': distribution,
        'league_appearances': {
            'champions_league_percentage': round((champ_appearances[team_name] / num_simulations) * 100, 1),
            'relegation_league_percentage': round((releg_appearances[team_name] / num_simulations) * 100, 1)
        }
    }

def calculate_all_teams_distribution(num_simulations=10000):
    """
    Računa distribuciju bodova za sve timove odjednom (efikasnija metoda)
    """
    print(f"Računam distribuciju bodova za sve timove ({num_simulations} simulacija)...")
    
    # Pokreni kompletnu simulaciju
    all_results, champ_appearances, releg_appearances = run_complete_championship_simulation(
        teams, fixtures, num_simulations=num_simulations, k=k
    )
    
    results = {}
    
    for team_name in teams.keys():
        team_points = all_results[team_name]
        
        # Statistike
        min_points = min(team_points)
        max_points = max(team_points)
        avg_points = np.mean(team_points)
        std_points = np.std(team_points)
        
        # Histogram
        points_counter = Counter([int(round(points)) for points in team_points])
        
        # Distribucija
        distribution = {}
        for points in range(int(min_points), int(max_points) + 1):
            count = points_counter.get(points, 0)
            percentage = (count / num_simulations) * 100
            if percentage > 0.01:  # Prikaži samo bodove s vjerojatnošću > 0.01%
                distribution[points] = {
                    'count': count,
                    'percentage': round(percentage, 2)
                }
        
        results[team_name] = {
            'team': team_name,
            'total_simulations': num_simulations,
            'statistics': {
                'min_points': round(min_points, 1),
                'max_points': round(max_points, 1),
                'avg_points': round(avg_points, 2),
                'std_points': round(std_points, 2)
            },
            'distribution': distribution,
            'league_appearances': {
                'champions_league_percentage': round((champ_appearances[team_name] / num_simulations) * 100, 1),
                'relegation_league_percentage': round((releg_appearances[team_name] / num_simulations) * 100, 1)
            }
        }
    
    return results

def format_distribution_for_chart(distribution_data):
    """
    Formatira podatke za frontend chart (kao na slici)
    """
    distribution = distribution_data['distribution']
    
    # Sortiraj bodove
    sorted_points = sorted(distribution.keys())
    
    chart_data = []
    for points in sorted_points:
        chart_data.append({
            'points': points,
            'percentage': distribution[points]['percentage'],
            'count': distribution[points]['count']
        })
    
    return {
        'team': distribution_data['team'],
        'statistics': distribution_data['statistics'],
        'league_appearances': distribution_data['league_appearances'],
        'chart_data': chart_data
    }

# Test funkcije
if __name__ == "__main__":
    # Test za jedan tim
    test_team = "Zadrugar"
    print(f"Testiram distribuciju za {test_team}...")
    
    result = calculate_points_distribution(test_team, num_simulations=1000)  # Manje simulacija za test
    
    if result:
        print(f"\n=== POINTS DISTRIBUTION ZA {test_team} ===")
        print(f"Prosjek: {result['statistics']['avg_points']} bodova")
        print(f"Raspon: {result['statistics']['min_points']} - {result['statistics']['max_points']} bodova")
        print(f"Liga prvaka: {result['league_appearances']['champions_league_percentage']}%")
        print(f"Liga ostanak: {result['league_appearances']['relegation_league_percentage']}%")
        
        print("\nNajvjerojatniji broj bodova:")
        sorted_dist = sorted(result['distribution'].items(), key=lambda x: x[1]['percentage'], reverse=True)
        for points, data in sorted_dist[:10]:  # Top 10
            print(f"  {points} bodova: {data['percentage']}%")
    
    # Formatiranje za chart
    chart_data = format_distribution_for_chart(result)
    print(f"\nChart data ima {len(chart_data['chart_data'])} točaka")
