"use client";
import { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AuditEntry {
    _id: string;
    user: { username: string; email: string; role: string } | null;
    action: string;
    target: string;
    details: { method: string; url: string; statusCode: number };
    timestamp: string;
}

interface Pagination {
    page: number;
    pages: number;
    total: number;
}

export default function AuditLogPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');
    const [targetFilter, setTargetFilter] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (!authLoading && user && user.role !== 'admin') router.push('/');
    }, [user, authLoading, router]);

    const fetchLogs = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 25 };
            if (actionFilter) params.action = actionFilter;
            if (targetFilter) params.target = targetFilter;

            const res = await api.get('/auditlog', { params });
            setLogs(res.data.data || []);
            setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (err) {
            console.error('Failed to fetch audit logs', err);
        } finally {
            setLoading(false);
        }
    }, [user, page, actionFilter, targetFilter]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleClear = async () => {
        if (!confirm('Clear ALL audit logs? This cannot be undone.')) return;
        try {
            await api.delete('/auditlog');
            setLogs([]);
        } catch { }
    };

    const statusColor = (code: number) => {
        if (code < 300) return 'text-green-400';
        if (code < 400) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (authLoading || !user) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🛡️ Audit Log</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track all privileged actions — {pagination.total} total entries
                    </p>
                </div>
                <button
                    onClick={handleClear}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                    🗑️ Clear All Logs
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Filter by action…"
                    value={actionFilter}
                    onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-48"
                />
                <input
                    type="text"
                    placeholder="Filter by target…"
                    value={targetFilter}
                    onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-48"
                />
                <button
                    onClick={fetchLogs}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                    Apply
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-5 py-3 text-left">Timestamp</th>
                            <th className="px-5 py-3 text-left">User</th>
                            <th className="px-5 py-3 text-left">Action</th>
                            <th className="px-5 py-3 text-left">Target</th>
                            <th className="px-5 py-3 text-left">Method</th>
                            <th className="px-5 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                                    <div className="flex justify-center">
                                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                                    </div>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-10 text-center text-gray-400 dark:text-gray-500">
                                    No audit log entries found.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                    <td className="px-5 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300 font-mono text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {log.user?.username ?? '—'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {log.user?.role}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{log.target}</td>
                                    <td className="px-5 py-3">
                                        <span className={`font-mono text-xs font-semibold ${log.details?.method === 'DELETE'
                                                ? 'text-red-500'
                                                : log.details?.method === 'POST'
                                                    ? 'text-green-500'
                                                    : 'text-blue-500'
                                            }`}>
                                            {log.details?.method ?? '—'}
                                        </span>
                                    </td>
                                    <td className={`px-5 py-3 font-mono text-xs font-semibold ${statusColor(log.details?.statusCode)}`}>
                                        {log.details?.statusCode ?? '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Page {pagination.page} of {pagination.pages}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={pagination.page <= 1}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={pagination.page >= pagination.pages}
                            className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
