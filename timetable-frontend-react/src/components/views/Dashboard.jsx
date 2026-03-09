import { Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import useTimetableStore from '../../store/timetableStore';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
                {trend && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </p>
                )}
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { timetableData, conflicts, versions, selectedVersion } = useTimetableStore();

    const totalClasses = timetableData.length;
    const totalConflicts = conflicts.length;
    const conflictFreeClasses = totalClasses - totalConflicts;
    const currentVersion = versions.find(v => v.id === selectedVersion);
    const score = currentVersion?.score?.toFixed(2) || 'N/A';

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Classes"
                    value={totalClasses}
                    icon={Calendar}
                    color="from-blue-500 to-blue-600"
                    trend="+12% from last week"
                />
                <StatCard
                    title="Conflicts Detected"
                    value={totalConflicts}
                    icon={AlertTriangle}
                    color="from-red-500 to-red-600"
                />
                <StatCard
                    title="Conflict Free"
                    value={conflictFreeClasses}
                    icon={CheckCircle}
                    color="from-green-500 to-green-600"
                    trend="95% success rate"
                />
                <StatCard
                    title="Quality Score"
                    value={score}
                    icon={TrendingUp}
                    color="from-purple-500 to-purple-600"
                />
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    <ActivityItem
                        title="Timetable Generated"
                        description="New timetable version created successfully"
                        time="2 hours ago"
                        type="success"
                    />
                    <ActivityItem
                        title="Conflicts Detected"
                        description={`${totalConflicts} conflicts found in current schedule`}
                        time="3 hours ago"
                        type="warning"
                    />
                    <ActivityItem
                        title="Version Updated"
                        description="Timetable version 4 updated with new preferences"
                        time="1 day ago"
                        type="info"
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        Version Overview
                    </h3>
                    <div className="space-y-3">
                        {versions.slice(0, 5).map((version, index) => (
                            <div
                                key={version.id}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold text-sm">
                                        #{index + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            Version {version.id}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {version.entryCount} entries
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                    {version.score?.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
                        System Health
                    </h3>
                    <div className="space-y-4">
                        <HealthMetric
                            label="Schedule Completeness"
                            value={totalClasses > 0 ? 100 : 0}
                            color="green"
                        />
                        <HealthMetric
                            label="Conflict Resolution"
                            value={totalClasses > 0 ? ((conflictFreeClasses / totalClasses) * 100).toFixed(0) : 0}
                            color={totalConflicts > 0 ? 'yellow' : 'green'}
                        />
                        <HealthMetric
                            label="Room Utilization"
                            value={85}
                            color="blue"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityItem = ({ title, description, time, type }) => {
    const colors = {
        success: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        warning: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
        info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    };

    return (
        <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 ${colors[type]}`}></div>
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">{time}</span>
        </div>
    );
};

const HealthMetric = ({ label, value, color }) => {
    const colors = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-500',
        red: 'bg-red-500',
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                    className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                ></div>
            </div>
        </div>
    );
};

export default Dashboard;
