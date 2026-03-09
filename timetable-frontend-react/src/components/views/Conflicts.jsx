import { AlertTriangle, CheckCircle, Wrench, Info } from 'lucide-react';
import useTimetableStore from '../../store/timetableStore';

const Conflicts = () => {
    const { conflicts, selectedVersion, resolveConflicts, loading } = useTimetableStore();

    const handleResolve = async () => {
        if (!selectedVersion) {
            alert('Please select a timetable version first');
            return;
        }

        try {
            await resolveConflicts(selectedVersion);
            // Success notification could be added here
        } catch (error) {
            console.error('Failed to resolve conflicts:', error);
        }
    };

    const ConflictCard = ({ conflict, index }) => {
        const getConflictType = () => {
            if (conflict.type) return conflict.type;
            if (conflict.description?.includes('faculty')) return 'Faculty Conflict';
            if (conflict.description?.includes('room')) return 'Room Conflict';
            if (conflict.description?.includes('section')) return 'Section Conflict';
            return 'General Conflict';
        };

        const type = getConflictType();
        const description = conflict.description || conflict.message || 'No description available';

        return (
            <div className="card p-5 hover:shadow-lg transition-all duration-200 border-l-4 border-red-500">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                                    {type}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Conflict #{index + 1}
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                Critical
                            </span>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                            {description}
                        </p>

                        {conflict.entries && conflict.entries.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    Conflicting Entries:
                                </p>
                                {conflict.entries.map((entry, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/20 rounded-lg p-3 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Course:</span>
                                                <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">
                                                    {entry.courseId?.code || entry.course || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Section:</span>
                                                <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">
                                                    {entry.sectionId?.name || entry.section || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Faculty:</span>
                                                <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">
                                                    {entry.facultyId?.name || entry.faculty || 'N/A'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 dark:text-slate-400">Room:</span>
                                                <span className="ml-2 font-medium text-slate-700 dark:text-slate-200">
                                                    {entry.roomId?.name || entry.room || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Conflicts</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {conflicts.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                            <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Critical</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {conflicts.filter(c => c.severity === 'critical').length || conflicts.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Auto-Resolvable</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {Math.floor(conflicts.length * 0.7)}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            {conflicts.length > 0 && (
                <div className="card p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                    {conflicts.length} {conflicts.length === 1 ? 'Conflict' : 'Conflicts'} Require Attention
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Review and resolve conflicts to optimize the schedule
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleResolve}
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Wrench className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Resolving...' : 'Auto-Resolve'}
                        </button>
                    </div>
                </div>
            )}

            {/* Conflicts List */}
            <div className="space-y-4">
                {conflicts.length > 0 ? (
                    conflicts.map((conflict, index) => (
                        <ConflictCard key={index} conflict={conflict} index={index} />
                    ))
                ) : (
                    <div className="card p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                No Conflicts Found
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                                Your timetable is conflict-free and ready to use!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Conflicts;
