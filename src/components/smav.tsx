'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DataPoint {
    time: number;
    value: number;
}

interface SMAVProps {
    returns: DataPoint[];
    windowSizes?: number[];
    defaultWindowSize?: number;
}

interface VolatilityPoint {
    time: number;
    value: number;
}

const SMAV = ({ returns, windowSizes = [10, 20, 30, 50], defaultWindowSize = 20 }: SMAVProps) => {
    const [selectedWindowSize, setSelectedWindowSize] = useState<number>(defaultWindowSize);
    const [volatility, setVolatility] = useState<VolatilityPoint[]>([]);
    const [annualizedVolatility, setAnnualizedVolatility] = useState<number>(0);

    // Calculate SMAV when returns or window size changes
    useEffect(() => {
        if (returns.length === 0) return;

        // Calculate SMAV (Simple Moving Average Volatility)
        const calculateSMAV = () => {
            // Ensure we have enough data points for the window
            if (returns.length < selectedWindowSize) {
                return [];
            }

            const volatilityPoints: VolatilityPoint[] = [];

            // Calculate average of squared returns for each window
            for (let i = selectedWindowSize - 1; i < returns.length; i++) {
                const windowReturns = returns.slice(i - selectedWindowSize + 1, i + 1).map(point => point.value);

                // Calculate sum of squared returns
                const sumSquaredReturns = windowReturns.reduce((sum, value) => {
                    return sum + (value * value);
                }, 0);

                // Average of squared returns
                const avgSquaredReturns = sumSquaredReturns / windowReturns.length;

                // Take the square root to get volatility in the same units as returns
                const volatility = Math.sqrt(avgSquaredReturns);

                volatilityPoints.push({
                    time: returns[i].time,
                    value: volatility
                });
            }

            return volatilityPoints;
        };

        const newVolatility = calculateSMAV();
        setVolatility(newVolatility);

        // Calculate annualized volatility (assuming daily returns, multiply by sqrt(252))
        // For your real-time simulator where data points are generated at custom intervals,
        // you might need to adjust the annualization factor
        if (newVolatility.length > 0) {
            const latestVolatility = newVolatility[newVolatility.length - 1].value;
            // Multiply by sqrt(252) for daily returns (standard in finance)
            // For your simulator with 10 points per second, you might use a different factor
            setAnnualizedVolatility(latestVolatility * Math.sqrt(252));
        }
    }, [returns, selectedWindowSize]);

    // Prepare chart data
    const chartData = {
        labels: volatility.map(point => point.time),
        datasets: [
            {
                label: `SMAV (Window: ${selectedWindowSize})`,
                data: volatility.map(point => point.value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
        ],
    };

    // Get min and max times from data for x-axis
    const minTime = volatility.length > 0 ? volatility[0].time : 0;
    const maxTime = volatility.length > 0 ? volatility[volatility.length - 1].time : 100;

    // Estimate reasonable y-axis range for volatility
    const maxVolatility = volatility.length > 0
        ?(Math.max(...volatility.map(point => point.value)) * 1.2).toFixed(2)
        : 5;

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg mb-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-300">Simple Moving Average Volatility (SMAV)</h2>
                    <div className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Using average of squared returns</div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-gray-600 dark:text-neutral-400">Window Size:</span>
                    <select
                        value={selectedWindowSize}
                        onChange={(e) => setSelectedWindowSize(Number(e.target.value))}
                        className="px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    >
                        {windowSizes.map(size => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Current Volatility</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {volatility.length > 0 ?
                            (volatility[volatility.length - 1].value ).toFixed(2) : '0.00'}%
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Annualized Volatility</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {(annualizedVolatility).toFixed(2)}%
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Window Size</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{selectedWindowSize} periods</p>
                </div>
            </div>

            <div className="flex-grow" style={{ height: '250px' }}>
                <Line data={chartData} options={{
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
                            min: 0,
                            max: maxVolatility,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
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
                            callbacks: {
                                label: function(context) {
                                    return `Volatility: ${(context.parsed.y * 100).toFixed(2)}%`;
                                }
                            }
                        },
                    },
                    animation: {
                        duration: 0
                    }
                }} />
            </div>

            <div className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                <p>SMAV calculates volatility as the square root of the average squared returns over a rolling window.</p>
                <p>This approach estimates volatility directly from returns without subtracting the mean.</p>
                <p>Larger window sizes provide smoother volatility estimates but respond more slowly to changes.</p>
            </div>
        </div>
    );
};

export default SMAV;