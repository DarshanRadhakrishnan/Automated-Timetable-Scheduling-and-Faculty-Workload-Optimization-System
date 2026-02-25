"use client";
import { useEffect, useState } from 'react';
import api from '@/services/api';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const WorkloadChart = dynamic(() => import('@/components/analytics/WorkloadChart'), { ssr: false });
const ConflictHeatmap = dynamic(() => import('@/components/analytics/ConflictHeatmap'), { ssr: false });

export default function AnalyticsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [workloadData, setWorkloadData] = useState([]);
    const [heatmapData, setHeatmapData] = useState({});

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    const fetchAnalytics = async () => {
        try {
            const workloadRes = await api.get('/analysis/workload-distribution');
            setWorkloadData(workloadRes.data);

            const heatmapRes = await api.get('/analysis/conflict-heatmap');
            setHeatmapData(heatmapRes.data);
        } catch (error) {
            console.error('Failed to fetch analytics', error);
        }
    };

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <h2 className="mb-4 text-2xl font-bold dark:text-white">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <WorkloadChart data={workloadData} />
                <ConflictHeatmap data={heatmapData} />
            </div>
        </div>
    );
}
