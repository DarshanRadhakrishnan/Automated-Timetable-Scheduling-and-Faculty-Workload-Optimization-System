import { Settings as SettingsIcon, Save, Database, Bell } from 'lucide-react';

const Settings = () => {
    return (
        <div className="space-y-6">
            {/* General Settings */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        General Settings
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Enable dark mode theme
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">Auto-Save</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Automatically save changes
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Notification Settings */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Notifications
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">Conflict Alerts</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Get notified when conflicts are detected
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">Generation Complete</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Notify when timetable generation completes
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Database Settings */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                        Database
                    </h3>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">API Endpoint</p>
                        <input
                            type="text"
                            value="http://localhost:5000/api"
                            readOnly
                            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300"
                        />
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                        <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">Connection Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-slate-600 dark:text-slate-300">Connected</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default Settings;
