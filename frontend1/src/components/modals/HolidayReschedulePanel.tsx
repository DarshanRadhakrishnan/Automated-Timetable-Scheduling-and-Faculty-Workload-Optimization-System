'use client';

import React, { useState } from 'react';
import { rescheduleHoliday, applyBulkChanges } from '@/services/reschedulingService';

interface HolidayReschedulePanelProps {
    isOpen: boolean;
    onClose: () => void;
    proposalId: number;
    onSuccess: () => void;
}

export default function HolidayReschedulePanel({ isOpen, onClose, proposalId, onSuccess }: HolidayReschedulePanelProps) {
    const [selectedDay, setSelectedDay] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleCheckHoliday = async () => {
        if (!selectedDay) {
            alert('Please select a day');
            return;
        }

        setLoading(true);
        setResults(null);
        try {
            const response = await rescheduleHoliday(selectedDay, proposalId);
            setResults(response);
        } catch (error: any) {
            alert(`❌ Failed to check holiday: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyReschedule = async () => {
        if (!results || !results.data) {
            alert('No rescheduling data available');
            return;
        }

        setLoading(true);
        try {
            // Convert results to update format
            const updates = results.data.map((item: any) => ({
                entryId: item.entryId,
                type: item.newTimeslot ? 'update' : 'cancel',
                changes: item.newTimeslot ? { timeslotId: item.newTimeslot } : undefined
            }));

            await applyBulkChanges(updates);
            alert(`✅ Successfully rescheduled ${updates.length} classes!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`❌ Failed to apply rescheduling: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    🎉 Public Holiday Rescheduling
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Select a day to mark as public holiday. The system will automatically find alternative slots for all classes scheduled on that day.
                </p>

                {/* Day Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Holiday Date
                    </label>
                    <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        disabled={loading}
                    >
                        <option value="">-- Select Day --</option>
                        {days.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Check Button */}
                <button
                    onClick={handleCheckHoliday}
                    disabled={loading || !selectedDay}
                    className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? '🔄 Checking...' : '🔍 Check Affected Classes'}
                </button>

                {/* Results */}
                {results && (
                    <div className="mb-4">
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-3">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                📊 Found {results.data?.length || 0} classes on {selectedDay}
                            </p>
                        </div>

                        {results.data && results.data.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {results.data.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-lg border ${item.newTimeslot
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                            }`}
                                    >
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {item.course} - {item.section}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Original: {item.originalTime}
                                        </p>
                                        {item.newTimeslot ? (
                                            <p className="text-xs text-green-700 dark:text-green-400">
                                                ✅ Rescheduled to: {item.newTime}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-red-700 dark:text-red-400">
                                                ❌ No available slot found - will be cancelled
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Apply Button */}
                        <button
                            onClick={handleApplyReschedule}
                            disabled={loading}
                            className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Applying...' : '✅ Apply Rescheduling'}
                        </button>
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
