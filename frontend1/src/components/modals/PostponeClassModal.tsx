'use client';

import React, { useState } from 'react';
import { postponeClass } from '@/services/reschedulingService';
import api from '@/services/api';

interface PostponeClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: any;
    onSuccess: () => void;
}

export default function PostponeClassModal({ isOpen, onClose, entry, onSuccess }: PostponeClassModalProps) {
    const [loading, setLoading] = useState(false);
    const [findingSlots, setFindingSlots] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

    const handleFindAlternatives = async () => {
        setFindingSlots(true);
        setSuggestions([]);
        setSelectedSuggestion(null);

        try {
            // Call backend to find alternative slots dynamically
            // This checks faculty, room, and section availability automatically
            const response = await api.post('/rescheduling/find-alternatives', {
                entryId: entry._id,
                proposalId: entry.proposalId || 1
            });

            setSuggestions(response.data.suggestions || []);

            if (response.data.suggestions && response.data.suggestions.length > 0) {
                // Auto-select the first (best) suggestion
                setSelectedSuggestion(response.data.suggestions[0]);
            }
        } catch (error: any) {
            alert(`❌ Failed to find alternatives: ${error.response?.data?.message || error.message}`);
        } finally {
            setFindingSlots(false);
        }
    };

    const handleApplyPostpone = async () => {
        if (!selectedSuggestion) {
            alert('Please select an alternative slot');
            return;
        }

        setLoading(true);
        try {
            await postponeClass(
                entry._id,
                selectedSuggestion.timeslotId,
                false // Skip availability check since backend already validated
            );

            // If room changed, update that too
            if (selectedSuggestion.roomId && selectedSuggestion.roomId !== entry.roomId?._id) {
                await api.post('/rescheduling/apply-changes', {
                    updates: [{
                        entryId: entry._id,
                        type: 'update',
                        changes: {
                            timeslotId: selectedSuggestion.timeslotId,
                            roomId: selectedSuggestion.roomId
                        }
                    }]
                });
            }

            alert('✅ Class postponed successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`❌ Failed to postpone class: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    📅 Dynamic Class Postponement
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    The system will automatically find the best alternative time slot by checking faculty, room, and section availability.
                </p>

                {/* Current Class Info */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Course:</strong> {entry?.courseId?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Section:</strong> {entry?.sectionId?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Current Time:</strong> {entry?.timeslotId?.day} {entry?.timeslotId?.startTime} - {entry?.timeslotId?.endTime}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Faculty:</strong> {entry?.facultyId?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Room:</strong> {entry?.roomId?.name || 'N/A'}
                    </p>
                </div>

                {/* Find Alternatives Button */}
                {suggestions.length === 0 && (
                    <button
                        onClick={handleFindAlternatives}
                        disabled={findingSlots}
                        className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                    >
                        {findingSlots ? '🔄 Finding Best Alternatives...' : '🔍 Find Alternative Slots'}
                    </button>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            ✨ Suggested Alternatives (Best First):
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedSuggestion(suggestion)}
                                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${selectedSuggestion === suggestion
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {index === 0 ? '🥇 Best Option' : `Option ${index + 1}`}
                                        </span>
                                        {selectedSuggestion === suggestion && (
                                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>New Time:</strong> {suggestion.day} {suggestion.startTime} - {suggestion.endTime}
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Room:</strong> {suggestion.roomName}
                                        {suggestion.roomChanged && (
                                            <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded">
                                                Room Changed
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        ✅ Faculty available • Section free • Room available
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Try Again Button */}
                        <button
                            onClick={handleFindAlternatives}
                            disabled={findingSlots}
                            className="w-full mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors text-sm"
                        >
                            🔄 Find More Alternatives
                        </button>
                    </div>
                )}

                {suggestions.length === 0 && !findingSlots && (
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click "Find Alternative Slots" to let the system automatically find the best time slots based on all constraints.
                        </p>
                    </div>
                )}

                {/* No Alternatives Found */}
                {!findingSlots && suggestions.length === 0 && selectedSuggestion === null && (
                    <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hidden">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            ⚠️ No suitable alternatives found. The system checked all available slots but couldn't find one that satisfies all constraints.
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {selectedSuggestion && (
                        <button
                            onClick={handleApplyPostpone}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Applying...' : '✅ Apply Postponement'}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={loading || findingSlots}
                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
