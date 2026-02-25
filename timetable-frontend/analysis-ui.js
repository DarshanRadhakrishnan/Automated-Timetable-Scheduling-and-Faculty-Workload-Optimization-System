const BASE_URL = 'http://localhost:5000/api';

async function showAnalysisUI(mode) {
    currentView = `analysis_${mode}`;
    showStatus(`Loading ${mode} Analysis Tool... ⏳`, 'info');

    // Prefetch dropdown data
    let faculties = [], rooms = [];
    try {
        const [fData, rData] = await Promise.all([
            fetch(`${BASE_URL}/faculty`).then(r => r.json()),
            fetch(`${BASE_URL}/room`).then(r => r.json())
        ]);
        faculties = fData.data || [];
        rooms = rData.data || [];
    } catch (e) { console.error('Error fetching entities:', e); }

    let html = `<div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">`;

    if (mode === 'faculty') {
        html += `
            <h2 style="color: #ff6b6b; margin-bottom: 20px;">🌡️ Faculty Impact Analysis</h2>
            <p style="margin-bottom: 20px; color: #666;">Analyze the workload and impact of a specific faculty member on the schedule.</p>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Select Faculty:</label>
            <select id="analysisFaculty" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; font-size: 16px;">
                ${faculties.map(f => `<option value="${f._id}">${f.name}</option>`).join('')}
            </select>
            
            <button onclick="runFacultyAnalysis()" class="success" style="width: 100%; padding: 15px; font-size: 1.1em;">Analyze Impact</button>
        `;
    } else if (mode === 'room') {
        html += `
            <h2 style="color: #f368e0; margin-bottom: 20px;">🏚️ Room Shortage Analysis</h2>
            <p style="margin-bottom: 20px; color: #666;">Identify usage patterns and find alternatives for overbooked or unavailable rooms.</p>
            
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Select Room:</label>
            <select id="analysisRoom" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; font-size: 16px;">
                ${rooms.map(r => `<option value="${r._id}">${r.name} (${r.roomType})</option>`).join('')}
            </select>
            
            <button onclick="runRoomAnalysis()" class="success" style="width: 100%; padding: 15px; font-size: 1.1em;">Analyze Room</button>
        `;
    } else if (mode === 'bulk') {
        html += `
            <h2 style="color: #ff9f43; margin-bottom: 20px;">📊 Bulk Faculty Analysis</h2>
            <p style="margin-bottom: 20px; color: #666;">Scan ALL faculty members to identify high-risk workload situations instantly.</p>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9f43;">
                <strong>Note:</strong> This will analyze ${faculties.length} faculty members. It may take a few seconds.
            </div>
            
            <button onclick="runBulkAnalysis()" class="success" style="width: 100%; padding: 15px; font-size: 1.1em;">Run Full Analysis</button>
        `;
    }

    html += `</div><div id="analysisResults" style="margin-top: 30px;"></div>`;

    document.getElementById('results').innerHTML = html;
}

async function runFacultyAnalysis() {
    const facultyId = document.getElementById('analysisFaculty').value;
    if (!facultyId) return showStatus('Please select a faculty member', 'error');

    showStatus('Analyzing faculty impact... ⏳', 'info');
    document.getElementById('analysisResults').innerHTML = '<div class="loading">Calculating impact metrics...</div>';

    try {
        const res = await fetch(`${BASE_URL}/analysis/faculty-impact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ facultyId })
        });
        const data = await res.json();

        if (res.ok) {
            displayFacultyImpact(data);
            showStatus('Analysis complete! ✅', 'success');
        } else {
            showStatus(`Error: ${data.message || data.error}`, 'error');
            displayJSON(data);
        }
    } catch (e) {
        showStatus(`Network Error: ${e.message}`, 'error');
    }
}

function displayFacultyImpact(data) {
    const { faculty, impact, recommendations, affectedClasses } = data;
    const severityColor = impact.severity === 'CRITICAL' ? '#ff4757' : (impact.severity === 'HIGH' ? '#ffa502' : '#2ed573');

    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <!-- Key Metrics Card -->
            <div class="card" style="border-top: 5px solid ${severityColor};">
                <h3 style="color: #333; margin-bottom: 15px;">Impact Score</h3>
                <div style="font-size: 3.5em; font-weight: bold; color: ${severityColor}; text-align: center; margin: 20px 0;">
                    ${Math.round(impact.score)}
                    <div style="font-size: 0.3em; color: #888; letter-spacing: 2px;">${impact.severity}</div>
                </div>
                <div style="display: flex; justify-content: space-around; text-align: center; color: #555;">
                    <div>
                        <div style="font-weight: bold; font-size: 1.2em;">${impact.totalClasses}</div>
                        <div style="font-size: 0.8em;">Classes</div>
                    </div>
                    <div>
                        <div style="font-weight: bold; font-size: 1.2em;">${impact.totalStudents}</div>
                        <div style="font-size: 0.8em;">Students</div>
                    </div>
                </div>
            </div>
            
            <!-- Recommendations Card -->
            <div class="card">
                <h3 style="color: #333; margin-bottom: 15px;">🤖 AI Recommendations</h3>
                <ul style="list-style: none;">
                    ${recommendations.map(rec => `
                        <li style="padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: start;">
                            <span style="color: ${severityColor}; margin-right: 10px;">➜</span> ${rec}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <!-- Affected Classes Table -->
        <div class="card">
            <h3>Affected Schedule (${affectedClasses.length} Classes)</h3>
            <div class="timetable-grid">
                <table>
                    <thead><tr><th>Course</th><th>Section</th><th>Students</th></tr></thead>
                    <tbody>
                        ${affectedClasses.map(c => `
                            <tr>
                                <td>${c.courseCode}</td>
                                <td>${c.section}</td>
                                <td>${c.studentCount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('analysisResults').innerHTML = html;
}

async function runRoomAnalysis() {
    const roomId = document.getElementById('analysisRoom').value;
    if (!roomId) return showStatus('Please select a room', 'error');

    showStatus('Analyzing room usage... ⏳', 'info');
    document.getElementById('analysisResults').innerHTML = '<div class="loading">Finding alternatives...</div>';

    try {
        const res = await fetch(`${BASE_URL}/analysis/room-shortage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomId })
        });
        const data = await res.json();

        if (res.ok) {
            displayRoomAnalysis(data);
            showStatus('Analysis complete! ✅', 'success');
        } else {
            showStatus(`Error: ${data.message || data.error}`, 'error');
        }
    } catch (e) {
        showStatus(`Network Error: ${e.message}`, 'error');
    }
}

