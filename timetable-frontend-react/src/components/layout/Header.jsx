import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

const Header = ({ title, subtitle }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4">
            <div className="flex items-center justify-between">
                {/* Title Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
                    )}
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        ) : (
                            <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        )}
                    </button>

                    {/* Notifications */}
                    <button
                        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
