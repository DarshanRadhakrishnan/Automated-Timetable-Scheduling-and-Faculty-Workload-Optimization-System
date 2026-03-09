import { RefreshCw, Download, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import useTimetableStore from '../../store/timetableStore';
import TimetableGrid from '../timetable/TimetableGrid';

const Schedule = () => {
    const {
        timetableData,
        conflicts,
        versions,
        selectedVersion,
        loading,
        fetchTimetable,
        generateTimetable
    } = useTimetableStore();

    const [showVersionDropdown, setShowVersionDropdown] = useState(false);

    const handleVersionChange = (versionId) => {
        fetchTimetable(versionId);
        setShowVersionDropdown(false);
    };

    const handleGenerate = async () => {
        try {
            await generateTimetable();
            // Success notification could be added here
        } catch (error) {
            console.error('Failed to generate timetable:', error);
        }
    };

    const currentVersion = versions.find(v => v.id === selectedVersion);

    return (
        <div className="space-y-6">
            {/* Controls Bar */}
            <div className="card p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {/* Version Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    Version {selectedVersion || 'N/A'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </button>

                            {showVersionDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10 max-h-64 overflow-y-auto">
                                    {versions.map((version, index) => (
                                        <button
                                            key={version.id}
                                            onClick={() => handleVersionChange(version.id)}
                                            className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${version.id === selectedVersion ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                        Version {version.id} #{index + 1}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {version.entryCount} entries
                                                    </p>
                                                </div>
                                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                    {version.score?.toFixed(2)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                    {versions.length === 0 && (
                                        <div className="px-4 py-3 text-center text-sm text-slate-500 dark:text-slate-400">
                                            No versions available
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Version Info */}
                        {currentVersion && (
                            <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <p className="text-xs text-primary-600 dark:text-primary-400">
                                    Score: <span className="font-semibold">{currentVersion.score?.toFixed(2)}</span>
                                    {' • '}
                                    Entries: <span className="font-semibold">{currentVersion.entryCount}</span>
                                </p>
                            </div>
                        )}

                        {/* Conflict Badge */}
                        {conflicts.length > 0 && (
                            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                    {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Detected
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Generating...' : 'Generate New'}
                        </button>
                        <button className="btn-secondary flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="card p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
                            <p className="text-slate-600 dark:text-slate-300">Loading timetable...</p>
                        </div>
                    </div>
                ) : timetableData.length > 0 ? (
                    <TimetableGrid timetableData={timetableData} conflicts={conflicts} />
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-slate-600 dark:text-slate-300 mb-4">
                                No timetable data available
                            </p>
                            <button onClick={handleGenerate} className="btn-primary">
                                Generate Timetable
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
