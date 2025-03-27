
'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DataPoint {
    time: number;
    value: number;
}

interface EWMAProps {
    returns: DataPoint[];
    defaultLambda?: number;
}

interface VolatilityPoint {
    time: number;
    value: number;
}

const EWMA = ({ returns, defaultLambda = 0.94 }: EWMAProps) => {
    const [lambda, setLambda] = useState<number>(defaultLambda);
    const [volatility, setVolatility] = useState<VolatilityPoint[]>([]);
    const [annualizedVolatility, setAnnualizedVolatility] = useState<number>(0);

    // Calculate EWMA when returns or lambda changes
    useEffect(() => {
        if (returns.length < 2) return;

        // Calculate EWMA (Exponentially Weighted Moving Average) Volatility
        const calculateEWMA = () => {
            const volatilityPoints: VolatilityPoint[] = [];

            // Calculate the overall mean of all available returns
            const sum = returns.reduce((acc, point) => acc + point.value, 0);
            const mean = sum / returns.length;

            // Calculate the variance of all returns
            const squaredDiffs = returns.map(point => {
                const diff = point.value - mean;
                return diff * diff;
            });
            const overallVariance = squaredDiffs.reduce((acc, val) => acc + val, 0) / returns.length;

            // Initialize variance with the overall variance
            let prevVariance = overallVariance;

            // Calculate EWMA variance recursively for each point
            for (let i = 0; i < returns.length; i++) {
                const returnValue = returns[i].value;
                const deviation = returnValue - mean;
                const squaredDeviation = deviation * deviation;

                // EWMA variance formula
                const variance = lambda * prevVariance + (1 - lambda) * squaredDeviation;

                // Store the current variance for the next iteration
                prevVariance = variance;

                // Take the square root to get volatility
                volatilityPoints.push({
                    time: returns[i].time,
                    value: Math.sqrt(variance)
                });
            }

            return volatilityPoints;
        };

        const newVolatility = calculateEWMA();
        setVolatility(newVolatility);

        // Calculate annualized volatility
        if (newVolatility.length > 0) {
            const latestVolatility = newVolatility[newVolatility.length - 1].value;
            setAnnualizedVolatility(latestVolatility * Math.sqrt(252));
        }
    }, [returns, lambda]);

    // Prepare chart data
    const chartData = {
        labels: volatility.map(point => point.time),
        datasets: [
            {
                label: `EWMA (λ = ${lambda})`,
                data: volatility.map(point => point.value),
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
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
        ?( Math.max(...volatility.map(point => point.value)) * 1.2).toFixed(2)
        : 5;

    // Define common lambda values
    const commonLambdaValues = [
        { value: 0.94, label: '0.94 (RiskMetrics)' },
        { value: 0.90, label: '0.90 (Higher reactivity)' },
        { value: 0.97, label: '0.97 (Lower reactivity)' },
        { value: 0.80, label: '0.80 (Very high reactivity)' }
    ];

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg mb-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-300">Exponentially Weighted Moving Average (EWMA)</h2>
                    <div className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Shows evolving forecast of variance using recursive EWMA formula</div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-gray-600 dark:text-neutral-400">λ (lambda):</span>
                    <select
                        value={lambda}
                        onChange={(e) => setLambda(Number(e.target.value))}
                        className="px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    >
                        {commonLambdaValues.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
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
                            (volatility[volatility.length - 1].value * 100).toFixed(2) : '0.00'}%
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Annualized Volatility</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {(annualizedVolatility * 100).toFixed(2)}%
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Memory Decay</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">λ = {lambda}</p>
                    <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">
                        Half-life: {Math.round(Math.log(0.5) / Math.log(lambda))} periods
                    </p>
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
                <p>This implementation calculates a full history of volatility forecasts using the recursive EWMA formula.</p>
                <p>All returns are measured against the overall mean to calculate deviations.</p>
                <p>Higher λ values increase smoothness and persistence of the volatility estimate.</p>
                <p>Lower λ values make the volatility estimate more responsive to individual returns.</p>
                <p>The first estimate uses the overall variance as a starting point for the recursive calculation.</p>
            </div>
        </div>
    );
};

export default EWMA;