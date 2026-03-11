"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
            const res = await axios.post(
                `${apiUrl}/auth/login`,
                { email, password }
            );
            login(res.data.accessToken, {
                id: res.data._id,
                username: res.data.username,
                email: res.data.email,
                role: res.data.role,
                facultyId: res.data.facultyId,
            });
        } catch (err: any) {
            setError(
                typeof err.response?.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || 'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-900 text-slate-100">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Timetable Scheduler
                    </h1>
                    <p className="mt-2 text-slate-400 text-sm">Automated Faculty Workload Optimization</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="text-slate-300 text-lg font-normal leading-relaxed">
                        "Smart scheduling, automatically optimized — so you can focus on what matters."
                    </blockquote>
                    <div className="flex gap-4">
                        {['AI-Powered', 'Conflict-Free', 'RBAC Secure'].map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full border border-slate-700 text-slate-300 text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-slate-500 text-xs">
                    © {new Date().getFullYear()} TimetableScheduler. All rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 bg-white">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Timetable Scheduler
                    </h1>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900">Welcome back</h2>
                        <p className="mt-2 text-slate-500 text-sm">Sign in to access the admin dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@timetable.com"
                                className="w-full rounded border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-slate-500">
                        Default credentials: <span className="font-medium">admin@timetable.com</span> / <span className="font-medium">Admin@123</span>
                    </p>
                    <p className="mt-4 text-center text-sm text-slate-600">
                        Do not have an account?{' '}
                        <Link href="/register" className="text-slate-900 hover:text-slate-700 font-medium underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
