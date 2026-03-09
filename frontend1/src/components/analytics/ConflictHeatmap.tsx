"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ConflictHeatmapProps {
    data: { [day: string]: { [time: string]: number } };
}

const ConflictHeatmap: React.FC<ConflictHeatmapProps> = ({ data }) => {
    // Transform data for Heatmap: Series = Days, X = Time
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Collect all unique time slots and sort them
    const timeSlots = new Set<string>();
    Object.values(data).forEach(dayData => {
        Object.keys(dayData).forEach(time => timeSlots.add(time));
    });
    const sortedTimeSlots = Array.from(timeSlots).sort();

    const series = days.map(day => ({
        name: day,
        data: sortedTimeSlots.map(time => ({
            x: time,
            y: data[day]?.[time] || 0
        }))
    }));

    const options: ApexOptions = {
        chart: {
            height: 350,
            type: 'heatmap',
            toolbar: { show: false }
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#008FFB'],
        title: {
            text: 'Conflict/Class Density Heatmap'
        },
        plotOptions: {
            heatmap: {
                colorScale: {
                    ranges: [{
                        from: 0,
                        to: 0,
                        color: '#E0E0E0',
                        name: 'No Classes',
                    },
                    {
                        from: 1,
                        to: 5,
                        color: '#00A100',
                        name: 'Low',
                    },
                    {
                        from: 6,
                        to: 20,
                        color: '#FFB200',
                        name: 'Medium',
                    },
                    {
                        from: 21,
                        to: 100,
                        color: '#FF0000',
                        name: 'High',
                    }]
                }
            }
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                Weekly Schedule Density
            </h3>
            <div id="chartTwo" className="-ml-5">
                <ReactApexChart options={options} series={series} type="heatmap" height={350} />
            </div>
        </div>
    );
};

export default ConflictHeatmap;
