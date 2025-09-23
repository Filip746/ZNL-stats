import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json
import requests
from typing import Dict, Any
import matplotlib.cm as cm

# Set modern font globally
plt.rcParams["font.family"] = "DejaVu Sans"

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

def create_top6_probability_chart(raw_data: Dict[str, Any]):
    """
    Create Top 6 probability bar chart from API data
    
    Args:
        raw_data: Raw JSON data from API/file
    """
    # Extract team data from overall_statistics
    teams_data = []
    
    if 'overall_statistics' in raw_data and 'teams' in raw_data['overall_statistics']:
        for team_info in raw_data['overall_statistics']['teams']:
            teams_data.append({
                'Team': team_info['team'],
                'Top 6 (%)': team_info['top6_probability'],
                'Proj. Points': team_info['projected_points'],
                'Champion (%)': team_info['champion_probability']
            })
    
    # Convert to DataFrame
    df = pd.DataFrame(teams_data)
    
    # Sort by Top 6 probability descending
    df = df.sort_values(by="Top 6 (%)", ascending=False)
    
    # Create color gradient - zeleni gradijent
    cmap = plt.get_cmap("Greens")
    norm = plt.Normalize(df['Top 6 (%)'].min(), df['Top 6 (%)'].max())
    colors = [cmap(norm(val)) for val in df['Top 6 (%)']]
    
    # Create the chart
    plt.figure(figsize=(13, 7))
    bars = plt.bar(
        df["Team"],
        df["Top 6 (%)"],
        color=colors,
        edgecolor="black",
        linewidth=1.2
    )
    
    # Add percentage labels above each bar
    for idx, v in enumerate(df["Top 6 (%)"]):
        plt.text(idx, v + 2, f"{v:.1f}%", ha="center", fontsize=13, weight="bold", color="#166b29")
    
    # Styling
    plt.ylabel("Vjerojatnost osvajanja Top 6 (%)", fontsize=17, weight="bold", labelpad=12)
    plt.xlabel("Klub", fontsize=17, weight="bold", labelpad=12)
    plt.title("Vjerojatnost plasmana u Top 6 po klubu (%)", fontsize=24, weight="bold", pad=18)
    plt.ylim(0, 105)
    plt.xticks(fontsize=13, weight="bold", color="#333", rotation=40, ha="right")
    plt.yticks(fontsize=13, weight="bold", color="#333")
    plt.grid(True, alpha=0.3, axis='y')
    plt.tight_layout(pad=2)
    plt.show()
    
    # Print summary statistics
    print("\nTop 6 Probability Summary:")
    print("="*50)
    for _, row in df.iterrows():
        print(f"{row['Team']:20} {row['Top 6 (%)']:6.1f}%")

def create_projected_points_chart(raw_data: Dict[str, Any]):
    """
    Create projected points bar chart from API data
    
    Args:
        raw_data: Raw JSON data from API/file
    """
    # Extract team data
    teams_data = []
    
    if 'overall_statistics' in raw_data and 'teams' in raw_data['overall_statistics']:
        for team_info in raw_data['overall_statistics']['teams']:
            teams_data.append({
                'Team': team_info['team'],
                'Proj. Points': team_info['projected_points']
            })
    
    # Convert to DataFrame and sort
    df = pd.DataFrame(teams_data)
    df = df.sort_values(by="Proj. Points", ascending=False)
    
    # Create color gradient - narančasti gradijent
    cmap = plt.get_cmap("Oranges")
    norm = plt.Normalize(df['Proj. Points'].min(), df['Proj. Points'].max())
    colors = [cmap(norm(val)) for val in df['Proj. Points']]
    
    # Create the chart
    plt.figure(figsize=(13, 7))
    bars = plt.bar(
        df["Team"],
        df["Proj. Points"],
        color=colors,
        edgecolor="black",
        linewidth=1.2
    )
    
    # Add point labels above each bar
    for idx, v in enumerate(df["Proj. Points"]):
        plt.text(idx, v + 0.5, f"{v:.1f}", ha="center", fontsize=13, weight="bold", color="#cc5500")
    
    # Styling
    plt.ylabel("Projekcija bodova", fontsize=17, weight="bold", labelpad=12)
    plt.xlabel("Klub", fontsize=17, weight="bold", labelpad=12)
    plt.title("Projekcija bodova za kraj sezone po klubu", fontsize=24, weight="bold", pad=18)
    plt.ylim(0, max(df['Proj. Points']) * 1.1)
    plt.xticks(fontsize=13, weight="bold", color="#333", rotation=40, ha="right")
    plt.yticks(fontsize=13, weight="bold", color="#333")
    plt.grid(True, alpha=0.3, axis='y')
    plt.tight_layout(pad=2)
    plt.show()

def create_champion_probability_chart(raw_data: Dict[str, Any]):
    """
    Create champion probability bar chart from API data
    
    Args:
        raw_data: Raw JSON data from API/file
    """
    # Extract team data
    teams_data = []
    
    if 'overall_statistics' in raw_data and 'teams' in raw_data['overall_statistics']:
        for team_info in raw_data['overall_statistics']['teams']:
            teams_data.append({
                'Team': team_info['team'],
                'Champion (%)': team_info['champion_probability']
            })
    
    # Convert to DataFrame and sort
    df = pd.DataFrame(teams_data)
    df = df.sort_values(by="Champion (%)", ascending=False)
    
    # Create color gradient - zlatni/žuti gradijent
    cmap = plt.get_cmap("YlOrRd")
    norm = plt.Normalize(df['Champion (%)'].min(), df['Champion (%)'].max())
    colors = [cmap(norm(val)) for val in df['Champion (%)']]
    
    # Create the chart
    plt.figure(figsize=(13, 7))
    bars = plt.bar(
        df["Team"],
        df["Champion (%)"],
        color=colors,
        edgecolor="black",
        linewidth=1.2
    )
    
    # Add percentage labels above each bar
    for idx, v in enumerate(df["Champion (%)"]):
        if v > 1:  # Only show labels for teams with >1% chance
            plt.text(idx, v + max(df['Champion (%)'])*0.02, f"{v:.1f}%", 
                    ha="center", fontsize=13, weight="bold", color="#cc2900")
    
    # Styling
    plt.ylabel("Vjerojatnost osvajanja prvenstva (%)", fontsize=17, weight="bold", labelpad=12)
    plt.xlabel("Klub", fontsize=17, weight="bold", labelpad=12)
    plt.title("Vjerojatnost osvajanja prvog mjesta po klubu (%)", fontsize=24, weight="bold", pad=18)
    plt.ylim(0, max(df['Champion (%)']) * 1.15)
    plt.xticks(fontsize=13, weight="bold", color="#333", rotation=40, ha="right")
    plt.yticks(fontsize=13, weight="bold", color="#333")
    plt.grid(True, alpha=0.3, axis='y')
    plt.tight_layout(pad=2)
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
        
        # Create all three charts
        print("Creating Top 6 probability chart...")
        create_top6_probability_chart(raw_data)
        
        print("Creating projected points chart...")
        create_projected_points_chart(raw_data)
        
        print("Creating championship probability chart...")
        create_champion_probability_chart(raw_data)
        
        print("All charts created successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        print("Please check your data source and try again.")
