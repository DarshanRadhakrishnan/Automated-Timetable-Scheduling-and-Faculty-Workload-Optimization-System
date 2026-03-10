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
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`,
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
        <div className="flex min-h-screen bg-gray-950">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 relative overflow-hidden">
                {/* decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-xl" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-2xl" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Timetable<span className="text-yellow-300">Scheduler</span>
                    </h1>
                    <p className="mt-1 text-blue-200 text-sm">Automated Faculty Workload Optimization</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="text-white/90 text-xl font-medium leading-relaxed">
                        "Smart scheduling, automatically optimised — so you can focus on what matters."
                    </blockquote>
                    <div className="flex gap-4">
                        {['AI-Powered', 'Conflict-Free', 'RBAC Secure'].map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-blue-200 text-xs">
                    © {new Date().getFullYear()} TimetableScheduler. All rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8 text-center">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Timetable<span className="text-blue-400">Scheduler</span>
                    </h1>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">Welcome back 👋</h2>
                        <p className="mt-2 text-gray-400 text-sm">Sign in to access the admin dashboard.</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">
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
                                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">
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
                                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in…
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs text-gray-600">
                        Default credentials: <span className="text-gray-400">admin@timetable.com</span> / <span className="text-gray-400">Admin@123</span>
                    </p>
                    <p className="mt-4 text-center text-sm text-gray-400">
                        Do not have an account?{' '}
                        <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