function displayRoomAnalysis(data) {
    const { room, impact, alternatives } = data;

    let html = `
        <div class="card" style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="color: #333;">${room.number} Analysis</h2>
                    <p style="color: #666;">Type: ${room.type} | Capacity: ${room.capacity}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 2em; font-weight: bold; color: ${impact.severity === 'CRITICAL' ? '#ff4757' : '#2ed573'};">
                        ${impact.score}% Used
                    </div>
                    <div style="font-size: 0.8em; color: #888;">Utilization Score</div>
                </div>
            </div>
        </div>

        <h3 style="color: #333; margin-bottom: 15px;">Suggested Alternatives</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
            ${alternatives.map(alt => `
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2ed573; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <div style="font-weight: bold; font-size: 1.1em; margin-bottom: 5px;">${alt.name}</div>
                    <div style="font-size: 0.9em; color: #666;">Capacity: ${alt.capacity}</div>
                    <div style="margin-top: 10px; font-size: 0.8em; color: #2ed573; font-weight: 600;">
                        ${alt.availabilityScore}% Match Score
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('analysisResults').innerHTML = html;
}

async function runBulkAnalysis() {
    showStatus('Running bulk analysis on all faculty... ⏳', 'info');
    document.getElementById('analysisResults').innerHTML = '<div class="loading">Processing faculty data...</div>';

    try {
        // First get all faculty IDs
        const fRes = await fetch(`${BASE_URL}/faculty`);
        const fData = await fRes.json();
        const facultyIds = fData.data.map(f => f._id);

        const res = await fetch(`${BASE_URL}/analysis/bulk-faculty`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ facultyIds })
        });
        const data = await res.json();

        if (res.ok) {
            displayBulkAnalysis(data);
            showStatus('Bulk Analysis complete! ✅', 'success');
        } else {
            showStatus(`Error: ${data.message || data.error}`, 'error');
        }
    } catch (e) {
        showStatus(`Network Error: ${e.message}`, 'error');
    }
}

function displayBulkAnalysis(data) {
    const { summary, analyses } = data;

    let html = `
        <div class="stats" style="margin-bottom: 30px;">
            <div class="stat-card" style="background: linear-gradient(135deg, #ff4757 0%, #ff6b81 100%);">
                <h3>${summary.criticalCount}</h3>
                <p>Critical Risk</p>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #ffa502 0%, #ffc048 100%);">
                <h3>${summary.highCount}</h3>
                <p>High Risk</p>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #2ed573 0%, #7bed9f 100%);">
                <h3>${summary.mediumCount}</h3>
                 <p>Normal Risk</p>
            </div>
        </div>
        
        <div class="card">
            <h3>Faculty Risk Leaderboard</h3>
            <div class="timetable-grid">
                <table>
                    <thead><tr><th>Rank</th><th>Faculty Name</th><th>Score</th><th>Severity</th><th>Classes</th></tr></thead>
                    <tbody>
                        ${analyses.map((a, i) => `
                            <tr style="${i < 3 ? 'background-color: #fff9fa;' : ''}">
                                <td>#${i + 1}</td>
                                <td style="font-weight: 600;">${a.faculty.name}</td>
                                <td>${Math.round(a.impact.score)}</td>
                                <td>
                                    <span style="padding: 4px 8px; border-radius: 4px; color: white; background: ${a.impact.severity === 'CRITICAL' ? '#ff4757' : (a.impact.severity === 'HIGH' ? '#ffa502' : '#2ed573')
        }; font-size: 0.8em; font-weight: bold;">
                                        ${a.impact.severity}
                                    </span>
                                </td>
                                <td>${a.impact.totalClasses}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('analysisResults').innerHTML = html;
}
