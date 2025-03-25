
export default function AboutPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen dark:bg-neutral-900 dark:text-neutral-100 p-6">
            <h1 className="text-4xl font-bold mb-4">About This Project</h1>
            <p className="text-lg text-neutral-400 mb-6 text-center max-w-2xl">
                <strong>Risk Analysis Class Tools</strong> is a website developed to help students build intuition about the complex financial risk models covered in class.
                This course is part of the Financial Engineering plan at ITESO and is taught by <strong>Fabio Solórzano Flores</strong>.
            </p>
            <p className="text-lg text-neutral-400 text-center max-w-2xl">
                The models we will explore include various variance models such as <strong>SMAV</strong>, <strong>EWMA</strong>, <strong>ARCH</strong>, and <strong>GARCH</strong>.
                These tools aim to provide an interactive and intuitive learning experience.
            </p>
        </div>
    );
}
