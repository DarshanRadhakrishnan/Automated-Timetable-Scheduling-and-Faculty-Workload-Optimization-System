"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface WorkloadData {
    name: string;
    classes: number;
    department: string;
}

interface WorkloadChartProps {
    data: WorkloadData[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ data }) => {
    const series = [{
        name: 'Classes',
        data: data.map(item => item.classes)
    }];

    const options: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: data.map(item => item.name),
        },
        colors: ['#3C50E0'],
        theme: {
            mode: 'light' // Can be dynamic based on theme context
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                Faculty Workload Distribution
            </h3>
            <div id="chartOne" className="-ml-5">
                <ReactApexChart options={options} series={series} type="bar" height={350} />
            </div>
        </div>
    );
};

export default WorkloadChart;
