'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import {
    getTimetables,
    generateTimetable,
    clearTimetable,
    detectConflicts,
    resolveConflicts,
    getRankings,
    getStats,
} from '@/services/timetableService';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import TimetableCalendar from '@/components/timetable/TimetableCalendar';
import PostponeClassModal from '@/components/modals/PostponeClassModal';
import SubstituteFacultyModal from '@/components/modals/SubstituteFacultyModal';
import DynamicReschedulingPanel from '@/components/modals/DynamicReschedulingPanel';
import { cancelClass } from '@/services/reschedulingService';
import {
    Rocket,
    Eye,
    Trash2,
    FileSpreadsheet,
    List,
    Users,
    BookOpen,
    Building2,
    GraduationCap,
    Clock,
    Search,
    AlertTriangle,
    Wrench,
    RefreshCcw
} from 'lucide-react';

interface TimetableEntry {
    _id: string;
    day: string;
    timeslotId: {
        startTime: string;
        endTime: string;
        slot: number;
        day: string;
    };
    sectionId: {
        name: string;
        _id: string;
    };
    courseId: {
        name: string;
        code?: string;
        _id: string;
    };
    facultyId: {
        name: string;
        _id: string;
    };
    roomId: {
        name: string;
        _id: string;
    };
}

interface Conflict {
    type: string;
    reason: string;
    entity: string;
    entityName?: string;
    timeslotId?: string;
    timeslotLabel?: string;
}

interface ConflictResolution {
    classId: string;
    className: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    unchanged?: string;
}

interface Stats {
    totalFaculties: number;
    totalCourses: number;
    totalRooms: number;
    totalSections: number;
    totalTimeslots: number;
    scheduledClasses: number;
}

