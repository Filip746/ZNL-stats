import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import json
import requests
from typing import Dict, Any

# Set modern font globally
plt.rcParams['font.family'] = 'DejaVu Sans'

def load_simulation_data(source: str) -> Dict[str, Any]:
    """
    Load simulation data from API endpoint or JSON file
    
    Args:
        source: URL for API endpoint or file path for JSON file
    
    Returns:
        Dictionary containing simulation data
    """
    try:
        if source.startswith('http'):
            # Load from API
            response = requests.get(source)
            response.raise_for_status()
            data = response.json()
            print(f"Data loaded successfully from API: {source}")
        else:
            # Load from local JSON file
            with open(source, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"Data loaded successfully from file: {source}")
        
        return data
    except requests.RequestException as e:
        print(f"Error loading from API: {e}")
        raise
    except FileNotFoundError:
        print(f"File not found: {source}")
        raise
    except json.JSONDecodeError as e:
        print(f"Invalid JSON format: {e}")
        raise

def extract_team_data(raw_data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """
    Extract team data from the overall_statistics structure
    
    Args:
        raw_data: Raw JSON data from API/file
    
    Returns:
        Dictionary with team names as keys and their statistics as values
    """
    teams_data = {}
    
    # Extract from overall_statistics.teams array
    if 'overall_statistics' in raw_data and 'teams' in raw_data['overall_statistics']:
        for team_info in raw_data['overall_statistics']['teams']:
            team_name = team_info['team']
            teams_data[team_name] = {
                'all_position_probabilities': team_info['all_position_probabilities'],
                'champion_probability': team_info['champion_probability'],
                'projected_points': team_info['projected_points'],
                'top6_probability': team_info['top6_probability']
            }
    
    return teams_data

def create_visualizations(simulation_data: Dict[str, Dict[str, Any]]):
    """
    Create all four visualizations from simulation data
    
    Args:
        simulation_data: Dictionary containing team statistics
    """
    teams = list(simulation_data.keys())
    positions = list(range(1, 13))
    
    # Prepare data for position probabilities heatmap
    prob_matrix = []
    for team in teams:
        prob_matrix.append(simulation_data[team]["all_position_probabilities"])
    
    df_positions = pd.DataFrame(prob_matrix, index=teams, columns=positions)
    
    # PLOT 1: Position Probabilities Heatmap
    fig, ax = plt.subplots(figsize=(12, 8))
    sns.heatmap(
        df_positions,
        annot=True,
        fmt='.1f',
        cmap='Greens',
        cbar_kws={'label': 'Vjerojatnost (%)'},
        linewidths=0.5,
        linecolor='white',
        annot_kws={"size": 10, "weight": "bold", "color": "#222"},
        vmin=0,
        vmax=60
    )
    
    ax.set_title('Vjerojatnost tima po poziciji (%)', fontsize=22, weight='bold', pad=30)
    ax.set_xlabel('Vjerojatnosti pozicija nakon 22.kola (%)', fontsize=16, weight='bold', labelpad=12)
    ax.set_ylabel('Klub', fontsize=16, weight='bold', labelpad=12)
    ax.set_xticklabels(ax.get_xticklabels(), fontsize=13, weight='bold', color='#333')
    ax.set_yticklabels(ax.get_yticklabels(), fontsize=13, weight='bold', color='#333', rotation=0)
    ax.xaxis.set_label_position('top')
    ax.xaxis.tick_top()
    
    plt.tight_layout(pad=2)
    plt.subplots_adjust(left=0.25, right=0.98, top=0.88, bottom=0.07)
    plt.show()
    
    # PLOT 2: Champion Probabilities Bar Chart
    fig, ax = plt.subplots(figsize=(12, 8))
    champion_probs = [simulation_data[team]["champion_probability"] for team in teams]
    colors = plt.cm.Greens(np.linspace(0.3, 0.9, len(teams)))
    
    bars = ax.barh(teams, champion_probs, color=colors, edgecolor='white', linewidth=1.5)
    
    for i, (bar, prob) in enumerate(zip(bars, champion_probs)):
        ax.text(bar.get_width() + max(champion_probs)*0.01, bar.get_y() + bar.get_height()/2, 
                f'{prob:.1f}%', ha='left', va='center', fontsize=12, weight='bold')
    
    ax.set_title('Vjerojatnost osvajanja prvog mjesta', fontsize=22, weight='bold', pad=30)
    ax.set_xlabel('Vjerojatnost (%)', fontsize=16, weight='bold', labelpad=12)
    ax.set_ylabel('Klub', fontsize=16, weight='bold', labelpad=12)
    ax.set_xlim(0, max(champion_probs) * 1.15)
    ax.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    plt.show()
    
    # PLOT 3: Top 6 Probabilities
    fig, ax = plt.subplots(figsize=(12, 8))
    top6_probs = [simulation_data[team]["top6_probability"] for team in teams]
    colors = plt.cm.Blues(np.linspace(0.3, 0.9, len(teams)))
    
    bars = ax.barh(teams, top6_probs, color=colors, edgecolor='white', linewidth=1.5)
    
    for i, (bar, prob) in enumerate(zip(bars, top6_probs)):
        ax.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2, 
                f'{prob:.1f}%', ha='left', va='center', fontsize=12, weight='bold')
    
    ax.set_title('Vjerojatnost ulaska u TOP 6', fontsize=22, weight='bold', pad=30)
    ax.set_xlabel('Vjerojatnost (%)', fontsize=16, weight='bold', labelpad=12)
    ax.set_ylabel('Klub', fontsize=16, weight='bold', labelpad=12)
    ax.set_xlim(0, 105)
    ax.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    plt.show()
    
    # PLOT 4: Projected Points
    fig, ax = plt.subplots(figsize=(12, 8))
    projected_pts = [simulation_data[team]["projected_points"] for team in teams]
    colors = plt.cm.Oranges(np.linspace(0.4, 0.9, len(teams)))
    
    bars = ax.barh(teams, projected_pts, color=colors, edgecolor='white', linewidth=1.5)
    
    for i, (bar, pts) in enumerate(zip(bars, projected_pts)):
        ax.text(bar.get_width() + max(projected_pts)*0.01, bar.get_y() + bar.get_height()/2, 
                f'{pts:.1f}', ha='left', va='center', fontsize=12, weight='bold')
    
    ax.set_title('Projekcija bodova nakon 22.kola', fontsize=22, weight='bold', pad=30)
    ax.set_xlabel('Projekcija bodova', fontsize=16, weight='bold', labelpad=12)
    ax.set_ylabel('Klub', fontsize=16, weight='bold', labelpad=12)
    ax.set_xlim(0, max(projected_pts) * 1.1)
    ax.grid(True, alpha=0.3, axis='x')
    
    plt.tight_layout()
    plt.show()

# MAIN EXECUTION
if __name__ == "__main__":
    # Define your data source (API endpoint or JSON file path)
    # For API:
    data_source = "http://localhost:5000/api/simulation-text"
    # For local JSON file:
    # data_source = "simulation_data.json"
    
    try:
        # Load data from API or file
        raw_data = load_simulation_data(data_source)
        
        # Extract team data from the JSON structure
        simulation_data = extract_team_data(raw_data)
        
        # Verify data was loaded correctly
        print(f"Loaded data for {len(simulation_data)} teams:")
        for team in simulation_data.keys():
            print(f"  - {team}")
        
        # Create all visualizations
        create_visualizations(simulation_data)
        
    except Exception as e:
        print(f"Error: {e}")
        print("Please check your data source and try again.")
