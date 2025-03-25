'use client';

import {useEffect, useRef, useState, MouseEvent} from 'react';
import {Line} from 'react-chartjs-2';
import {
    CategoryScale,
    Chart,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineController, PointElement, LineElement, Tooltip);

interface DataPoint {
    time: number;
    value: number;
}

interface ReturnPoint {
    time: number;
    value: number;
}

// This component will focus on price and returns generation
// The variance models will be implemented separately
export default function MouseMovementSimulator() {
    const priceRange = { min: 500, max: 700 }; // Set the range for price (Y-axis values)
    const returnRange = { min: -10, max: 10 }; // Set the range for returns - more reasonable for log returns

    const [priceMin, setPriceMin] = useState<number>(priceRange.min);
    const [priceMax, setPriceMax] = useState<number>(priceRange.max);
    // Initialize with proper ranges for log returns
    const [returnMin, setReturnMin] = useState<number>(returnRange.min);
    const [returnMax, setReturnMax] = useState<number>(returnRange.max);

    // Store the last processed price to calculate accurate returns
    const lastProcessedPriceRef = useRef<number>(priceMin + (priceMax - priceMin) / 2);

    const [data, setData] = useState<DataPoint[]>(Array(100).fill(0).map((_, i) => ({
        time: i,
        value: priceMin + (priceMax - priceMin) / 2
    })));
    const [returns, setReturns] = useState<ReturnPoint[]>(Array(100).fill(0).map((_, i) => ({
        time: i,
        value: 0
    })));

    const timeRef = useRef<number>(100); // Start at 100 for continuous flow
    const panelRef = useRef<HTMLDivElement | null>(null);
    const mouseYRef = useRef<number>(priceMin + (priceMax - priceMin) / 2); // Start at middle of range
    const pointsPerSecond = 10;
    const pointInterval = 1000 / pointsPerSecond; // Interval between points in ms

    // Track mouse position continuously
    const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        if (panelRef.current) {

            // Get the chart container's position
            const chartContainer = panelRef.current.querySelector('.flex-grow');
            if (!chartContainer) return;

            const chartRect = chartContainer.getBoundingClientRect();

            // Calculate mouse position relative to the chart container, not the entire panel
            const mouseYPos = event.clientY - chartRect.top;
            const chartHeight = chartRect.height;

            // Ensure the position is within bounds
            const boundedYPos = Math.max(0, Math.min(mouseYPos, chartHeight));

            // Normalize the mouse Y position to match the price range
            mouseYRef.current = priceMax - (priceMax - priceMin) * (boundedYPos / chartHeight); // Store the current mouse Y position
        }
    };

    // Reset data when scale changes
    useEffect(() => {
        // Reset price data with the new scale midpoint
        setData(Array(100).fill(0).map((_, i) => ({
            time: i,
            value: priceMin + (priceMax - priceMin) / 2
        })));

        // Reset mouseYRef to the middle of the new range
        mouseYRef.current = priceMin + (priceMax - priceMin) / 2;
    }, [priceMin, priceMax]);

    // Add data points at regular intervals (10 points per second)
    useEffect(() => {
        const interval = setInterval(() => {
            timeRef.current += 1;
            const currentTime = timeRef.current;

            // Get the current price from mouse position
            const currentPrice = mouseYRef.current;

            // Use the stored last processed price for accurate return calculation
            const previousPrice = lastProcessedPriceRef.current;

            // Calculate log returns
            let returnValue = 0;
            if (previousPrice > 0 && currentPrice > 0) {
                returnValue = Math.log(currentPrice / previousPrice) * 100;
                returnValue = Math.min(Math.max(returnValue, returnMin), returnMax);
            }

            // Store the current price for the next iteration
            lastProcessedPriceRef.current = currentPrice;

            // Update price data
            setData(prev => {
                return [...prev.slice(1), { time: currentTime, value: currentPrice }];
            });

            // Update returns data
            setReturns(prev => {
                return [...prev.slice(1), { time: currentTime, value: returnValue }];
            });

        }, pointInterval);

        return () => clearInterval(interval);
    }, [returnMin, returnMax, pointInterval]);

    // Get min and max times from data for x-axis
    const minTime = data.length > 0 ? data[0].time : 0;
    const maxTime = data.length > 0 ? data[data.length - 1].time : 100;

    const priceChartData = {
        labels: data.map((d) => d.time),
        datasets: [
            {
                label: 'Price (Mouse Position)',
                data: data.map((d) => d.value),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                borderWidth: 2,
                tension: 0.4, // This adds smooth curves between points
                fill: false,
            },
        ],
    };

    const returnsChartData = {
        labels: returns.map((d) => d.time),
        datasets: [
            {
                label: 'Log Returns (%)',
                data: returns.map((d) => d.value),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
        ],
    };

    return (
        <div className="flex flex-col dark:bg-neutral-900 dark:text-neutral-100 p-6">
            <h1 className="text-3xl font-bold mb-4">Financial Time Series Simulator</h1>

            <div className="flex flex-wrap w-full">
                {/* Left column for controls and charts */}
                <div className="w-full lg:w-1/2 pr-0 lg:pr-4">
                    {/* Controls section */}
                    <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-4">
                        <h2 className="text-xl font-semibold mb-3 text-neutral-300">Simulation Controls</h2>

                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-md font-semibold mb-2 text-neutral-300">Price Range</h3>
                                <div className="flex gap-2">
                                    <div>
                                        <label className="block text-sm text-neutral-400">Min</label>
                                        <input
                                            type="number"
                                            value={priceMin}
                                            onChange={(e) => setPriceMin(Number(e.target.value))}
                                            className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400">Max</label>
                                        <input
                                            type="number"
                                            value={priceMax}
                                            onChange={(e) => setPriceMax(Number(e.target.value))}
                                            className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-md font-semibold mb-2 text-neutral-300">Log Return Range (%)</h3>
                                <div className="flex gap-2">
                                    <div>
                                        <label className="block text-sm text-neutral-400">Min</label>
                                        <input
                                            type="number"
                                            value={returnMin}
                                            min="-20"
                                            max="0"
                                            onChange={(e) => setReturnMin(Number(e.target.value))}
                                            className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-neutral-400">Max</label>
                                        <input
                                            type="number"
                                            value={returnMax}
                                            min="0"
                                            max="20"
                                            onChange={(e) => setReturnMax(Number(e.target.value))}
                                            className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3">
                            <p className="text-neutral-400">Move your mouse within the price chart to simulate price movements. The simulation generates 10 data points per second.</p>
                        </div>
                    </div>

                    {/* Price Chart */}
                    <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-4 flex flex-col"
                         onMouseMove={handleMouseMove}
                         ref={panelRef}
                         style={{ height: '300px' }}
                    >
                        <h2 className="text-lg font-semibold mb-1 text-neutral-300">Price Chart</h2>
                        <div className="flex-grow w-full h-full">
                            <Line data={priceChartData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        type: 'linear',
                                        position: 'bottom',
                                        display: false,
                                        grid: {
                                            display: false,
                                        },
                                        min: minTime,
                                        max: maxTime
                                    },
                                    y: {
                                        min: priceMin,
                                        max: priceMax,
                                        grid: {
                                            color: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    },
                                },
                                plugins: {
                                    tooltip: {
                                        enabled: false,
                                    },
                                },
                                animation: {
                                    duration: 0
                                }
                            }} />
                        </div>
                    </div>

                    {/* Returns Chart */}
                    <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-4 flex flex-col"
                         style={{ height: '300px' }}
                    >
                        <h2 className="text-lg font-semibold mb-1 text-neutral-300">Log Returns Chart (%)</h2>
                        <div className="flex-grow w-full h-full">
                            <Line data={returnsChartData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        type: 'linear',
                                        position: 'bottom',
                                        display: false,
                                        grid: {
                                            display: false,
                                        },
                                        min: minTime,
                                        max: maxTime
                                    },
                                    y: {
                                        min: returnMin,
                                        max: returnMax,
                                        grid: {
                                            color: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        ticks: {
                                            callback: function(value) {
                                                return value + '%';
                                            }
                                        }
                                    },
                                },
                                plugins: {
                                    tooltip: {
                                        enabled: false,
                                    },
                                },
                                animation: {
                                    duration: 0
                                }
                            }} />
                        </div>
                    </div>
                </div>

                {/* Right column - placeholder for variance models */}
                <div className="w-full lg:w-1/2 lg:pl-4">
                    <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-4">
                        <h2 className="text-xl font-semibold text-neutral-300 mb-2">Variance Models</h2>
                        <p className="text-neutral-400">This area is reserved for variance models (SMAV, EWMA, ARCH, GARCH).</p>
                        <p className="text-neutral-400 mt-2">The simulation data can be accessed through the getSimulationData() function.</p>
                    </div>

                    {/* Placeholder for where the variance model charts will go */}
                    <div className="bg-neutral-800 p-6 rounded-lg shadow-lg h-[620px] flex items-center justify-center">
                        <div className="text-center text-neutral-400">
                            <p className="text-lg mb-2">Variance Models Will Appear Here</p>
                            <p>Implement separate components for SMAV, EWMA, ARCH, and GARCH models</p>
                            <p className="mt-3 text-sm">Connect these components to receive price and returns data from this simulation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}