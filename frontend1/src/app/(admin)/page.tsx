'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStats } from '@/services/timetableService';
import {
  UserCircleIcon,
  BoxCubeIcon,
  TableIcon,
  ListIcon,
  PageIcon,
  CheckCircleIcon,
} from '@/icons';

export default function Ecommerce() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    faculties: 0,
    courses: 0,
    rooms: 0,
    sections: 0,
    scheduledClasses: 0,
  });

  useEffect(() => {
    // Only fetch when auth is resolved and user is authenticated
    if (authLoading || !isAuthenticated) return;

    const fetchStats = async () => {
      try {
        // Use the lightweight /stats endpoint instead of fetching all records
        const data = await getStats();
        setStats({
          faculties: data.totalFaculties || 0,
          courses: data.totalCourses || 0,
          rooms: data.totalRooms || 0,
          sections: data.totalSections || 0,
          scheduledClasses: data.scheduledClasses || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [authLoading, isAuthenticated]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <Card
        title="Total Faculties"
        total={stats.faculties.toString()}
        icon={<UserCircleIcon className="fill-primary dark:fill-white" />}
        color="text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
      />
      <Card
        title="Total Courses"
        total={stats.courses.toString()}
        icon={<BoxCubeIcon className="fill-primary dark:fill-white" />}
        color="text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
      />
      <Card
        title="Total Rooms"
        total={stats.rooms.toString()}
        icon={<TableIcon className="fill-primary dark:fill-white" />}
        color="text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
      />
      <Card
        title="Total Sections"
        total={stats.sections.toString()}
        icon={<ListIcon className="fill-primary dark:fill-white" />}
        color="text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
      />
      <div className='col-span-full'>
        <Card
          title="Scheduled Classes"
          total={stats.scheduledClasses.toString()}
          icon={<PageIcon className="fill-primary dark:fill-white" />}
          color="text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
        />
      </div>

      <div className="col-span-full bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">System Status</h2>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-medium">Server is running.</span>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  total,
  icon,
  color,
}: {
  title: string;
  total: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className={`flex h-11.5 w-11.5 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {total}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
}
