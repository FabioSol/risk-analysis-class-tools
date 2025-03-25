export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen dark:bg-neutral-900 dark:text-neutral-100 p-6">
            <h1 className="text-5xl font-bold mb-6">Welcome to Risk Analysis Class Tools</h1>
            <p className="text-lg text-neutral-400 text-center max-w-2xl">
                This platform provides interactive tools to help students develop intuition
                about complex financial risk models. Explore variance models like <strong>SMAV</strong>,
                <strong>EWMA</strong>, <strong>ARCH</strong>, and <strong>GARCH</strong>, and enhance your
                understanding of risk analysis in the Financial Engineering program at ITESO.
            </p>
        </div>
    );
}