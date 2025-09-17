from flask import Flask, jsonify, request, send_from_directory
import pandas as pd
from flask_cors import CORS
import io
import sys

app = Flask(__name__)
CORS(app)

@app.route('/api/elo', methods=['GET'])
def elo_table():
    """Vraća trenutne ELO ratinge timova"""
    df = pd.read_csv('current_elo.csv')
    elo_dict = df.set_index(df.columns[0]).to_dict(orient='index')
    return jsonify(elo_dict)

@app.route('/api/simulation-text', methods=['GET'])
def simulation_text():
    """Vraća strukturirani JSON s rezultatima simulacije lige"""
    from runELO import (
        teams, fixtures, initial_points, k, num_simulations,
        run_multiple_simulations, simulate_league, generate_second_phase_fixtures,
        print_results,
    )

    # --- PRVA FAZA - Monte Carlo simulacija ---
    position_probs, avg_points_dict, qual_top8_dict, qual_top24_dict = run_multiple_simulations(
        teams, fixtures, initial_points, num_simulations=num_simulations, k=k
    )
    
    sorted_avg = sorted(avg_points_dict.items(), key=lambda x: x[1], reverse=True)
    liga_prvaka = [t for t, _ in sorted_avg[:6]]
    liga_ostanak = [t for t, _ in sorted_avg[6:]]

    # ✅ ISPRAVKA: Računaj prosjek bodova i ELO-a nakon prve faze
    # Simuliraj prvu fazu više puta da dobiješ reprezentativne početne uvjete za drugu fazu
    total_points_after_phase1 = {team: 0 for team in teams}
    total_elos_after_phase1 = {team: 0 for team in teams}
    
    phase1_simulations = 500  # Optimalno između brzine i preciznosti
    
    for _ in range(phase1_simulations):
        pts_temp, elos_temp = simulate_league(teams, fixtures, initial_points, k)
        for team in teams:
            total_points_after_phase1[team] += pts_temp[team]
            total_elos_after_phase1[team] += elos_temp[team]
    
    # Izračunaj prosjek nakon prve faze
    avg_points_after_phase1 = {team: total_points_after_phase1[team] / phase1_simulations for team in teams}
    avg_elos_after_phase1 = {team: total_elos_after_phase1[team] / phase1_simulations for team in teams}

    # --- DRUGA FAZA: Liga za prvaka ---
    fix_prvaka = generate_second_phase_fixtures(liga_prvaka)
    teams_prv = {t: avg_elos_after_phase1[t] for t in liga_prvaka}  # ✅ Koristi prosjek ELO
    pts_prv = {t: avg_points_after_phase1[t] for t in liga_prvaka}  # ✅ Koristi prosjek bodova

    # --- DRUGA FAZA: Liga za ostanak ---
    fix_ostanak = generate_second_phase_fixtures(liga_ostanak)
    teams_ost = {t: avg_elos_after_phase1[t] for t in liga_ostanak}  # ✅ Koristi prosjek ELO
    pts_ost = {t: avg_points_after_phase1[t] for t in liga_ostanak}  # ✅ Koristi prosjek bodova

    # Simuliraj druge faze
    pts_prv_final, elos_prv_final = simulate_league(teams_prv, fix_prvaka, pts_prv, k)
    prob_prv, avg_prv, qual_top8_prv, qual_top24_prv = run_multiple_simulations(
        teams_prv, fix_prvaka, pts_prv, num_simulations=num_simulations, k=k
    )
    
    pts_ost_final, elos_ost_final = simulate_league(teams_ost, fix_ostanak, pts_ost, k)
    prob_ost, avg_ost, qual_top8_ost, qual_top24_ost = run_multiple_simulations(
        teams_ost, fix_ostanak, pts_ost, num_simulations=num_simulations, k=k
    )

    # --- FORMATIRANJE REZULTATA U STRUKTURIRANI JSON ---
    
    # Prva faza - bodovi timova
    phase1_teams = []
    for team, points in sorted_avg:
        phase1_teams.append({
            "team": team,
            "projected_points": round(points, 2)
        })

    # Liga za prvaka
    liga_prvaka_results = []
    sorted_prv = sorted(pts_prv_final.items(), key=lambda x: x[1], reverse=True)
    for position, (team, _) in enumerate(sorted_prv, 1):
        avg_pts = avg_prv[team]
        probs = prob_prv[team][:6]
        liga_prvaka_results.append({
            "position": position,
            "team": team,
            "projected_points": round(avg_pts, 2),
            "starting_points_phase2": round(pts_prv[team], 2),  # ✅ Dodano za debug
            "position_probabilities": {
                "1st": round(probs[0], 2),
                "2nd": round(probs[1], 2),
                "3rd": round(probs[2], 2),
                "4th": round(probs[3], 2),
                "5th": round(probs[4], 2),
                "6th": round(probs[5], 2)
            }
        })

    # Liga za ostanak
    liga_ostanak_results = []
    sorted_ost = sorted(pts_ost_final.items(), key=lambda x: x[1], reverse=True)
    for position, (team, _) in enumerate(sorted_ost, 1):
        avg_pts = avg_ost[team]
        probs = prob_ost[team][:6]
        liga_ostanak_results.append({
            "position": position,
            "team": team,
            "projected_points": round(avg_pts, 2),
            "starting_points_phase2": round(pts_ost[team], 2),  # ✅ Dodano za debug
            "position_probabilities": {
                "1st": round(probs[0], 2),
                "2nd": round(probs[1], 2),
                "3rd": round(probs[2], 2),
                "4th": round(probs[3], 2),
                "5th": round(probs[4], 2),
                "6th": round(probs[5], 2)
            }
        })

    # Opća statistika (iz prve faze)
    overall_stats = []
    for team, avg_points in sorted_avg:
        team_probs = position_probs[team]
        champion_prob = team_probs[0] if len(team_probs) > 0 else 0
        top6_prob = sum(team_probs[:6]) if len(team_probs) >= 6 else sum(team_probs)
        
        overall_stats.append({
            "team": team,
            "projected_points": round(avg_points, 2),
            "champion_probability": round(champion_prob, 2),
            "top6_probability": round(top6_prob, 2),
            "all_position_probabilities": [round(p, 2) for p in team_probs[:12]]
        })

    # Finalni strukturirani JSON
    result = {
        "simulation_summary": {
            "total_simulations": num_simulations,
            "k_factor": k,
            "phase1_simulations_for_avg": phase1_simulations,
            "phase_structure": {
                "phase1": "Svi timovi igraju međusobno (22 kola)",
                "phase2_champions": "Top 6 timova se bore za prvaka (dodatnih 5 kola)",
                "phase2_relegation": "Bottom 6 timova se bore protiv ispadanja (dodatnih 5 kola)"
            }
        },
        "phase1_results": {
            "description": "Projekcije bodova nakon prve faze (22 kola)",
            "teams": phase1_teams
        },
        "champions_league": {
            "description": "Liga za prvaka (Top 6 timova - ukupno 27 kola)",
            "teams": liga_prvaka_results
        },
        "relegation_league": {
            "description": "Liga za ostanak (Bottom 6 timova - ukupno 27 kola)",
            "teams": liga_ostanak_results
        },
        "overall_statistics": {
            "description": "Ukupne statistike i vjerojatnosti (prva faza)",
            "teams": overall_stats
        },
        "phase_connection_info": {
            "description": "Informacije o povezivanju faza",
            "phase1_avg_points": {team: round(pts, 2) for team, pts in avg_points_after_phase1.items()},
            "champions_starting_points": {team: round(pts_prv[team], 2) for team in liga_prvaka},
            "relegation_starting_points": {team: round(pts_ost[team], 2) for team in liga_ostanak}
        },
        "metadata": {
            "generated_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S"),
            "total_teams": len(teams),
            "simulation_type": "ELO-based Monte Carlo with connected phases"
        }
    }

    return jsonify(result)

