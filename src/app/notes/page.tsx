'use client';

import { useState } from 'react';

const NotesPage = () => {
    const [activeTab, setActiveTab] = useState<string>('variance');

    // Define your PDF documents
    const documents = {
        variance: {
            title: "Variance Models in Financial Mathematics",
            description: "A comprehensive overview of different variance estimation approaches including SMAV, EWMA, ARCH, and GARCH models.",
            pdfUrl: "/pdfs/variance_models.pdf", // Replace with your actual PDF path
            date: "March 2025",
        }
    };

    // Available document tabs
    const tabs = [
        { id: 'variance', label: 'Variance Models' }
    ];

    const activeDocument = documents[activeTab as keyof typeof documents];

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-neutral-200">Academic Notes & Documentation</h1>

            <div className="mb-6">
                <div className="flex flex-wrap border-b border-gray-200 dark:border-neutral-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                                activeTab === tab.id
                                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-neutral-200">{activeDocument.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Published: {activeDocument.date}</p>
                    <p className="mt-3 text-gray-600 dark:text-neutral-300">{activeDocument.description}</p>
                </div>

                {/* PDF Viewer */}
                <div className="w-full bg-gray-100 dark:bg-neutral-900 rounded-lg overflow-hidden" style={{ height: "800px" }}>
                    <iframe
                        src={`${activeDocument.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full"
                        title={activeDocument.title}
                    />
                </div>
                <div className="mt-4 flex space-x-3">
                    <a
                        href={activeDocument.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;