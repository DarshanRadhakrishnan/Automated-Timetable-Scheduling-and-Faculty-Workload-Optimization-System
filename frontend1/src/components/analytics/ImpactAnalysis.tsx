"use client";
import React, { useState, useEffect } from 'react';
import api from '@/services/api';

// ─── Types ──────────────────────────────────────────────────
interface Faculty { _id: string; name: string; department: string; }
interface Room    { _id: string; name: string; roomType: string; capacity: number; }

interface FacultyResult {
    id: string; type: string; timestamp: string;
    impactScore: number; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    classesAffected: number; studentsImpacted: number;
    recommendations: string[];
    affectedClasses: { course: string; section: string; day: string; slot: string; room: string; }[];
    facultyName?: string;
}

interface RoomResult {
    id: string; type: string; timestamp: string;
    impactScore: number; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    classesAffected: number; studentsImpacted: number;
    recommendations: string[]; roomName: string; alternativesFound: number;
    alternativeRooms: { id: string; name: string; capacity: number; type: string; }[];
}

interface BulkResult {
    facultyId: string; facultyName?: string; department?: string;
    impactScore: number; severity: string;
    classesAffected: number; studentsImpacted: number; rank: number;
}

interface HistoryItem {
    id: string; type: string; timestamp: string;
    impactScore: number; severity: string;
    classesAffected: number; studentsImpacted: number;
}

// ─── Severity helpers ────────────────────────────────────────
const severityColor = (s: string) => {
    if (s === 'CRITICAL') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    if (s === 'HIGH')     return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
};
const severityBar = (s: string) => {
    if (s === 'CRITICAL') return 'bg-red-500';
    if (s === 'HIGH')     return 'bg-orange-400';
    return 'bg-yellow-400';
};
const typeLabel = (t: string) =>
    t === 'FACULTY_UNAVAILABLE' ? '🟣 Faculty Impact' : '🔵 Room Shortage';

// ─── Score Gauge ─────────────────────────────────────────────
const ScoreGauge = ({ score, severity }: { score: number; severity: string }) => {
    const radius = 52; const circ = 2 * Math.PI * radius;
    const fill = circ - (score / 100) * circ;
    const color = severity === 'CRITICAL' ? '#ef4444' : severity === 'HIGH' ? '#f97316' : '#eab308';
    return (
        <div className="flex flex-col items-center">
            <svg width="130" height="130" className="-rotate-90">
                <circle cx="65" cy="65" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="65" cy="65" r={radius} fill="none" stroke={color} strokeWidth="10"
                    strokeDasharray={circ} strokeDashoffset={fill}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="relative" style={{ marginTop: '-78px' }}>
                <div className="flex flex-col items-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">{score}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
                </div>
            </div>
            <div className="mt-10" />
        </div>
    );
};

// ─── Tab button ──────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap
            ${active
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-boxdark'
                : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-300 dark:text-gray-400'}`}>
        {children}
    </button>
);

