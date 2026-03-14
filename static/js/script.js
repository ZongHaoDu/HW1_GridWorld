document.addEventListener('DOMContentLoaded', () => {
    const sizeInput = document.getElementById('grid-size');
    const sizeVal = document.getElementById('size-val');
    const gridContainer = document.getElementById('grid-container');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const obsMaxSpan = document.getElementById('obs-max');
    const obsCountSpan = document.getElementById('obs-count');
    const btnInit = document.getElementById('btn-init');
    const btnSolve = document.getElementById('btn-solve');
    const resultsPanel = document.getElementById('results-panel');

    let n = parseInt(sizeInput.value);
    let currentMode = 'start'; // start, end, obstacle
    let startCell = null; // {r, c}
    let endCell = null; // {r, c}
    let obstacles = []; // [{r, c}, ...]

    // Initialize
    updateGridSize();

    sizeInput.addEventListener('input', (e) => {
        n = parseInt(e.target.value);
        sizeVal.textContent = n;
        updateGridSize();
    });

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
        });
    });

    function updateGridSize() {
        // Reset states
        startCell = null;
        endCell = null;
        obstacles = [];
        updateObstacleCounter();
        resultsPanel.style.display = 'none';

        obsMaxSpan.textContent = n - 2;

        gridContainer.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        gridContainer.innerHTML = '';

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.addEventListener('click', () => handleCellClick(r, c, cell));
                gridContainer.appendChild(cell);
            }
        }
    }

    function getCell(r, c, container = gridContainer) {
        return container.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    }

    function handleCellClick(r, c, cell) {
        resultsPanel.style.display = 'none';

        const isStart = startCell && startCell.r === r && startCell.c === c;
        const isEnd = endCell && endCell.r === r && endCell.c === c;
        const obsIndex = obstacles.findIndex(o => o.r === r && o.c === c);

        if (currentMode === 'start') {
            if (isEnd) endCell = null;
            if (obsIndex >= 0) obstacles.splice(obsIndex, 1);

            if (startCell) {
                const oldStart = getCell(startCell.r, startCell.c);
                if (oldStart) oldStart.className = 'cell';
            }
            startCell = { r, c };
            cell.className = 'cell start';
        }
        else if (currentMode === 'end') {
            if (isStart) startCell = null;
            if (obsIndex >= 0) obstacles.splice(obsIndex, 1);

            if (endCell) {
                const oldEnd = getCell(endCell.r, endCell.c);
                if (oldEnd) oldEnd.className = 'cell';
            }
            endCell = { r, c };
            cell.className = 'cell end';
        }
        else if (currentMode === 'obstacle') {
            if (isStart) {
                startCell = null;
                cell.className = 'cell';
            }
            if (isEnd) {
                endCell = null;
                cell.className = 'cell';
            }

            if (obsIndex >= 0) {
                // remove obstacle
                obstacles.splice(obsIndex, 1);
                cell.className = 'cell';
            } else {
                // max obstacles is n - 2
                if (obstacles.length < n - 2) {
                    obstacles.push({ r, c });
                    cell.className = 'cell obstacle';
                } else {
                    alert(`Maximum ${n - 2} obstacles allowed for ${n}x${n} grid.`);
                }
            }
        }
        updateObstacleCounter();
    }

    function updateObstacleCounter() {
        obsCountSpan.textContent = obstacles.length;
    }

    btnInit.addEventListener('click', async () => {
        await solve('init');
    });

    btnSolve.addEventListener('click', async () => {
        await solve('solve');
    });

    async function solve(type) {
        if (!startCell || !endCell) {
            alert("Please set both Start and End cells.");
            return;
        }

        const payload = {
            n: n,
            start: [startCell.r, startCell.c],
            end: [endCell.r, endCell.c],
            obstacles: obstacles.map(o => [o.r, o.c])
        };

        try {
            const btn = type === 'init' ? btnInit : btnSolve;
            const originalText = btn.textContent;
            btn.textContent = "Processing...";
            btn.disabled = true;

            const req = await fetch('/solve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const res = await req.json();

            btn.textContent = originalText;
            btn.disabled = false;

            if (res.error) {
                alert(res.error);
                return;
            }

            displayResults(res, type);

        } catch (e) {
            console.error(e);
            alert("Error communicating with backend.");
        }
    }

    function displayResults(data, type) {
        resultsPanel.style.display = 'flex';

        const valTitle = document.getElementById('res-val-title');
        const polTitle = document.getElementById('res-pol-title');

        if (type === 'init') {
            valTitle.textContent = 'Initial Value Matrix';
            polTitle.textContent = 'Initial Policy Matrix';
            renderMatrix('value-grid', data.initial_V, 'value');
            renderMatrix('policy-grid', data.initial_Policy, 'policy');
        } else {
            valTitle.textContent = 'Converged Value Matrix';
            polTitle.textContent = 'Converged Policy Matrix';
            renderMatrix('value-grid', data.final_V, 'value');
            renderMatrix('policy-grid', data.final_Policy, 'policy');
        }
    }

    function renderMatrix(containerId, matrixData, displayType) {
        const container = document.getElementById(containerId);
        container.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
        container.innerHTML = '';

        let maxV = -Infinity;
        let minV = Infinity;
        if (displayType === 'value') {
            for (let r = 0; r < n; r++) {
                for (let c = 0; c < n; c++) {
                    if (startCell && startCell.r === r && startCell.c === c) continue;
                    const v = matrixData[r][c];
                    if (v > maxV) maxV = v;
                    if (v < minV) minV = v;
                }
            }
        }

        const arrowMap = {
            'U': '↑',
            'D': '↓',
            'L': '←',
            'R': '→',
            'END': '★',
            '': ''
        };

        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                const cell = document.createElement('div');
                let cellClass = 'cell';

                const isStart = startCell && startCell.r === r && startCell.c === c;
                const isEnd = endCell && endCell.r === r && endCell.c === c;
                const isObs = obstacles.some(o => o.r === r && o.c === c);

                if (isStart) cellClass += ' start';
                else if (isEnd) cellClass += ' end';
                else if (isObs) cellClass += ' obstacle';

                cell.className = cellClass;

                if (!isObs) {
                    if (displayType === 'policy') {
                        const act = matrixData[r][c];
                        const arrowDiv = document.createElement('div');
                        arrowDiv.className = 'cell-arrow';
                        arrowDiv.style.fontSize = '1.8rem';
                        arrowDiv.style.marginBottom = '0';
                        arrowDiv.textContent = arrowMap[act] || '';
                        cell.appendChild(arrowDiv);
                    } else if (displayType === 'value') {
                        const val = matrixData[r][c];
                        const valDiv = document.createElement('div');
                        valDiv.className = 'cell-value';
                        valDiv.style.fontSize = '0.9rem';
                        valDiv.textContent = typeof val === 'number' ? val.toFixed(2) : val;
                        cell.appendChild(valDiv);

                        if (!isStart && !isEnd && typeof val === 'number') {
                            let norm = 0;
                            if (maxV > minV) norm = (val - minV) / (maxV - minV);
                            cell.style.backgroundColor = `rgba(99, 102, 241, ${0.1 + norm * 0.4})`;
                        }
                    }
                }

                container.appendChild(cell);
            }
        }
    }
});
