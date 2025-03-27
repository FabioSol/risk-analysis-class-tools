'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DataPoint {
    time: number;
    value: number;
}

interface ARCHProps {
    returns: DataPoint[];
    defaultAlpha0?: number;
    defaultAlpha1?: number;
    defaultLag?: number;
}

interface VolatilityPoint {
    time: number;
    value: number;
}

const ARCH = ({ returns, defaultAlpha0 = 0.01, defaultAlpha1 = 0.7, defaultLag = 1 }: ARCHProps) => {
    const [alpha0, setAlpha0] = useState<number>(defaultAlpha0);
    const [alpha1, setAlpha1] = useState<number>(defaultAlpha1);
    const [lag, setLag] = useState<number>(defaultLag);
    const [volatility, setVolatility] = useState<VolatilityPoint[]>([]);
    const [annualizedVolatility, setAnnualizedVolatility] = useState<number>(0);
    const [logLikelihood, setLogLikelihood] = useState<number>(0);

    // Calculate ARCH when returns or parameters change
    useEffect(() => {
        if (returns.length < lag + 1) return;

        // Calculate ARCH (Autoregressive Conditional Heteroskedasticity)
        const calculateARCH = () => {
            const volatilityPoints: VolatilityPoint[] = [];
            let totalLogLikelihood = 0;

            // Calculate the overall mean of returns
            const sum = returns.reduce((acc, point) => acc + point.value, 0);
            const mean = sum / returns.length;

            // Calculate the average variance for initialization
            const squaredDiffs = returns.map(point => {
                const diff = point.value - mean;
                return diff * diff;
            });
            const avgVariance = squaredDiffs.reduce((acc, val) => acc + val, 0) / returns.length;

            // Initialize first 'lag' volatilities with unconditional variance
            for (let i = 0; i < lag; i++) {
                volatilityPoints.push({
                    time: returns[i].time,
                    value: Math.sqrt(avgVariance)
                });
            }

            // Calculate ARCH conditional variances
            for (let i = lag; i < returns.length; i++) {
                const pastSquaredReturn = returns[i - lag].value ** 2;

                // ARCH(1) formula: σ²_t = α₀ + α₁ * ε²_{t-1}
                const conditionalVariance = alpha0 + alpha1 * pastSquaredReturn;

                // Calculate log-likelihood
                const returnValue = returns[i].value;
                const standardizedReturn = returnValue / Math.sqrt(conditionalVariance);
                const pointLogLikelihood = -0.5 * (Math.log(2 * Math.PI) + Math.log(conditionalVariance) + standardizedReturn ** 2);
                totalLogLikelihood += pointLogLikelihood;

                volatilityPoints.push({
                    time: returns[i].time,
                    value: Math.sqrt(conditionalVariance)
                });
            }

            setLogLikelihood(totalLogLikelihood);
            return volatilityPoints;
        };

        const newVolatility = calculateARCH();
        setVolatility(newVolatility);

        // Calculate annualized volatility
        if (newVolatility.length > 0) {
            const latestVolatility = newVolatility[newVolatility.length - 1].value;
            setAnnualizedVolatility(latestVolatility * Math.sqrt(252));
        }
    }, [returns, alpha0, alpha1, lag]);

    // Prepare chart data
    const chartData = {
        labels: volatility.map(point => point.time),
        datasets: [
            {
                label: `ARCH(${lag})`,
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
        ? (Math.max(...volatility.map(point => point.value)) * 1.2).toFixed(2)
        : 5;

    // Check if model is stable
    const isStable = alpha1 < 1;

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg mb-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-300">Autoregressive Conditional Heteroskedasticity (ARCH)</h2>
                    <div className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Models volatility as a function of past squared returns</div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-gray-600 dark:text-neutral-400">α₀:</span>
                    <input
                        type="number"
                        min="0.001"
                        max="0.1"
                        step="0.001"
                        value={alpha0}
                        onChange={(e) => setAlpha0(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-600 dark:text-neutral-400">α₁:</span>
                    <input
                        type="number"
                        min="0.1"
                        max="0.95"
                        step="0.05"
                        value={alpha1}
                        onChange={(e) => setAlpha1(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-600 dark:text-neutral-400">Lag:</span>
                    <select
                        value={lag}
                        onChange={(e) => setLag(Number(e.target.value))}
                        className="px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Model Parameters</h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        α₀: {alpha0.toFixed(3)}, α₁: {alpha1.toFixed(2)}
                    </p>
                    <p className={`text-xs mt-1 ${isStable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isStable ? 'Model is stable' : 'Warning: Unstable (α₁ ≥ 1)'}
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Log-Likelihood</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {logLikelihood.toFixed(2)}
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
                <p>ARCH models explicitly model time-varying volatility as a function of past squared returns.</p>
                <p>{"σ²_t = α₀ + α₁ * ε²_{t-1} is the simplest form (ARCH(1))."}</p>
                <p>α₀ controls the baseline volatility level, while α₁ determines how reactive the model is to past returns.</p>
                <p>For stability, α₁ must be less than 1. Higher values make volatility more persistent.</p>
                <p>The model captures volatility clustering - large price changes tend to be followed by large changes.</p>
            </div>
        </div>
    );
};

export default ARCH;