// ─── Main Component ──────────────────────────────────────────
const ImpactAnalysis: React.FC = () => {
    const [tab, setTab] = useState<'faculty' | 'room' | 'bulk' | 'history'>('faculty');

    // Faculty Impact
    const [facultyList, setFacultyList] = useState<Faculty[]>([]);
    const [selFaculty, setSelFaculty] = useState('');
    const [facultyResult, setFacultyResult] = useState<FacultyResult | null>(null);
    const [loadingFaculty, setLoadingFaculty] = useState(false);

    // Room Shortage
    const [roomList, setRoomList] = useState<Room[]>([]);
    const [selRoom, setSelRoom] = useState('');
    const [roomResult, setRoomResult] = useState<RoomResult | null>(null);
    const [loadingRoom, setLoadingRoom] = useState(false);

    // Bulk Faculty
    const [bulkSel, setBulkSel] = useState<Set<string>>(new Set());
    const [bulkResult, setBulkResult] = useState<{ data: BulkResult[]; recommendation: string; summary: any } | null>(null);
    const [loadingBulk, setLoadingBulk] = useState(false);

    // History
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [error, setError] = useState('');

    // Load faculty + room lists once
    useEffect(() => {
        api.get('/simulation/faculty-list').then(r => setFacultyList(r.data.data || [])).catch(() => {});
        api.get('/simulation/room-list').then(r => setRoomList(r.data.data || [])).catch(() => {});
    }, []);

    // Load history when tab switches
    useEffect(() => {
        if (tab === 'history') loadHistory();
    }, [tab]);

    const loadHistory = () => {
        setLoadingHistory(true);
        api.get('/simulation/history')
            .then(r => setHistory(r.data.data || []))
            .catch(() => setHistory([]))
            .finally(() => setLoadingHistory(false));
    };

    // ── Faculty Impact ──
    const runFacultyImpact = async () => {
        if (!selFaculty) return;
        setLoadingFaculty(true); setError('');
        try {
            const res = await api.post('/simulation/faculty-impact', { facultyId: selFaculty });
            const result = res.data.data;
            const fac = facultyList.find(f => f._id === selFaculty);
            setFacultyResult({ ...result, facultyName: fac?.name });
        } catch (e: any) {
            setError(e.response?.data?.message || 'Analysis failed. Make sure backend is running.');
        } finally { setLoadingFaculty(false); }
    };

    // ── Room Shortage ──
    const runRoomShortage = async () => {
        if (!selRoom) return;
        setLoadingRoom(true); setError('');
        try {
            const res = await api.post('/simulation/room-shortage', { roomId: selRoom });
            setRoomResult(res.data.data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Analysis failed.');
        } finally { setLoadingRoom(false); }
    };

    // ── Bulk Faculty ──
    const runBulkFaculty = async () => {
        if (bulkSel.size < 2) { setError('Select at least 2 faculty.'); return; }
        setLoadingBulk(true); setError('');
        try {
            const res = await api.post('/simulation/bulk-faculty', { facultyIds: Array.from(bulkSel) });
            const data: BulkResult[] = (res.data.data || []).map((r: BulkResult) => {
                const fac = facultyList.find(f => f._id === r.facultyId);
                return { ...r, facultyName: fac?.name || 'Unknown', department: fac?.department || '' };
            });
            const total = data.length;
            const summary = {
                total,
                critical: data.filter(d => d.severity === 'CRITICAL').length,
                high: data.filter(d => d.severity === 'HIGH').length,
                medium: data.filter(d => d.severity === 'MEDIUM').length,
                avg: total ? (data.reduce((s, d) => s + d.impactScore, 0) / total).toFixed(1) : 0,
            };
            setBulkResult({ data, recommendation: res.data.recommendation, summary });
        } catch (e: any) {
            setError(e.response?.data?.message || 'Analysis failed.');
        } finally { setLoadingBulk(false); }
    };

    const toggleBulk = (id: string) => {
        setBulkSel(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    // ── Renders ──────────────────────────────────────────────
    const ResultCard = ({ children }: { children: React.ReactNode }) => (
        <div className="mt-5 p-5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 space-y-4">
            {children}
        </div>
    );

    const renderFaculty = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a faculty to simulate what happens if they become unavailable.</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <select value={selFaculty} onChange={e => setSelFaculty(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">— Select Faculty —</option>
                    {facultyList.map(f => (
                        <option key={f._id} value={f._id}>{f.name} – {f.department}</option>
                    ))}
                </select>
                <button onClick={runFacultyImpact} disabled={!selFaculty || loadingFaculty}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                    {loadingFaculty ? <><span className="animate-spin">⚙</span> Analyzing…</> : '▶ Run Analysis'}
                </button>
            </div>

            {facultyResult && (
                <ResultCard>
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{facultyResult.facultyName || 'Faculty'}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${severityColor(facultyResult.severity)}`}>
                            {facultyResult.severity}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{facultyResult.id}</span>
                    </div>
                    {/* Score + Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="flex flex-col items-center">
                            <ScoreGauge score={facultyResult.impactScore} severity={facultyResult.severity} />
                            <p className="text-xs text-gray-500 -mt-2">Impact Score</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-3">
                            {[
                                { label: 'Classes Affected', value: facultyResult.classesAffected, icon: '📚' },
                                { label: 'Students Impacted', value: facultyResult.studentsImpacted, icon: '👥' },
                            ].map(m => (
                                <div key={m.label} className="rounded-lg bg-white dark:bg-gray-700 p-4 text-center shadow-sm">
                                    <div className="text-2xl mb-1">{m.icon}</div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{m.value}</div>
                                    <div className="text-xs text-gray-500">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Affected classes */}
                    {facultyResult.affectedClasses.length > 0 && (
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Affected Classes</h5>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead><tr className="border-b dark:border-gray-700">
                                        {['Course', 'Section', 'Day', 'Slot', 'Room'].map(h => (
                                            <th key={h} className="text-left py-1.5 px-2 text-gray-500 font-semibold">{h}</th>
                                        ))}
                                    </tr></thead>
                                    <tbody>
                                        {facultyResult.affectedClasses.map((c, i) => (
                                            <tr key={i} className="border-b dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40">
                                                <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{c.course || '—'}</td>
                                                <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{c.section || '—'}</td>
                                                <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{c.day || '—'}</td>
                                                <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{c.slot || '—'}</td>
                                                <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300">{c.room || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* Recommendations */}
                    <div>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                            {facultyResult.recommendations.map((r, i) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </ResultCard>
            )}
        </div>
    );

    const renderRoom = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a room to simulate what happens if it becomes unavailable (maintenance, damage, etc.).</p>
            <div className="flex flex-col sm:flex-row gap-3">
                <select value={selRoom} onChange={e => setSelRoom(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">— Select Room —</option>
                    {roomList.map(r => (
                        <option key={r._id} value={r._id}>{r.name} – {r.roomType} – {r.capacity} seats</option>
                    ))}
                </select>
                <button onClick={runRoomShortage} disabled={!selRoom || loadingRoom}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                    {loadingRoom ? <><span className="animate-spin">⚙</span> Analyzing…</> : '▶ Analyze'}
                </button>
            </div>

            {roomResult && (
                <ResultCard>
                    <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{roomResult.roomName}</h4>
                        <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{roomResult.roomType}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${severityColor(roomResult.severity)}`}>
                            {roomResult.severity}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{roomResult.id}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="flex flex-col items-center">
                            <ScoreGauge score={roomResult.impactScore} severity={roomResult.severity} />
                            <p className="text-xs text-gray-500 -mt-2">Impact Score</p>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-3">
                            {[
                                { label: 'Classes Affected', value: roomResult.classesAffected, icon: '📚' },
                                { label: 'Students Impacted', value: roomResult.studentsImpacted, icon: '👥' },
                            ].map(m => (
                                <div key={m.label} className="rounded-lg bg-white dark:bg-gray-700 p-4 text-center shadow-sm">
                                    <div className="text-2xl mb-1">{m.icon}</div>
                                    <div className="text-2xl font-bold text-gray-800 dark:text-white">{m.value}</div>
                                    <div className="text-xs text-gray-500">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {roomResult.alternativeRooms.length > 0 && (
                        <div>
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alternative Rooms</h5>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead><tr className="border-b dark:border-gray-700">
                                        {['Room', 'Type', 'Capacity', 'Availability'].map(h => (
                                            <th key={h} className="text-left py-1.5 px-2 text-gray-500 font-semibold">{h}</th>
                                        ))}
                                    </tr></thead>
                                    <tbody>
                                        {roomResult.alternativeRooms.map((r, i) => {
                                            const avail = 80 + Math.floor((i * 7 + 3) % 20);
                                            return (
                                                <tr key={i} className="border-b dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40">
                                                    <td className="py-1.5 px-2 text-gray-700 dark:text-gray-300 font-medium">{r.name}</td>
                                                    <td className="py-1.5 px-2 text-gray-600 dark:text-gray-400">{r.type}</td>
                                                    <td className="py-1.5 px-2 text-gray-600 dark:text-gray-400">{r.capacity}</td>
                                                    <td className="py-1.5 px-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${avail}%` }} />
                                                            </div>
                                                            <span className="text-green-600 dark:text-green-400 font-medium">{avail}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <div>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                            {roomResult.recommendations.map((r, i) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">{r}</li>
                            ))}
                        </ul>
                    </div>
                </ResultCard>
            )}
        </div>
    );

    const renderBulk = () => (
        <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Select 2 or more faculty to rank them by operational risk.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                {facultyList.map(f => (
                    <label key={f._id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/50">
                        <input type="checkbox" checked={bulkSel.has(f._id)} onChange={() => toggleBulk(f._id)}
                            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500" />
                        <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{f.name}</p>
                            <p className="text-xs text-gray-400">{f.department}</p>
                        </div>
                    </label>
                ))}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{bulkSel.size} selected</span>
                <button onClick={runBulkFaculty} disabled={bulkSel.size < 2 || loadingBulk}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center gap-2">
                    {loadingBulk ? <><span className="animate-spin">⚙</span> Analyzing…</> : '▶ Analyze All'}
                </button>
                {bulkSel.size > 0 && (
                    <button onClick={() => setBulkSel(new Set())}
                        className="text-xs text-gray-400 hover:text-red-400 underline">Clear</button>
                )}
            </div>

            {bulkResult && (
                <ResultCard>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                            { label: 'Total', value: bulkResult.summary.total, color: 'text-blue-600' },
                            { label: 'CRITICAL', value: bulkResult.summary.critical, color: 'text-red-500' },
                            { label: 'HIGH', value: bulkResult.summary.high, color: 'text-orange-500' },
                            { label: 'MEDIUM', value: bulkResult.summary.medium, color: 'text-yellow-500' },
                            { label: 'Avg Score', value: bulkResult.summary.avg, color: 'text-purple-600' },
                        ].map(c => (
                            <div key={c.label} className="rounded-lg bg-white dark:bg-gray-700 p-3 text-center shadow-sm">
                                <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                                <div className="text-xs text-gray-400">{c.label}</div>
                            </div>
                        ))}
                    </div>
                    {/* Recommendation */}
                    {bulkResult.recommendation && (
                        <div className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-lg px-4 py-2.5">
                            💡 {bulkResult.recommendation}
                        </div>
                    )}
                    {/* Ranked table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead><tr className="border-b dark:border-gray-700">
                                {['Rank', 'Faculty', 'Dept', 'Classes', 'Students', 'Score', 'Severity'].map(h => (
                                    <th key={h} className="text-left py-2 px-2 text-gray-500 font-semibold">{h}</th>
                                ))}
                            </tr></thead>
                            <tbody>
                                {bulkResult.data.map((r) => {
                                    const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `${r.rank}`;
                                    return (
                                        <tr key={r.facultyId} className="border-b dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/40">
                                            <td className="py-2 px-2 font-bold text-base">{medal}</td>
                                            <td className="py-2 px-2 font-medium text-gray-700 dark:text-gray-300">{r.facultyName}</td>
                                            <td className="py-2 px-2 text-gray-500">{r.department}</td>
                                            <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{r.classesAffected}</td>
                                            <td className="py-2 px-2 text-gray-700 dark:text-gray-300">{r.studentsImpacted}</td>
                                            <td className="py-2 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div className={`${severityBar(r.severity)} h-2 rounded-full`} style={{ width: `${r.impactScore}%` }} />
                                                    </div>
                                                    <span className="font-semibold text-gray-800 dark:text-white">{r.impactScore}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-2">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityColor(r.severity)}`}>{r.severity}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </ResultCard>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last 10 simulation runs (in-memory, clears on backend restart).</p>
                <button onClick={loadHistory} className="text-xs text-blue-600 hover:underline dark:text-blue-400">↻ Refresh</button>
            </div>
            {loadingHistory ? (
                <div className="flex justify-center py-10 text-gray-400">Loading history…</div>
            ) : history.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-sm">No simulations run yet.</p>
                    <p className="text-xs mt-1">Go to Faculty Impact or Room Shortage tab to run your first analysis.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {history.map(h => (
                        <div key={h.id} className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                            <span className="text-xs font-mono text-gray-400">{h.id}</span>
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {typeLabel(h.type)}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${severityColor(h.severity)}`}>{h.severity}</span>
                            <span className="text-sm font-bold text-gray-800 dark:text-white w-12 text-right">{h.impactScore}<span className="text-gray-400 font-normal">/100</span></span>
                            <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-500 w-full sm:w-auto">
                                <span>📚 {h.classesAffected} classes</span>
                                <span>👥 {h.studentsImpacted} students</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-7 pb-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            {/* Header */}
            <div className="mb-5">
                <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                    <span>🔬</span> Scenario Impact Analysis
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Simulate faculty unavailability and room shortages to assess their impact on the timetable.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-5 overflow-x-auto">
                <TabBtn active={tab === 'faculty'}  onClick={() => setTab('faculty')}>🧑‍🏫 Faculty Impact</TabBtn>
                <TabBtn active={tab === 'room'}     onClick={() => setTab('room')}>🏫 Room Shortage</TabBtn>
                <TabBtn active={tab === 'bulk'}     onClick={() => setTab('bulk')}>👥 Bulk Faculty</TabBtn>
                <TabBtn active={tab === 'history'}  onClick={() => { setTab('history'); loadHistory(); }}>📋 History</TabBtn>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                    <span>⚠️</span> {error}
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* Tab content */}
            {tab === 'faculty' && renderFaculty()}
            {tab === 'room'    && renderRoom()}
            {tab === 'bulk'    && renderBulk()}
            {tab === 'history' && renderHistory()}
        </div>
    );
};

export default ImpactAnalysis;
