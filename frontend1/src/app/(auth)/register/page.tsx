"use client";
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('faculty');
    const [department, setDepartment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload: any = { username, email, password, role };
            if (role === 'faculty') {
                payload.department = department || 'General';
            }

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register/open`,
                payload
            );

            // Registration successful. Redirect to login page
            router.push('/login');
        } catch (err: any) {
            setError(
                err.response?.data?.message || err.response?.data || err.message || 'Registration failed.'
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
                    <p className="mt-2 text-slate-400 text-sm">Join the ecosystem today.</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="text-slate-300 text-lg font-normal leading-relaxed">
                        "Seamless integration for Faculty and Admin with smart RBAC."
                    </blockquote>
                    <div className="flex gap-4">
                        {['Fast', 'Secure', 'Optimized'].map(tag => (
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
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 bg-white overflow-y-auto">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Timetable Scheduler
                    </h1>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900">Create Account</h2>
                        <p className="mt-2 text-slate-500 text-sm">Register as Faculty or Admin to get started.</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                            />
                        </div>

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
                                placeholder="name@timetable.com"
                                className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-slate-900 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                            >
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {role === 'faculty' && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Department
                                </label>
                                <input
                                    id="department"
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="e.g. Computer Science"
                                    className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-slate-900 hover:text-slate-700 font-medium underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
