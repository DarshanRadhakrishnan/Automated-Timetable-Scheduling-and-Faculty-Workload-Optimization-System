'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import {
    getSections,
    createSection,
    updateSection,
    deleteSection,
} from '@/services/sectionService';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';

interface Section {
    _id: string;
    name: string;
    count: number;
}

export default function SectionPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        count: 0,
    });

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const data = await getSections();
            setSections(data);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        }
    };

    const handleOpenModal = (section: Section | null = null) => {
        setCurrentSection(section);
        if (section) {
            setFormData({
                name: section.name,
                count: section.count,
            });
        } else {
            setFormData({
                name: '',
                count: 0,
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSection(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentSection) {
                await updateSection(currentSection._id, formData);
            } else {
                await createSection(formData);
            }
            fetchSections();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save section:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this section?')) {
            try {
                await deleteSection(id);
                fetchSections();
            } catch (error) {
                console.error('Failed to delete section:', error);
            }
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Section Management
                </h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                    Add Section
                </button>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50 dark:bg-gray-800">
                        <TableRow>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Count</TableCell>
                            <TableCell isHeader className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sections.map((section) => (
                            <TableRow key={section._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{section.name}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{section.count}</TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(section)}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section._id)}
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
                    {currentSection ? 'Edit Section' : 'Add Section'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section Name</label>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Count</label>
                        <input
                            type="number"
                            name="count"
                            value={formData.count}
                            onChange={handleChange}
                            required
                            min="1"
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
                            {currentSection ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
