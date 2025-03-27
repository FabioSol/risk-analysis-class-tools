import { FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

export default function ContactPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen dark:bg-neutral-900 dark:text-neutral-100 p-6">
            <h1 className="text-4xl font-bold mb-4">Contact Me</h1>
            <p className="text-lg text-neutral-400 mb-8 text-center max-w-md">
                Feel free to reach out through my social profiles or email!
            </p>
            <div className="w-full max-w-md bg-neutral-100 dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                    <a
                        href="https://www.linkedin.com/in/fabio-solorzano-flores"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-neutral-300 text-lg flex items-center gap-2"
                    >
                        <FaLinkedin className="text-neutral-400 text-2xl" />
                        LinkedIn
                    </a>
                </div>
                <div className="mb-4 flex items-center gap-3">
                    <a
                        href="https://github.com/FabioSol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-neutral-300 text-lg flex items-center gap-2"
                    >
                        <FaGithub className="text-neutral-400 text-2xl" />
                        GitHub
                    </a>
                </div>
                <div className="mb-4 flex items-center gap-3">
                    <FaEnvelope className="text-neutral-400 text-2xl" />
                    <p className="text-neutral-400 text-lg">fabioso2231@gmail.com</p>
                </div>
            </div>
        </div>
    );
}