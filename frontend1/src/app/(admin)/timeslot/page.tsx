'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import {
    getTimeslots,
    createTimeslot,
    updateTimeslot,
    deleteTimeslot,
} from '@/services/timeslotService';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';

interface Timeslot {
    _id: string;
    day: string;
    startTime: string;
    endTime: string;
    slotNumber: number;
}

export default function TimeslotPage() {
    const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTimeslot, setCurrentTimeslot] = useState<Timeslot | null>(null);
    const [formData, setFormData] = useState({
        day: 'Monday',
        startTime: '',
        endTime: '',
        slotNumber: 1,
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        fetchTimeslots();
    }, []);

    const fetchTimeslots = async () => {
        try {
            const data = await getTimeslots();
            // Sort timeslots by Day and then Slot Number
            const sortedData = data.sort((a: any, b: any) => {
                const dayOrder = days.indexOf(a.day) - days.indexOf(b.day);
                if (dayOrder !== 0) return dayOrder;
                return a.slotNumber - b.slotNumber;
            });
            setTimeslots(sortedData);
        } catch (error) {
            console.error('Failed to fetch timeslots:', error);
        }
    };

    const handleOpenModal = (timeslot: Timeslot | null = null) => {
        setCurrentTimeslot(timeslot);
        if (timeslot) {
            setFormData({
                day: timeslot.day,
                startTime: timeslot.startTime,
                endTime: timeslot.endTime,
                slotNumber: timeslot.slotNumber,
            });
        } else {
            setFormData({
                day: 'Monday',
                startTime: '',
                endTime: '',
                slotNumber: 1,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTimeslot(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentTimeslot) {
                await updateTimeslot(currentTimeslot._id, formData);
            } else {
                await createTimeslot(formData);
            }
            fetchTimeslots();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save timeslot:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this timeslot?')) {
            try {
                await deleteTimeslot(id);
                fetchTimeslots();
            } catch (error) {
                console.error('Failed to delete timeslot:', error);
            }
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Timeslot Management
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    Add Timeslot
                </button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                        <TableRow>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Number</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {timeslots.map((timeslot) => (
                            <TableRow key={timeslot._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{timeslot.day}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{timeslot.slotNumber}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{timeslot.startTime}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{timeslot.endTime}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(timeslot)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(timeslot._id)}
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Delete
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {currentTimeslot ? 'Edit Timeslot' : 'Add Timeslot'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                        <select
                            name="day"
                            value={formData.day}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            {days.map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slot Number</label>
                        <input
                            type="number"
                            name="slotNumber"
                            value={formData.slotNumber}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                        <input
                            type="text"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            placeholder="e.g. 09:00 AM"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                        <input
                            type="text"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            placeholder="e.g. 10:00 AM"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {currentTimeslot ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