export default function TimetablePage() {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [detectingConflicts, setDetectingConflicts] = useState(false);
    const [resolvingConflicts, setResolvingConflicts] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [displayMode, setDisplayMode] = useState<'timetable' | 'conflicts' | 'resolution'>('timetable');

    // Stats state
    const [stats, setStats] = useState<Stats>({
        totalFaculties: 0,
        totalCourses: 0,
        totalRooms: 0,
        totalSections: 0,
        totalTimeslots: 0,
        scheduledClasses: 0,
    });

    // Ranking system state
    const [selectedProposal, setSelectedProposal] = useState<number>(1);
    const [rankings, setRankings] = useState<any[]>([]);
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [resolutionData, setResolutionData] = useState<any>(null);

    // Rescheduling modals state
    const [postponeModalOpen, setPostponeModalOpen] = useState(false);
    const [substituteModalOpen, setSubstituteModalOpen] = useState(false);
    const [dynamicReschedulingOpen, setDynamicReschedulingOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);

    // Filter states
    const [filterMode, setFilterMode] = useState<'all' | 'faculty' | 'course' | 'room' | 'section' | 'timeslot'>('all');
    const [selectedFilter, setSelectedFilter] = useState<string>('');

    const fetchRankings = async () => {
        try {
            const data = await getRankings();
            setRankings(data);
        } catch (error) {
            console.error('Failed to fetch rankings:', error);
        }
    };

    useEffect(() => {
        fetchRankings();
    }, []);

    useEffect(() => {
        fetchStats();
        fetchTimetable();
    }, [selectedProposal]);

    const fetchStats = async () => {
        try {
            const data = await getStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchTimetable = async () => {
        try {
            const data = await getTimetables(selectedProposal);
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const sortedData = data.sort((a: any, b: any) => {
                const dayOrder = days.indexOf(a.timeslotId?.day || '') - days.indexOf(b.timeslotId?.day || '');
                if (dayOrder !== 0) return dayOrder;
                const slotA = a.timeslotId?.slot || 0;
                const slotB = b.timeslotId?.slot || 0;
                if (slotA !== slotB) return slotA - slotB;
                return (a.sectionId?.name || '').localeCompare(b.sectionId?.name || '');
            });
            setTimetable(sortedData);
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setMessage(null);
        setDisplayMode('timetable');
        try {
            const result = await generateTimetable();
            if (result.rankings) {
                setRankings(result.rankings);
            }
            setSelectedProposal(1);
            await fetchTimetable();
            await fetchStats();
            setMessage({
                type: 'success',
                text: `✅ Generated 3 timetable proposals! Showing Rank 1 (Score: ${result.rankings?.[0]?.score || 'N/A'})`
            });
        } catch (error: any) {
            console.error('Failed to generate timetable:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to generate timetable.' });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!confirm('Are you sure you want to clear the timetable?')) return;
        try {
            await clearTimetable();
            setTimetable([]);
            setRankings([]);
            setConflicts([]);
            setDisplayMode('timetable');
            await fetchStats();
            setMessage({ type: 'success', text: '✅ Timetable cleared successfully' });
        } catch (error: any) {
            console.error('Failed to clear timetable:', error);
            setMessage({ type: 'error', text: 'Failed to clear timetable' });
        }
    };

    const handleDetectConflicts = async () => {
        setDetectingConflicts(true);
        setMessage(null);
        try {
            const result: any = await detectConflicts(selectedProposal);
            setConflicts(result.data || []);
            setDisplayMode('conflicts');
            if (result.data && result.data.length > 0) {
                setMessage({
                    type: 'error',
                    text: `⚠️ Found ${result.count || result.data.length} conflicts in Rank ${selectedProposal}!`
                });
            } else {
                setMessage({
                    type: 'success',
                    text: `✅ No conflicts in Rank ${selectedProposal}! Timetable is conflict-free.`
                });
            }
        } catch (error: any) {
            console.error('Conflict detection failed:', error);
            setMessage({
                type: 'error',
                text: `❌ Failed to detect conflicts: ${error.response?.data?.message || error.message}`
            });
        } finally {
            setDetectingConflicts(false);
        }
    };

    const handleResolveConflicts = async () => {
        setResolvingConflicts(true);
        setMessage({ type: 'info', text: '🔄 Analyzing and resolving conflicts...' });
        try {
            const result = await resolveConflicts(selectedProposal);
            setResolutionData(result.data);
            setDisplayMode('resolution');
            setMessage({
                type: 'success',
                text: `✅ Resolved ${result.data?.resolved || 0} out of ${result.data?.initial || 0} conflicts!`
            });
            await fetchTimetable();
        } catch (error: any) {
            console.error('Resolution failed:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to resolve conflicts.' });
        } finally {
            setResolvingConflicts(false);
        }
    };

    const handleViewConflictFreeTimetable = () => {
        setDisplayMode('timetable');
        setMessage(null);
        fetchTimetable();
    };

    const handleExportCSV = () => {
        const headers = ['Day', 'Time', 'Section', 'Course', 'Faculty', 'Room'];
        const rows = filteredTimetable.map(entry => [
            entry.timeslotId?.day || '',
            `${entry.timeslotId?.startTime || ''} - ${entry.timeslotId?.endTime || ''}`,
            entry.sectionId?.name || '',
            entry.courseId?.name || '',
            entry.facultyId?.name || '',
            entry.roomId?.name || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timetable-rank-${selectedProposal}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Filter timetable based on selected mode
    const filteredTimetable = timetable.filter(entry => {
        if (filterMode === 'all' || !selectedFilter) return true;

        switch (filterMode) {
            case 'faculty':
                return entry.facultyId?._id === selectedFilter;
            case 'course':
                return entry.courseId?._id === selectedFilter;
            case 'room':
                return entry.roomId?._id === selectedFilter;
            case 'section':
                return entry.sectionId?._id === selectedFilter;
            case 'timeslot':
                return entry.timeslotId?.day === selectedFilter;
            default:
                return true;
        }
    });

    // Get unique values for filters
    const uniqueFaculties = Array.from(new Set(timetable.map(e => e.facultyId?._id))).filter(Boolean);
    const uniqueCourses = Array.from(new Set(timetable.map(e => e.courseId?._id))).filter(Boolean);
    const uniqueRooms = Array.from(new Set(timetable.map(e => e.roomId?._id))).filter(Boolean);
    const uniqueSections = Array.from(new Set(timetable.map(e => e.sectionId?._id))).filter(Boolean);
    const uniqueDays = Array.from(new Set(timetable.map(e => e.timeslotId?.day))).filter(Boolean);

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            {/* Top-Level Dashboard */}
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    📊 System Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalFaculties}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Faculties</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalCourses}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalRooms}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Rooms</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalSections}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Sections</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalTimeslots}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Timeslots</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.scheduledClasses}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled Classes</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Control Panel */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    ⚡ Quick Actions
                </h3>

                {/* Timetable Management */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Timetable Management</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? '⏳ Processing...' : <><Rocket className="w-4 h-4" /> Generate Timetable</>}
                        </button>
                        <button
                            onClick={() => {
                                setDisplayMode('timetable');
                                setFilterMode('all');
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4 mr-2" /> View Timetable
                        </button>
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear Timetable
                        </button>

                        {/* Plan Selector */}
                        {rankings.length > 0 && (
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Plan:</label>
                                <select
                                    value={selectedProposal}
                                    onChange={(e) => setSelectedProposal(Number(e.target.value))}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                                >
                                    {rankings.map((ranking: any) => (
                                        <option key={ranking.id} value={ranking.id}>
                                            Rank {ranking.rank} (Score: {ranking.score})
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                    title="Export to CSV"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Viewers (Filtering) */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Data Viewers</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setFilterMode('all');
                                setSelectedFilter('');
                                setDisplayMode('timetable');
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterMode === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <List className="w-4 h-4 mr-2" /> View All
                        </button>
                        <button
                            onClick={() => {
                                setFilterMode('faculty');
                                setDisplayMode('timetable');
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterMode === 'faculty'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Users className="w-4 h-4 mr-2" /> View Faculties
                        </button>
                        <button
                            onClick={() => {
                                setFilterMode('course');
                                setDisplayMode('timetable');
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterMode === 'course'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <BookOpen className="w-4 h-4 mr-2" /> View Courses
                        </button>
                        <button
                            onClick={() => {
                                setFilterMode('room');
                                setDisplayMode('timetable');
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterMode === 'room'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Building2 className="w-4 h-4 mr-2" /> View Rooms
                        </button>
                        <button
                            onClick={() => {
                                setFilterMode('section');
                                setDisplayMode('timetable');
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterMode === 'section'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <GraduationCap className="w-4 h-4 mr-2" /> View Sections
                        </button>
                        <button
                            onClick={() => {
                                setFilterMode('timeslot');
                                setDisplayMode('timetable');
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterMode === 'timeslot'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Clock className="w-4 h-4 mr-2" /> View Timeslots
                        </button>
                    </div>
                </div>

                {/* Conflict Intelligence */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Conflict Intelligence</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={handleDetectConflicts}
                            disabled={detectingConflicts}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {detectingConflicts ? 'Scanning...' : <><Search className="w-4 h-4" /> Detect Conflicts</>}
                        </button>
                        <button
                            onClick={() => setDisplayMode('conflicts')}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" /> View Conflicts ({conflicts.length})
                        </button>
                        <button
                            onClick={handleResolveConflicts}
                            disabled={resolvingConflicts}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {resolvingConflicts ? 'Resolving...' : <><Wrench className="w-4 h-4" /> Resolve Conflicts</>}
                        </button>
                    </div>
                </div>

                {/* Advanced Tools */}
                <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Advanced Tools</h4>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setDynamicReschedulingOpen(true)}
                            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all flex items-center justify-center gap-2 font-medium"
                        >
                            <RefreshCcw className="w-5 h-5" /> Dynamic Rescheduling
                        </button>
                    </div>
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Filter Selector (when filter mode is active) */}
            {filterMode !== 'all' && displayMode === 'timetable' && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select {filterMode.charAt(0).toUpperCase() + filterMode.slice(1)}:
                    </label>
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                        <option value="">-- Select --</option>
                        {filterMode === 'faculty' && uniqueFaculties.map((id: any) => {
                            const entry = timetable.find(e => e.facultyId?._id === id);
                            return <option key={id} value={id}>{entry?.facultyId?.name}</option>;
                        })}
                        {filterMode === 'course' && uniqueCourses.map((id: any) => {
                            const entry = timetable.find(e => e.courseId?._id === id);
                            return <option key={id} value={id}>{entry?.courseId?.name}</option>;
                        })}
                        {filterMode === 'room' && uniqueRooms.map((id: any) => {
                            const entry = timetable.find(e => e.roomId?._id === id);
                            return <option key={id} value={id}>{entry?.roomId?.name}</option>;
                        })}
                        {filterMode === 'section' && uniqueSections.map((id: any) => {
                            const entry = timetable.find(e => e.sectionId?._id === id);
                            return <option key={id} value={id}>{entry?.sectionId?.name}</option>;
                        })}
                        {filterMode === 'timeslot' && uniqueDays.map((day: any) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Results Display */}
            <div className="mt-6">
                {displayMode === 'timetable' && (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slot</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTimetable.length > 0 ? (
                                    filteredTimetable.map((entry, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {entry.sectionId?.name}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {entry.courseId?.name}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {entry.facultyId?.name}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {entry.roomId?.name}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {entry.timeslotId?.day}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {entry.timeslotId?.startTime} - {entry.timeslotId?.endTime}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell className="px-6 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                                            {filterMode !== 'all' && !selectedFilter
                                                ? 'Please select a filter option above'
                                                : 'No timetable entries found. Click "Generate Timetable" to start.'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {displayMode === 'conflicts' && (
                    <div className="overflow-x-auto">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                            ⚠️ Conflict Detection Results
                        </h3>
                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-800">
                                <TableRow>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</TableCell>
                                    <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeslot</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {conflicts.length > 0 ? (
                                    conflicts.map((conflict, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${conflict.type?.toUpperCase() === 'FACULTY' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    conflict.type?.toUpperCase() === 'ROOM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {conflict.type?.toUpperCase()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {conflict.reason}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {conflict.entityName || conflict.entity || '-'}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {conflict.timeslotLabel || conflict.timeslotId || 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell className="px-6 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={4}>
                                            No conflicts detected. Click "Detect Conflicts" to scan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {displayMode === 'resolution' && resolutionData && (
                    <div>
                        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                                ✅ Conflict Resolution Summary
                            </h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {resolutionData.initial || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Initial Conflicts</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {resolutionData.resolved || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                        {resolutionData.remaining || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                                </div>
                            </div>

                            {resolutionData.changes && resolutionData.changes.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Change Log:</h4>
                                    <div className="space-y-3">
                                        {resolutionData.changes.map((change: ConflictResolution, index: number) => (
                                            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                    Change #{index + 1}: {change.className}
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    <div className="text-gray-700 dark:text-gray-300">
                                                        <span className="font-medium">Action:</span> {change.action}
                                                    </div>
                                                    {change.oldValue && change.newValue && (
                                                        <div className="text-gray-600 dark:text-gray-400">
                                                            <span className="line-through text-red-600 dark:text-red-400">{change.oldValue}</span>
                                                            {' → '}
                                                            <span className="text-green-600 dark:text-green-400">{change.newValue}</span>
                                                        </div>
                                                    )}
                                                    {change.unchanged && (
                                                        <div className="text-gray-500 dark:text-gray-500">
                                                            {change.unchanged} (Unchanged)
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleViewConflictFreeTimetable}
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    👁️ View Conflict-Free Timetable
                                </button>
                                <button
                                    onClick={handleExportCSV}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                                >
                                    📥 Download File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rescheduling Modals */}
            <PostponeClassModal
                isOpen={postponeModalOpen}
                onClose={() => setPostponeModalOpen(false)}
                entry={selectedEntry}
                onSuccess={() => {
                    fetchTimetable();
                    fetchStats();
                }}
            />

            <SubstituteFacultyModal
                isOpen={substituteModalOpen}
                onClose={() => setSubstituteModalOpen(false)}
                entry={selectedEntry}
                onSuccess={() => {
                    fetchTimetable();
                    fetchStats();
                }}
            />

            <DynamicReschedulingPanel
                isOpen={dynamicReschedulingOpen}
                onClose={() => setDynamicReschedulingOpen(false)}
                proposalId={selectedProposal}
                onSuccess={() => {
                    fetchTimetable();
                    fetchStats();
                }}
            />
        </div>
    );
}
