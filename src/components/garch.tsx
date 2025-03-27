'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DataPoint {
    time: number;
    value: number;
}

interface GARCHProps {
    returns: DataPoint[];
    defaultOmega?: number;
    defaultAlpha?: number;
    defaultBeta?: number;
}

interface VolatilityPoint {
    time: number;
    value: number;
}

const GARCH = ({ returns, defaultOmega = 0.000001, defaultAlpha = 0.09, defaultBeta = 0.9 }: GARCHProps) => {
    const [omega, setOmega] = useState<number>(defaultOmega);
    const [alpha, setAlpha] = useState<number>(defaultAlpha);
    const [beta, setBeta] = useState<number>(defaultBeta);
    const [volatility, setVolatility] = useState<VolatilityPoint[]>([]);
    const [annualizedVolatility, setAnnualizedVolatility] = useState<number>(0);
    const [halfLife, setHalfLife] = useState<number>(0);
    const [longRunVol, setLongRunVol] = useState<number>(0);
    const [logLikelihood, setLogLikelihood] = useState<number>(0);

    // Calculate GARCH when returns or parameters change
    useEffect(() => {
        if (returns.length < 2) return;

        // Calculate GARCH (Generalized Autoregressive Conditional Heteroskedasticity)
        const calculateGARCH = () => {
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

            // Calculate long-run volatility
            const longRunVariance = omega / (1 - alpha - beta);
            setLongRunVol(Math.sqrt(longRunVariance));

            // Calculate half-life
            const lambdaDecay = alpha + beta;
            setHalfLife(Math.log(0.5) / Math.log(lambdaDecay));

            // Initialize the first variance with unconditional variance (or long-run variance)
            let previousVariance = longRunVariance;
            let previousSquaredReturn = returns[0].value ** 2;

            volatilityPoints.push({
                time: returns[0].time,
                value: Math.sqrt(previousVariance)
            });

            // Calculate GARCH conditional variances
            for (let i = 1; i < returns.length; i++) {
                // GARCH(1,1) formula: σ²_t = ω + α * ε²_{t-1} + β * σ²_{t-1}
                const conditionalVariance = omega + alpha * previousSquaredReturn + beta * previousVariance;

                // Calculate log-likelihood
                const returnValue = returns[i].value;
                const standardizedReturn = returnValue / Math.sqrt(conditionalVariance);
                const pointLogLikelihood = -0.5 * (Math.log(2 * Math.PI) + Math.log(conditionalVariance) + standardizedReturn ** 2);
                totalLogLikelihood += pointLogLikelihood;

                volatilityPoints.push({
                    time: returns[i].time,
                    value: Math.sqrt(conditionalVariance)
                });

                // Update for next iteration
                previousVariance = conditionalVariance;
                previousSquaredReturn = returnValue ** 2;
            }

            setLogLikelihood(totalLogLikelihood);
            return volatilityPoints;
        };

        const newVolatility = calculateGARCH();
        setVolatility(newVolatility);

        // Calculate annualized volatility
        if (newVolatility.length > 0) {
            const latestVolatility = newVolatility[newVolatility.length - 1].value;
            setAnnualizedVolatility(latestVolatility * Math.sqrt(252));
        }
    }, [returns, omega, alpha, beta]);

    // Prepare chart data
    const chartData = {
        labels: volatility.map(point => point.time),
        datasets: [
            {
                label: `GARCH(1,1)`,
                data: volatility.map(point => point.value),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
            {
                label: 'Long-run Volatility',
                data: volatility.map(() => longRunVol),
                borderColor: 'rgba(255, 99, 132, 0.7)',
                borderWidth: 1,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            },
        ],
    };

    // Get min and max times from data for x-axis
    const minTime = volatility.length > 0 ? volatility[0].time : 0;
    const maxTime = volatility.length > 0 ? volatility[volatility.length - 1].time : 100;

    // Estimate reasonable y-axis range for volatility
    const maxVolatility = volatility.length > 0
        ? (Math.max(...volatility.map(point => point.value), longRunVol) * 1.2).toFixed(2)
        : 5;

    // Check if model is stable (persistence)
    const persistence = alpha + beta;
    const isStable = persistence < 1;

    // Common GARCH(1,1) parameter presets
    const presets = [
        { name: "RiskMetrics", omega: 0.000001, alpha: 0.06, beta: 0.94 },
        { name: "Standard", omega: 0.000002, alpha: 0.09, beta: 0.90 },
        { name: "High Persistence", omega: 0.000001, alpha: 0.04, beta: 0.95 },
        { name: "More Reactive", omega: 0.000005, alpha: 0.15, beta: 0.80 }
    ];

    return (
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg mb-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-300">Generalized Autoregressive Conditional Heteroskedasticity (GARCH)</h2>
                    <div className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Models volatility as a function of both past squared returns and past variances</div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-neutral-400">Preset:</span>
                    <select
                        onChange={(e) => {
                            const selected = presets[parseInt(e.target.value)];
                            setOmega(selected.omega);
                            setAlpha(selected.alpha);
                            setBeta(selected.beta);
                        }}
                        className="px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    >
                        <option value="">Custom</option>
                        {presets.map((preset, index) => (
                            <option key={index} value={index}>
                                {preset.name} (α={preset.alpha}, β={preset.beta})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-neutral-400">ω:</span>
                    <input
                        type="number"
                        min="0.0000001"
                        max="0.0001"
                        step="0.0000001"
                        value={omega}
                        onChange={(e) => setOmega(Number(e.target.value))}
                        className="w-28 px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-neutral-400">α:</span>
                    <input
                        type="number"
                        min="0.01"
                        max="0.3"
                        step="0.01"
                        value={alpha}
                        onChange={(e) => setAlpha(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-neutral-400">β:</span>
                    <input
                        type="number"
                        min="0.5"
                        max="0.99"
                        step="0.01"
                        value={beta}
                        onChange={(e) => setBeta(Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center space-x-1">
                    <span className="text-gray-600 dark:text-neutral-400">Persistence (α+β):</span>
                    <span className={`px-2 py-1 rounded ${isStable ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'}`}>
                        {persistence.toFixed(3)}
                    </span>
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
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Long-run Volatility</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {(longRunVol * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">
                        σ = √(ω/(1-α-β))
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm text-gray-600 dark:text-neutral-400">Half-life</h3>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {halfLife.toFixed(1)} periods
                    </p>
                    <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">
                        Time for shock to decay by 50%
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
                        legend: {
                            position: 'top',
                        }
                    },
                    animation: {
                        duration: 0
                    }
                }} />
            </div>

            <div className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                <p>{"GARCH(1, 1) models conditional variance as: σ²_t = ω + α * ε²_{t-1} + β * σ²_{t-1}"}</p>
                <p>Key properties:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                    <li>ω (omega): Base level of variance, typically very small</li>
                    <li>α (alpha): Weight on recent squared returns, measures reaction to new information</li>
                    <li>β (beta): Weight on previous variance, measures persistence of volatility</li>
                    <li>For stationarity, α + β must be less than 1 (otherwise volatility explodes)</li>
                    <li>Higher α makes volatility more reactive to market shocks</li>
                    <li>Higher β makes volatility more persistent over time</li>
                    <li>Typical values: α ≈ 0.05-0.15, β ≈ 0.8-0.95</li>
                </ul>
                <p className="mt-1">The {"model's"} log-likelihood: {logLikelihood.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default GARCH;