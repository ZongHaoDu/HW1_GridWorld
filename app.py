from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json
    n = data.get('n', 5)
    start = data.get('start')
    end = data.get('end')
    obstacles = data.get('obstacles', [])
    
    if not start or not end:
        return jsonify({'error': 'Start and End states required'}), 400
        
    start = tuple(start)
    end = tuple(end)
    obs_set = {tuple(o) for o in obstacles}
    
    # Initialize V and Policy
    V_initial = [[random.uniform(0, 1) if (i, j) not in obs_set and (i, j) != end else 0.0 for j in range(n)] for i in range(n)]
    Policy_initial = [[random.choice(['U', 'D', 'L', 'R']) if (i, j) not in obs_set and (i, j) != end else '' for j in range(n)] for i in range(n)]
    
    # Set fixed values for initial state
    for r, c in obs_set:
        V_initial[r][c] = 0.0
        Policy_initial[r][c] = ''
    V_initial[end[0]][end[1]] = 1.0
    Policy_initial[end[0]][end[1]] = 'END'
    
    V = [list(row) for row in V_initial]
    Policy = [list(row) for row in Policy_initial]
    
    gamma = 0.9
    step_penalty = -0.04
    
    actions = {
        'U': (-1, 0),
        'D': (1, 0),
        'L': (0, -1),
        'R': (0, 1)
    }
    
    iterations = 0
    max_iter = 1000
    converged = False
    
    while not converged and iterations < max_iter:
        delta = 0
        new_V = [list(row) for row in V]
        
        for i in range(n):
            for j in range(n):
                if (i, j) == end or (i, j) in obs_set:
                    continue
                
                max_val = -float('inf')
                best_act = 'U'
                
                for act, (di, dj) in actions.items():
                    ni, nj = i + di, j + dj
                    
                    # Boundary check and obstacle check
                    if ni < 0 or ni >= n or nj < 0 or nj >= n or (ni, nj) in obs_set:
                        ni, nj = i, j
                        
                    reward = step_penalty
                    if (ni, nj) == end:
                        reward = 1.0
                        
                    val = reward + gamma * V[ni][nj]
                    if val > max_val:
                        max_val = val
                        best_act = act
                
                new_V[i][j] = max_val
                delta = max(delta, abs(V[i][j] - max_val))
                Policy[i][j] = best_act
                
        V = new_V
        iterations += 1
        if delta < 1e-6:
            converged = True
            
    return jsonify({
        'initial_V': V_initial,
        'initial_Policy': Policy_initial,
        'final_V': V,
        'final_Policy': Policy,
        'iterations': iterations
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