@app.route('/api/simulation-legacy', methods=['GET'])
def simulation_legacy():
    """Vraća originalni tekstualni format za kompatibilnost"""
    from runELO import (
        teams, fixtures, initial_points, k, num_simulations,
        run_multiple_simulations, simulate_league, generate_second_phase_fixtures,
        print_results,
    )

    # Originalni kod za tekstualni format
    position_probs, avg_points_dict, qual_top8_dict, qual_top24_dict = run_multiple_simulations(
        teams, fixtures, initial_points, num_simulations=num_simulations, k=k
    )
    sorted_avg = sorted(avg_points_dict.items(), key=lambda x: x[1], reverse=True)
    top_phase1 = "\n".join([f"{t}: {pts:.2f} bodova" for t, pts in sorted_avg])
    liga_prvaka = [t for t, _ in sorted_avg[:6]]
    liga_ostanak = [t for t, _ in sorted_avg[6:]]
    
    # Koristi reprezentativnu simulaciju za početak druge faze
    pts1, elos1 = simulate_league(teams, fixtures, initial_points, k)

    # Liga za prvaka
    fix_prvaka = generate_second_phase_fixtures(liga_prvaka)
    teams_prv = {t: elos1[t] for t in liga_prvaka}
    pts_prv = {t: pts1[t] for t in liga_prvaka}

    # Liga za ostanak
    fix_ostanak = generate_second_phase_fixtures(liga_ostanak)
    teams_ost = {t: elos1[t] for t in liga_ostanak}
    pts_ost = {t: pts1[t] for t in liga_ostanak}

    pts_prv_final, elos_prv_final = simulate_league(teams_prv, fix_prvaka, pts_prv, k)
    prob_prv, avg_prv, qual_top8_prv, qual_top24_prv = run_multiple_simulations(
        teams_prv, fix_prvaka, pts_prv, num_simulations=num_simulations, k=k
    )
    pts_ost_final, elos_ost_final = simulate_league(teams_ost, fix_ostanak, pts_ost, k)
    prob_ost, avg_ost, qual_top8_ost, qual_top24_ost = run_multiple_simulations(
        teams_ost, fix_ostanak, pts_ost, num_simulations=num_simulations, k=k
    )

    # Tablica liga prvaka
    tab_prvaka = []
    tab_prvaka.append(f"{'Mjesto':<7}{'Tim':<15}{'Bodovi':<8}" + "".join(f"{i:>6}" for i in range(1, 7)))
    tab_prvaka.append("-" * 80)
    sorted_prv = sorted(pts_prv_final.items(), key=lambda x: x[1], reverse=True)
    for i, (team, _) in enumerate(sorted_prv, 1):
        avg_pts = avg_prv[team]
        probs = prob_prv[team][:6]
        prob_str = "".join(f"{p:6.2f}" for p in probs)
        tab_prvaka.append(f"{i:<7}{team:<15}{avg_pts:<8.2f}{prob_str}")
    tab_prvaka = "\n".join(tab_prvaka)

    # Tablica liga za ostanak
    tab_ostanak = []
    tab_ostanak.append(f"{'Mjesto':<7}{'Tim':<15}{'Bodovi':<8}" + "".join(f"{i:>6}" for i in range(1, 7)))
    tab_ostanak.append("-" * 80)
    sorted_ost = sorted(pts_ost_final.items(), key=lambda x: x[1], reverse=True)
    for i, (team, _) in enumerate(sorted_ost, 1):
        avg_pts = avg_ost[team]
        probs = prob_ost[team][:6]
        prob_str = "".join(f"{p:6.2f}" for p in probs)
        tab_ostanak.append(f"{i:<7}{team:<15}{avg_pts:<8.2f}{prob_str}")
    tab_ostanak = "\n".join(tab_ostanak)

    # Ostale statistike
    buf = io.StringIO()
    sys.stdout = buf
    print_results(position_probs, avg_points_dict, qual_top8_dict, qual_top24_dict)
    sys.stdout = sys.__stdout__
    extra_stats = buf.getvalue()

    return jsonify({
        "phase1": top_phase1 or "",
        "liga_prvaka": tab_prvaka or "",
        "liga_ostanak": tab_ostanak or "",
        "stats": extra_stats or "",
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Provjera zdravlja API-ja"""
    return jsonify({
        "status": "healthy",
        "service": "ELO Liga Simulacija",
        "version": "2.0.0",
        "timestamp": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    })

@app.route('/api/points-distribution/<team_name>', methods=['GET'])
def points_distribution_single(team_name):
    """Vraća distribuciju bodova za određeni tim"""
    try:
        from points import calculate_points_distribution, format_distribution_for_chart
        
        # Provjeri postoji li tim
        from runELO import teams
        if team_name not in teams:
            return jsonify({'error': f'Tim {team_name} ne postoji'}), 404
        
        # Izračunaj distribuciju
        num_sims = request.args.get('simulations', 10000, type=int)  # Default 10000 za brzinu
        distribution = calculate_points_distribution(team_name, num_simulations=num_sims)
        
        if not distribution:
            return jsonify({'error': 'Greška u računanju distribucije'}), 500
        
        # Formatiranje za chart
        chart_data = format_distribution_for_chart(distribution)
        
        return jsonify(chart_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/points-distribution-all', methods=['GET'])
def points_distribution_all():
    """Vraća distribuciju bodova za sve timove"""
    try:
        from points import calculate_all_teams_distribution, format_distribution_for_chart
        
        num_sims = request.args.get('simulations', 10000, type=int)  # Manje simulacija za sve timove
        all_distributions = calculate_all_teams_distribution(num_simulations=num_sims)
        
        # Formatiranje za frontend
        formatted_data = {}
        for team_name, dist_data in all_distributions.items():
            formatted_data[team_name] = format_distribution_for_chart(dist_data)
        
        return jsonify({
            'teams': formatted_data,
            'metadata': {
                'total_simulations': num_sims,
                'total_teams': len(formatted_data),
                'generated_at': pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/positions-conditional/<team_name>', methods=['GET'])
def positions_conditional_single(team_name):
    """Vraća uvjetne vjerojatnosti pozicija za određeni tim"""
    try:
        from runELO import (
            teams, fixtures, initial_points, k,
            calculate_positions_conditional_optimized
        )
        
        if team_name not in teams:
            return jsonify({'error': f'Tim {team_name} ne postoji'}), 404
        
        num_sims = request.args.get('simulations', 10000, type=int)
        
        # Izračunaj uvjetne vjerojatnosti
        all_conditional = calculate_positions_conditional_optimized(
            teams, fixtures, initial_points, num_simulations=num_sims, k=k
        )
        
        if team_name not in all_conditional:
            return jsonify({'error': 'Nema podataka za tim'}), 404
        
        team_data = all_conditional[team_name]
        
        # Formatiranje za frontend
        formatted_data = {
            'team': team_name,
            'total_simulations': num_sims,
            'points_scenarios': []
        }
        
        # Sortiraj po bodovima (najveći broj bodova prvo)
        for points in sorted(team_data.keys(), reverse=True):
            data = team_data[points]
            scenario = {
                'points': points,
                'sample_size': data['sample_size'],
                'position_probabilities': {}
            }
            
            # Dodaj samo pozicije s vjerojatnošću > 0.5%
            for pos, prob in enumerate(data['position_probabilities'], 1):
                if prob > 0.5:
                    scenario['position_probabilities'][f'#{pos}'] = round(prob, 1)
            
            formatted_data['points_scenarios'].append(scenario)
        
        return jsonify(formatted_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/positions-conditional-matrix/<team_name>', methods=['GET'])
def positions_conditional_matrix(team_name):
    """Vraća matricu uvjetnih vjerojatnosti (kao na slici)"""
    try:
        from runELO import (
            teams, fixtures, initial_points, k,
            calculate_positions_conditional_optimized
        )
        
        if team_name not in teams:
            return jsonify({'error': f'Tim {team_name} ne postoji'}), 404
        
        num_sims = request.args.get('simulations', 10000, type=int)
        
        all_conditional = calculate_positions_conditional_optimized(
            teams, fixtures, initial_points, num_simulations=num_sims, k=k
        )
        
        team_data = all_conditional.get(team_name, {})
        
        # Kreiraj matricu kao na slici
        matrix_data = {
            'team': team_name,
            'total_simulations': num_sims,
            'matrix': []
        }
        
        # Sortiraj bodove od najvećih prema najmanjima
        sorted_points = sorted(team_data.keys(), reverse=True)
        
        for points in sorted_points:
            data = team_data[points]
            row = {
                'points': points,
                'sample_size': data['sample_size'],
                'positions': {}
            }
            
            # Dodaj vjerojatnosti za sve pozicije
            for pos in range(len(teams)):  # 12 pozicija
                prob = data['position_probabilities'][pos] if pos < len(data['position_probabilities']) else 0
                if prob > 0.1:  # Prikaži samo ako je > 0.1%
                    row['positions'][f'#{pos + 1}'] = round(prob, 1)
            
            if row['positions']:  # Dodaj samo redove s podacima
                matrix_data['matrix'].append(row)
        
        return jsonify(matrix_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams', methods=['GET'])
def get_teams():
    """Vraća listu dostupnih timova"""
    try:
        from runELO import teams
        return jsonify({
            'teams': list(teams.keys()),
            'total_teams': len(teams)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
