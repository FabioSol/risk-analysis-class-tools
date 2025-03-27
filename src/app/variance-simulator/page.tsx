import VarianceSimulator from "@/components/variancesimulator";

export default function VarianceSimulatorPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen dark:bg-neutral-900 dark:text-neutral-100 p-6">
            <VarianceSimulator/>
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-neutral-300 mb-3">Model Comparison</h2>
                <p className="text-gray-600 dark:text-neutral-400 mb-2">
                    Comparing different volatility estimation approaches and their characteristics.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                        <h3 className="text-sm text-gray-600 dark:text-neutral-400">Responsiveness</h3>
                        <p className="text-sm mt-1 text-gray-700 dark:text-neutral-300">
                            <span className="font-semibold">SMAV:</span> Responds slowly, weighs all observations equally within window.<br />
                            <span className="font-semibold">EWMA:</span> More responsive, recent observations have more weight.<br />
                            <span className="font-semibold">ARCH:</span> Highly responsive to return shocks, can overreact.<br />
                            <span className="font-semibold">GARCH:</span> Balanced, captures both shocks and persistence.
                        </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                        <h3 className="text-sm text-gray-600 dark:text-neutral-400">Parameter Sensitivity</h3>
                        <p className="text-sm mt-1 text-gray-700 dark:text-neutral-300">
                            <span className="font-semibold">SMAV:</span> Only sensitive to window size selection.<br />
                            <span className="font-semibold">EWMA:</span> Lambda controls memory decay rate.<br />
                            <span className="font-semibold">ARCH:</span> Alpha controls reaction to new information.<br />
                            <span className="font-semibold">GARCH:</span> Alpha/beta balance controls behavior.
                        </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                        <h3 className="text-sm text-gray-600 dark:text-neutral-400">Volatility Clustering</h3>
                        <p className="text-sm mt-1 text-gray-700 dark:text-neutral-300">
                            <span className="font-semibold">SMAV:</span> Poor at capturing volatility clustering.<br />
                            <span className="font-semibold">EWMA:</span> Moderate ability to capture clustering.<br />
                            <span className="font-semibold">ARCH:</span> Designed to capture volatility clustering.<br />
                            <span className="font-semibold">GARCH:</span> Best at modeling persistent clustering.
                        </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                        <h3 className="text-sm text-gray-600 dark:text-neutral-400">Long-run Behavior</h3>
                        <p className="text-sm mt-1 text-gray-700 dark:text-neutral-300">
                            <span className="font-semibold">SMAV:</span> No long-run target, fully determined by window.<br />
                            <span className="font-semibold">EWMA:</span> No unconditional variance (non-stationary).<br />
                            <span className="font-semibold">ARCH:</span> Has unconditional variance but unstable.<br />
                            <span className="font-semibold">GARCH:</span> Stable long-run volatility with mean reversion.
                        </p>
                    </div>
                </div>

                <div className="mt-6 bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">Academic Context</h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                        These models represent the evolution of volatility modeling in financial econometrics:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-neutral-400 mt-1">
                        <li><span className="text-gray-700 dark:text-neutral-300">SMAV (Simple Moving Average Volatility)</span>: Simplest approach, commonly used in basic technical analysis</li>
                        <li><span className="text-gray-700 dark:text-neutral-300">EWMA (Exponentially Weighted Moving Average)</span>: Popularized by RiskMetrics in the 1990s</li>
                        <li><span className="text-gray-700 dark:text-neutral-300">ARCH (Autoregressive Conditional Heteroskedasticity)</span>: Developed by Robert Engle (1982), Nobel Prize in Economics</li>
                        <li><span className="text-gray-700 dark:text-neutral-300">GARCH (Generalized ARCH)</span>: Extended by Tim Bollerslev (1986), most widely used in practice</li>
                    </ul>
                </div>

                <div className="mt-6 bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">Mathematical Foundations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-neutral-400">
                        <div>
                            <p className="mb-1"><span className="text-gray-700 dark:text-neutral-300">SMAV:</span></p>
                            <p>{"σ_t = √(Σ(r_i - μ)² / n)"}</p>
                            <p className="mt-1">Where r_i are returns in window, μ is mean, n is window size</p>
                        </div>
                        <div>
                            <p className="mb-1"><span className="text-gray-700 dark:text-neutral-300">EWMA:</span></p>
                            <p>{"σ²_t = λ·σ²_{t-1} + (1-λ)·r²_{t-1}"}</p>
                            <p className="mt-1">Where λ is decay factor (typically 0.94)</p>
                        </div>
                        <div>
                            <p className="mb-1"><span className="text-gray-700 dark:text-neutral-300">ARCH(1):</span></p>
                            <p>{"σ²_t = α₀ + α₁·r²_{t-1}"}</p>
                            <p className="mt-1">{"Where α₀ > 0, 0 ≤ α₁ < 1"}</p>
                        </div>
                        <div>
                            <p className="mb-1"><span className="text-gray-700 dark:text-neutral-300">GARCH(1,1):</span></p>
                            <p>{"σ²_t = ω + α·r²_{t-1} + β·σ²_{t-1}"}</p>
                            <p className="mt-1">{"Where ω > 0, α, β ≥ 0, α + β < 1"}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-gray-100 dark:bg-neutral-700 p-3 rounded">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-neutral-300 mb-2">Practical Applications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-neutral-300">
                        <div>
                            <h4 className="text-gray-600 dark:text-neutral-400">Risk Management</h4>
                            <p className="mt-1">
                                Accurate volatility forecasting is essential for Value-at-Risk (VaR) calculations,
                                stress testing, and capital allocation.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-gray-600 dark:text-neutral-400">Options Pricing</h4>
                            <p className="mt-1">
                                Models provide inputs for implied volatility and options pricing models,
                                improving derivatives valuation.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-gray-600 dark:text-neutral-400">Portfolio Construction</h4>
                            <p className="mt-1">
                                Dynamic volatility estimates improve risk-adjusted portfolio optimization and
                                asset allocation strategies.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-gray-600 dark:text-neutral-400">Economic Research</h4>
                            <p className="mt-1">
                                Volatility modeling helps identify structural breaks, regime changes, and
                                transmission of market uncertainty.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
