"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Leave {
    _id: string;
    facultyId?: { name: string; department: string };
    startDate: string;
    endDate: string;
    reason: string;
    status: string;
}

export default function LeavePage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reason, setReason] = useState("");

    const isFaculty = user?.role === "faculty";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const endpoint = isFaculty ? `${apiUrl}/leave/my` : `${apiUrl}/leave`;
            const res = await axios.get(endpoint);
            setLeaves(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLeaves();
        }
    }, [user]);

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await axios.post(`${apiUrl}/leave`, { startDate, endDate, reason });
            setSuccess("Leave application submitted successfully!");
            setStartDate("");
            setEndDate("");
            setReason("");
            fetchLeaves();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await axios.put(`${apiUrl}/leave/${id}/status`, { status });
            fetchLeaves();
        } catch (err: any) {
            setError("Failed to update status: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-800 dark:text-gray-100">
                Leave Management
            </h2>

            {
                error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
                        {error}
                    </div>
                )
            }
            {
                success && (
                    <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                        {success}
                    </div>
                )
            }

            {
                isFaculty && (
                    <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Apply for Leave</h3>
                        <form onSubmit={handleApplyLeave} className="space-y-4 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    required
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <textarea
                                    required
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-gray-900 dark:text-white"
                                    rows={3}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Submit Application
                            </button>
                        </form>
                    </div>
                )
            }

            <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    {isFaculty ? "My Leave History" : "Pending & Approved Leaves"}
                </h3>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800">
                            <TableRow>
                                {!isFaculty && <TableCell isHeader className="px-6 py-3">Faculty</TableCell>}
                                <TableCell isHeader className="px-6 py-3">Duration</TableCell>
                                <TableCell isHeader className="px-6 py-3">Reason</TableCell>
                                <TableCell isHeader className="px-6 py-3">Status</TableCell>
                                {!isFaculty && <TableCell isHeader className="px-6 py-3">Actions</TableCell>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isFaculty ? 3 : 5} className="py-8 text-center text-gray-500">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : leaves.length > 0 ? (
                                leaves.map((leave) => (
                                    <TableRow key={leave._id}>
                                        {!isFaculty && (
                                            <TableCell className="px-6 py-4 text-sm">
                                                {leave.facultyId?.name || "Unknown"}
                                            </TableCell>
                                        )}
                                        <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {leave.reason}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${leave.status === 'approved' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200' :
                                                leave.status === 'rejected' ? 'bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-500' :
                                                    'bg-white border border-slate-300 text-slate-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                                                }`}>
                                                {leave.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        {!isFaculty && (
                                            <TableCell className="px-6 py-4 text-sm">
                                                {leave.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleStatusUpdate(leave._id, 'approved')} className="px-3 py-1 bg-slate-800 text-white rounded text-xs hover:bg-slate-700">Approve</button>
                                                        <button onClick={() => handleStatusUpdate(leave._id, 'rejected')} className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50">Reject</button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={isFaculty ? 3 : 5} className="py-8 text-center text-gray-500">
                                        No leave records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div >
    );
}
