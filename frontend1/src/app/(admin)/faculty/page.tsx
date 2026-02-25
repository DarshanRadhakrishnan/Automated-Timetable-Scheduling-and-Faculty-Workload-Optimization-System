'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import {
    getFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
} from '@/services/facultyService';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import Badge from '@/components/ui/badge/Badge';

interface Faculty {
    _id: string;
    name: string;
    email: string;
    contact: string;
    designation: string;
}

export default function FacultyPage() {
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFaculty, setCurrentFaculty] = useState<Faculty | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        designation: '',
    });

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const data = await getFaculties();
            setFaculties(data);
        } catch (error) {
            console.error('Failed to fetch faculties:', error);
        }
    };

    const handleOpenModal = (faculty: Faculty | null = null) => {
        setCurrentFaculty(faculty);
        if (faculty) {
            setFormData({
                name: faculty.name,
                email: faculty.email,
                contact: faculty.contact,
                designation: faculty.designation,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                contact: '',
                designation: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentFaculty(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentFaculty) {
                await updateFaculty(currentFaculty._id, formData);
            } else {
                await createFaculty(formData);
            }
            fetchFaculties();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save faculty:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this faculty?')) {
            try {
                await deleteFaculty(id);
                fetchFaculties();
            } catch (error) {
                console.error('Failed to delete faculty:', error);
            }
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Faculty Management
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    Add Faculty
                </button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                        <TableRow>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {faculties.map((faculty) => (
                            <TableRow key={faculty._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{faculty.name}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{faculty.email}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{faculty.contact}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Badge color="success" size="sm" className='capitalize'>{faculty.designation}</Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(faculty)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(faculty._id)}
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
                    {currentFaculty ? 'Edit Faculty' : 'Add Faculty'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleChange}
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
                            {currentFaculty ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
