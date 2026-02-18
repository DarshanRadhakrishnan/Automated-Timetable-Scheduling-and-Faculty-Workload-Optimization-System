'use client';

import React, { useState, useEffect } from 'react';
import { getAvailableFaculties, assignSubstituteFaculty } from '@/services/reschedulingService';

interface SubstituteFacultyModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: any;
    onSuccess: () => void;
}

export default function SubstituteFacultyModal({ isOpen, onClose, entry, onSuccess }: SubstituteFacultyModalProps) {
    const [faculties, setFaculties] = useState<any[]>([]);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadFaculties();
        }
    }, [isOpen]);

    const loadFaculties = async () => {
        try {
            const data = await getAvailableFaculties();
            // Filter out the current faculty
            const filtered = data.filter((f: any) => f._id !== entry?.facultyId?._id);
            setFaculties(filtered);
        } catch (error) {
            console.error('Failed to load faculties:', error);
        }
    };

    const handleAssignSubstitute = async () => {
        if (!selectedFaculty) {
            alert('Please select a substitute faculty');
            return;
        }

        setLoading(true);
        try {
            await assignSubstituteFaculty(entry._id, selectedFaculty);
            alert('✅ Substitute faculty assigned successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`❌ Failed to assign substitute: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    👨‍🏫 Assign Substitute Faculty
                </h2>

                {/* Current Class Info */}
                <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Course:</strong> {entry?.courseId?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Section:</strong> {entry?.sectionId?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Time:</strong> {entry?.timeslotId?.day} {entry?.timeslotId?.startTime} - {entry?.timeslotId?.endTime}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Current Faculty:</strong> {entry?.facultyId?.name || 'N/A'}
                    </p>
                </div>

                {/* Faculty Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Substitute Faculty
                    </label>
                    <select
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        disabled={loading}
                    >
                        <option value="">-- Select Faculty --</option>
                        {faculties.map((faculty) => (
                            <option key={faculty._id} value={faculty._id}>
                                {faculty.name} {faculty.department ? `(${faculty.department})` : ''}
                            </option>
                        ))}
                    </select>
                    {faculties.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            No other faculties available
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleAssignSubstitute}
                        disabled={loading || !selectedFaculty}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Assigning...' : '✅ Assign Substitute'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
