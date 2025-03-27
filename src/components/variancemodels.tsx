'use client';

import { useState } from 'react';
import SMAV from './smav';
import EWMA from './ewma';
import ARCH from './arch';
import GARCH from './garch';

interface DataPoint {
    time: number;
    value: number;
}

interface VarianceModelsProps {
    returns: DataPoint[];
}

const VarianceModels = ({ returns }: VarianceModelsProps) => {
    const [activeModel, setActiveModel] = useState<string>('smav');

    return (
        <div className="w-full">
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-300 mb-2">Variance Models</h2>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
                    Interactive simulator for different volatility modeling approaches used in financial risk management.
                </p>

                <div className="flex flex-wrap space-x-2 mb-4">
                    <button
                        className={`px-3 py-1 rounded ${activeModel === 'smav' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'}`}
                        onClick={() => setActiveModel('smav')}
                    >
                        SMAV
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${activeModel === 'ewma' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'}`}
                        onClick={() => setActiveModel('ewma')}
                    >
                        EWMA
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${activeModel === 'arch' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'}`}
                        onClick={() => setActiveModel('arch')}
                    >
                        ARCH
                    </button>
                    <button
                        className={`px-3 py-1 rounded ${activeModel === 'garch' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300'}`}
                        onClick={() => setActiveModel('garch')}
                    >
                        GARCH
                    </button>
                </div>

                {activeModel === 'smav' && (
                    <SMAV returns={returns} />
                )}

                {activeModel === 'ewma' && (
                    <EWMA returns={returns} />
                )}

                {activeModel === 'arch' && (
                    <ARCH returns={returns} />
                )}

                {activeModel === 'garch' && (
                    <GARCH returns={returns} />
                )}
            </div>

        </div>
    );
};

export default VarianceModels;