import { Calendar, LayoutDashboard, Settings, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ activeView, setActiveView }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen fixed left-0 top-0 flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gradient">TimeTable</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`sidebar-link w-full ${isActive ? 'sidebar-link-active' : ''}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        AD
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Admin User</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">admin@college.edu</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
