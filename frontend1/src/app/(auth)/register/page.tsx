"use client";
import { useState } from 'react';
// Removed useAuth import
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
    // Removed useAuth
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
        <div className="flex min-h-screen bg-gray-950">
            {/* Left panel — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-green-700 via-green-600 to-teal-700 relative overflow-hidden">
                {/* decorative circles */}
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-xl" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-2xl" />

                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Timetable<span className="text-yellow-300">Scheduler</span>
                    </h1>
                    <p className="mt-1 text-green-200 text-sm">Join the ecosystem today!</p>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="text-white/90 text-xl font-medium leading-relaxed">
                        "Seamless integration for Faculty and Admin with smart RBAC."
                    </blockquote>
                    <div className="flex gap-4">
                        {['Fast', 'Secure', 'Optimized'].map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <p className="relative z-10 text-green-200 text-xs">
                    © {new Date().getFullYear()} TimetableScheduler. All rights reserved.
                </p>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 overflow-y-auto">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8 text-center">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Timetable<span className="text-green-400">Scheduler</span>
                    </h1>
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">Create Account 🚀</h2>
                        <p className="mt-2 text-gray-400 text-sm">Register as Faculty or Admin to get started.</p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="johndoe"
                                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-600 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
                            />
                        </div>

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
                                placeholder="name@timetable.com"
                                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-600 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">
                                Role
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
                            >
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {role === 'faculty' && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                                    Department
                                </label>
                                <input
                                    id="department"
                                    type="text"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="e.g. Computer Science"
                                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-600 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-600 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-green-500/20"
                        >
                            {loading ? 'Creating...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
