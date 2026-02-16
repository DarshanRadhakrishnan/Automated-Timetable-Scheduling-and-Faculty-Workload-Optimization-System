'use client';

import React, { useState, useEffect } from 'react';
import { rescheduleHoliday, findSubstituteFaculty, findAlternativeRooms, applyBulkChanges, getAvailableFaculties, getAvailableRooms } from '@/services/reschedulingService';
import { Calendar, UserX, Wrench, X } from 'lucide-react';

interface DynamicReschedulingPanelProps {
    isOpen: boolean;
    onClose: () => void;
    proposalId: number;
    onSuccess: () => void;
}

type ReschedulingMode = 'holiday' | 'faculty-leave' | 'room-maintenance' | null;

interface AffectedClass {
    originalClass: any;
    options: {
        substitutes?: any[];
        reschedule?: any[]; // For room change or time change
        alternateRooms?: any[];
        compensationOptions?: any[]; // For holiday
    };
    // Additional properties for holiday payload:
    compensationOptions?: any[];
}

interface ClassResolution {
    action: 'cancel' | 'substitute' | 'reschedule' | 'alternative_room' | 'none';
    details?: any; // The selected substitute, timeslot, or room
}

export default function DynamicReschedulingPanel({ isOpen, onClose, proposalId, onSuccess }: DynamicReschedulingPanelProps) {
    const [mode, setMode] = useState<ReschedulingMode>(null);
    const [selectedDay, setSelectedDay] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{ data: AffectedClass[] } | null>(null);

    // Track resolution choice for each affected class: resolutions[originalClassId] = { action, details }
    const [resolutions, setResolutions] = useState<Record<string, ClassResolution>>({});

    // Lists for dropdowns
    const [faculties, setFaculties] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loadingLists, setLoadingLists] = useState(false);

    // Fetch faculties and rooms when component mounts
    useEffect(() => {
        if (isOpen) {
            fetchFacultiesAndRooms();
        }
    }, [isOpen]);

    const fetchFacultiesAndRooms = async () => {
        setLoadingLists(true);
        try {
            const [facultiesData, roomsData] = await Promise.all([
                getAvailableFaculties(),
                getAvailableRooms()
            ]);
            setFaculties(facultiesData);
            setRooms(roomsData);
        } catch (error) {
            console.error('Failed to fetch faculties/rooms:', error);
        } finally {
            setLoadingLists(false);
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleAnalyze = async () => {
        if (!selectedDay) {
            alert('Please select a day');
            return;
        }

        setLoading(true);
        setResults(null);
        setResolutions({});

        try {
            let response;

            if (mode === 'holiday') {
                response = await rescheduleHoliday(selectedDay, proposalId);
            } else if (mode === 'faculty-leave' && facultyId) {
                response = await findSubstituteFaculty(facultyId, selectedDay, proposalId);
            } else if (mode === 'room-maintenance' && roomId) {
                response = await findAlternativeRooms(roomId, selectedDay, proposalId);
            }

            setResults(response);

            // Initialize resolutions state
            const initialResolutions: Record<string, ClassResolution> = {};
            // The structure of response.data depends on the backend.
            // Based on my changes:
            // holiday -> [{ originalClass: entry, compensationOptions: [] }]
            // faculty-leave -> [{ originalClass: entry, options: { substitutes: [], reschedule: [] } }]
            // room -> [{ originalClass: entry, options: { alternateRooms: [], reschedule: [] } }]

            if (response && response.data) {
                response.data.forEach((item: AffectedClass) => {
                    const id = item.originalClass._id;
                    initialResolutions[id] = { action: 'none' };
                });
            }
            setResolutions(initialResolutions);

        } catch (error: any) {
            alert(`❌ Failed to analyze: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleResolutionChange = (classId: string, action: ClassResolution['action'], details?: any) => {
        setResolutions(prev => ({
            ...prev,
            [classId]: { action, details }
        }));
    };

    const handleApplyChanges = async () => {
        if (!results || !results.data) return;

        // Collect updates
        // We only care about resolutions that are NOT 'none'
        const updates: any[] = [];

        results.data.forEach((item) => {
            const originalId = item.originalClass._id;
            const res = resolutions[originalId];

            if (!res || res.action === 'none') return;

            if (res.action === 'cancel') {
                updates.push({
                    entryId: originalId,
                    type: 'cancel'
                });
            } else if (res.action === 'substitute') {
                updates.push({
                    entryId: originalId,
                    type: 'update',
                    changes: { facultyId: res.details }
                });
            } else if (res.action === 'reschedule') {
                // res.details is likely the timeslot object or { slot: ts, room: r }
                const payload: any = { timeslotId: res.details.slot._id || res.details.slot };
                if (res.details.room) {
                    payload.roomId = res.details.room._id || res.details.room;
                }
                updates.push({
                    entryId: originalId,
                    type: 'update',
                    changes: payload
                });
            } else if (res.action === 'alternative_room') {
                updates.push({
                    entryId: originalId,
                    type: 'update',
                    changes: { roomId: res.details._id }
                });
            }
        });

        if (updates.length === 0) {
            alert("No changes selected to apply.");
            return;
        }

        setLoading(true);
        try {
            await applyBulkChanges(updates);
            alert(`✅ Successfully applied ${updates.length} changes!`);
            onSuccess();
            onClose();
        } catch (error: any) {
            alert(`❌ Failed to apply changes: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetPanel = () => {
        setMode(null);
        setSelectedDay('');
        setFacultyId('');
        setRoomId('');
        setResults(null);
        setResolutions({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        🔄 Dynamic Rescheduling Engine
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Mode Selection */}
                {!mode && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <button
                            onClick={() => setMode('holiday')}
                            className="p-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-left flex flex-col items-center justify-center text-center gap-2 border border-orange-500"
                        >
                            <Calendar className="w-10 h-10 mb-1" />
                            <div className="font-bold text-lg">Public Holiday</div>
                            <div className="text-sm opacity-90">Reschedule all classes on a holiday</div>
                        </button>

                        <button
                            onClick={() => setMode('faculty-leave')}
                            className="p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-left flex flex-col items-center justify-center text-center gap-2 border border-purple-500"
                        >
                            <UserX className="w-10 h-10 mb-1" />
                            <div className="font-bold text-lg">Faculty Leave</div>
                            <div className="text-sm opacity-90">Find substitute or reschedule</div>
                        </button>

                        <button
                            onClick={() => setMode('room-maintenance')}
                            className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg text-left flex flex-col items-center justify-center text-center gap-2 border border-blue-500"
                        >
                            <Wrench className="w-10 h-10 mb-1" />
                            <div className="font-bold text-lg">Room Unavailable</div>
                            <div className="text-sm opacity-90">Find alternative rooms</div>
                        </button>
                    </div>
                )}

                {/* Input Forms */}
                {mode && !results && (
                    <div className="animate-fade-in">
                        <button onClick={resetPanel} className="text-sm text-blue-600 dark:text-blue-400 mb-4 hover:underline">
                            ← Back to modes
                        </button>

                        <div className={`p-4 rounded-lg mb-6 border ${mode === 'holiday' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' :
                            mode === 'faculty-leave' ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                                'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                            }`}>
                            <h3 className={`font-semibold mb-2 ${mode === 'holiday' ? 'text-orange-800 dark:text-orange-300' :
                                mode === 'faculty-leave' ? 'text-purple-800 dark:text-purple-300' :
                                    'text-blue-800 dark:text-blue-300'
                                }`}>
                                {mode === 'holiday' && '🎉 Public Holiday Management'}
                                {mode === 'faculty-leave' && '👨‍🏫 Faculty Leave Management'}
                                {mode === 'room-maintenance' && '🏢 Room Unavailability Management'}
                            </h3>
                            <p className="text-sm opacity-80 text-gray-700 dark:text-gray-300">
                                {mode === 'holiday' && 'Mark a day as a holiday. The system will find alternative slots for all affected classes.'}
                                {mode === 'faculty-leave' && 'Select a faculty member and day. Choose to substitute, reschedule, or cancel affected classes.'}
                                {mode === 'room-maintenance' && 'Select a room and day. Find alternative rooms or reschedule classes.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {mode === 'faculty-leave' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Faculty</label>
                                    <select
                                        value={facultyId}
                                        onChange={(e) => setFacultyId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="">-- Select Faculty --</option>
                                        {faculties.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {mode === 'room-maintenance' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Room</label>
                                    <select
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                    >
                                        <option value="">-- Select Room --</option>
                                        {rooms.map(r => <option key={r._id} value={r._id}>{r.name} ({r.roomType})</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Day</label>
                                <select
                                    value={selectedDay}
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                                >
                                    <option value="">-- Select Day --</option>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !selectedDay || (mode === 'faculty-leave' && !facultyId) || (mode === 'room-maintenance' && !roomId)}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? '🔄 Analyzing Impact...' : '🔍 Check Impact & Find Solutions'}
                        </button>
                    </div>
                )}

                {/* Results Analysis */}
                {results && (
                    <div className="animate-fade-in">
                        <button onClick={resetPanel} className="text-sm text-blue-600 dark:text-blue-400 mb-4 hover:underline">
                            ← Start New Analysis
                        </button>

                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-1">
                                📊 Analysis Results
                            </h3>
                            <p className="text-indigo-700 dark:text-indigo-400">
                                Found <strong>{results.data?.length || 0}</strong> affected classes on {selectedDay}. Please resolve them below:
                            </p>
                        </div>

                        <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-6 pr-2">
                            {results.data?.map((item, index) => {
                                const original = item.originalClass;
                                const originalId = original._id;
                                const currentRes = resolutions[originalId] || { action: 'none' };
                                const options = item.options || {};

                                // Normalize options for different modes
                                const substituteOptions = options.substitutes || [];
                                const rescheduleOptions = options.reschedule || item.compensationOptions || []; // Holiday uses compensationOptions
                                const roomOptions = options.alternateRooms || [];

                                return (
                                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {original.courseId?.name || 'Unknown Course'}
                                                    <span className="text-sm font-normal text-gray-500 ml-2">({original.courseId?.courseType})</span>
                                                </h4>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex gap-3">
                                                    <span>👥 {original.sectionId?.name}</span>
                                                    <span>⏰ Slot {original.timeslotId?.slot} ({original.timeslotId?.startTime} - {original.timeslotId?.endTime})</span>
                                                    <span>📍 {original.roomId?.name}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {currentRes.action === 'none' && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Action Required</span>}
                                                {currentRes.action === 'cancel' && <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">Will Cancel</span>}
                                                {currentRes.action === 'substitute' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Substitute Assigned</span>}
                                                {currentRes.action === 'reschedule' && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Rescheduled</span>}
                                                {currentRes.action === 'alternative_room' && <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">Room Changed</span>}
                                            </div>
                                        </div>

                                        <div className="p-4 grid grid-cols-1 gap-3">
                                            {/* Option 1: Cancel */}
                                            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${currentRes.action === 'cancel' ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                                <input
                                                    type="radio"
                                                    name={`res-${originalId}`}
                                                    checked={currentRes.action === 'cancel'}
                                                    onChange={() => handleResolutionChange(originalId, 'cancel')}
                                                    className="w-4 h-4 text-red-600"
                                                />
                                                <div className="ml-3">
                                                    <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">Cancel Class</span>
                                                    <span className="block text-xs text-gray-500">(Schedule compensation later)</span>
                                                </div>
                                            </label>

                                            {/* Option 2: Reschedule */}
                                            {rescheduleOptions.length > 0 && (
                                                <div className={`p-3 border rounded-lg transition-colors ${currentRes.action === 'reschedule' ? 'bg-blue-50 border-blue-200' : ''}`}>
                                                    <div className="flex items-center mb-2">
                                                        <input
                                                            type="radio"
                                                            name={`res-${originalId}`}
                                                            checked={currentRes.action === 'reschedule'}
                                                            onChange={() => handleResolutionChange(originalId, 'reschedule', rescheduleOptions[0])}
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">Reschedule to Another Day</span>
                                                    </div>
                                                    {currentRes.action === 'reschedule' && (
                                                        <select
                                                            className="w-full mt-1 text-sm border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700"
                                                            onChange={(e) => handleResolutionChange(originalId, 'reschedule', JSON.parse(e.target.value))}
                                                            value={JSON.stringify(currentRes.details)}
                                                        >
                                                            {rescheduleOptions.map((opt: any, idx: number) => {
                                                                // Handle both flat slot object (holiday) and complex object (reschedule) structures
                                                                const slot = opt.slot || opt;
                                                                const room = opt.room; // Might be null if same room
                                                                const label = `${slot.day} Slot ${slot.slot} (${slot.startTime}-${slot.endTime}) ${room ? `- Room ${room.name}` : ''}`;
                                                                return (
                                                                    <option key={idx} value={JSON.stringify(opt)}>{label}</option>
                                                                );
                                                            })}
                                                        </select>
                                                    )}
                                                </div>
                                            )}

                                            {/* Option 3: Substitute (For Faculty Leave) */}
                                            {mode === 'faculty-leave' && substituteOptions.length > 0 && (
                                                <div className={`p-3 border rounded-lg transition-colors ${currentRes.action === 'substitute' ? 'bg-green-50 border-green-200' : ''}`}>
                                                    <div className="flex items-center mb-2">
                                                        <input
                                                            type="radio"
                                                            name={`res-${originalId}`}
                                                            checked={currentRes.action === 'substitute'}
                                                            onChange={() => handleResolutionChange(originalId, 'substitute', substituteOptions[0]?._id)}
                                                            className="w-4 h-4 text-green-600"
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">Assign Substitute</span>
                                                    </div>
                                                    {currentRes.action === 'substitute' && (
                                                        <select
                                                            className="w-full mt-1 text-sm border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700"
                                                            onChange={(e) => handleResolutionChange(originalId, 'substitute', e.target.value)}
                                                            value={currentRes.details}
                                                        >
                                                            {substituteOptions.map((sub: any) => (
                                                                <option
                                                                    key={sub._id}
                                                                    value={sub._id}
                                                                    disabled={sub.status === 'OCCUPIED'}
                                                                    className={sub.status === 'OCCUPIED' ? 'text-red-500' : 'text-green-600'}
                                                                >
                                                                    {sub.status === 'AVAILABLE' ? '🟢' : '🔴'} {sub.name} ({sub.status === 'AVAILABLE' ? 'Available' : 'Occupied'})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            )}

                                            {/* Option 4: Alternative Room (For Room Maintenance) */}
                                            {mode === 'room-maintenance' && roomOptions.length > 0 && (
                                                <div className={`p-3 border rounded-lg transition-colors ${currentRes.action === 'alternative_room' ? 'bg-purple-50 border-purple-200' : ''}`}>
                                                    <div className="flex items-center mb-2">
                                                        <input
                                                            type="radio"
                                                            name={`res-${originalId}`}
                                                            checked={currentRes.action === 'alternative_room'}
                                                            onChange={() => handleResolutionChange(originalId, 'alternative_room', roomOptions[0])}
                                                            className="w-4 h-4 text-purple-600"
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">Change Room</span>
                                                    </div>
                                                    {currentRes.action === 'alternative_room' && (
                                                        <select
                                                            className="w-full mt-1 text-sm border-gray-300 rounded-md p-2 bg-white dark:bg-gray-700"
                                                            onChange={(e) => handleResolutionChange(originalId, 'alternative_room', JSON.parse(e.target.value))}
                                                            value={JSON.stringify(currentRes.details)}
                                                        >
                                                            {roomOptions.map((room: any) => (
                                                                <option key={room._id} value={JSON.stringify(room)}>
                                                                    {room.name} ({room.roomType}, Cap: {room.capacity})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleApplyChanges}
                            disabled={loading || Object.keys(resolutions).length === 0}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all transform hover:translate-y-[-1px] mb-4"
                        >
                            {loading ? 'Processing...' : '✅ Apply Selected Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
