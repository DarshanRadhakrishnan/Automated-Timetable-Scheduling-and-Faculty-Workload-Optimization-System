'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import { getFaculties } from '@/services/facultyService';
import { getCourses } from '@/services/courseService';
import { getRooms } from '@/services/roomService';
import { getSections } from '@/services/sectionService';
import { getTimetables } from '@/services/timetableService';
import {
  UserCircleIcon,
  BoxCubeIcon,
  TableIcon,
  ListIcon,
  PageIcon,
  CheckCircleIcon,
} from '@/icons';

export default function Ecommerce() {
  const [stats, setStats] = useState({
    faculties: 0,
    courses: 0,
    rooms: 0,
    sections: 0,
    scheduledClasses: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [faculties, courses, rooms, sections, timetable] = await Promise.all([
          getFaculties(),
          getCourses(),
          getRooms(),
          getSections(),
          getTimetables(),
        ]);

        setStats({
          faculties: faculties.length,
          courses: courses.length,
          rooms: rooms.length,
          sections: sections.length,
          scheduledClasses: timetable.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <Card
        title="Total Faculties"
        total={stats.faculties.toString()}
        icon={<UserCircleIcon className="fill-primary dark:fill-white" />}
        color="text-blue-600 bg-blue-100 dark:bg-blue-900/30"
      />
      <Card
        title="Total Courses"
        total={stats.courses.toString()}
        icon={<BoxCubeIcon className="fill-primary dark:fill-white" />}
        color="text-green-600 bg-green-100 dark:bg-green-900/30"
      />
      <Card
        title="Total Rooms"
        total={stats.rooms.toString()}
        icon={<TableIcon className="fill-primary dark:fill-white" />}
        color="text-orange-600 bg-orange-100 dark:bg-orange-900/30"
      />
      <Card
        title="Total Sections"
        total={stats.sections.toString()}
        icon={<ListIcon className="fill-primary dark:fill-white" />}
        color="text-purple-600 bg-purple-100 dark:bg-purple-900/30"
      />
      <div className='col-span-full'>
        <Card
          title="Scheduled Classes"
          total={stats.scheduledClasses.toString()}
          icon={<PageIcon className="fill-primary dark:fill-white" />}
          color="text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30"
        />
      </div>

      <div className="col-span-full bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">System Status</h2>
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-medium">Server is running! ✅</span>
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
