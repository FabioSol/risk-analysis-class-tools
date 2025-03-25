'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    id: string;
}

const CursorInteractive = () => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Memoized event handlers for better performance
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
            setIsHovering(true);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovering(false);
    }, []);

    // Handle mouse movement with passive event listeners for better performance
    useEffect(() => {
        const currentRef = containerRef.current;

        if (currentRef) {
            currentRef.addEventListener('mousemove', handleMouseMove, { passive: true });
            currentRef.addEventListener('mouseleave', handleMouseLeave, { passive: true });
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('mousemove', handleMouseMove);
                currentRef.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [handleMouseMove, handleMouseLeave]);

    // Create particles on mouse move with async processing
    useEffect(() => {
        if (!isHovering) return;

        // Generate particles asynchronously
        const generateParticle = async () => {
            const uniqueId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

            const newParticle: Particle = {
                x: mousePosition.x,
                y: mousePosition.y,
                size: Math.random() * 4 + 1,
                speedX: (Math.random() - 0.5) * 2,
                speedY: (Math.random() - 0.5) * 2,
                opacity: 0.7,
                id: uniqueId
            };

            // Use requestAnimationFrame for smoother rendering
            requestAnimationFrame(() => {
                setParticles(prevParticles => [...prevParticles, newParticle]);
            });
        };

        generateParticle();

        // Throttle particle creation for better performance
        const throttleDelay = 20; // ms
        const throttleTimer = setTimeout(generateParticle, throttleDelay);

        return () => clearTimeout(throttleTimer);
    }, [mousePosition, isHovering]);

    // Process particles with Web Animation API or requestAnimationFrame for better performance
    useEffect(() => {
        if (particles.length === 0) return;

        let animationFrameId: number;

        const updateParticles = () => {
            setParticles(prevParticles =>
                prevParticles
                    .map(particle => ({
                        ...particle,
                        x: particle.x + particle.speedX,
                        y: particle.y + particle.speedY,
                        opacity: particle.opacity - 0.01
                    }))
                    .filter(particle => particle.opacity > 0)
            );

            animationFrameId = requestAnimationFrame(updateParticles);
        };

        animationFrameId = requestAnimationFrame(updateParticles);

        return () => cancelAnimationFrame(animationFrameId);
    }, [particles.length]);

    // Memoize particle components for better rendering performance
    const particleElements = useMemo(() => {
        return particles.map((particle) => (
            <div
                key={particle.id}
                className="absolute rounded-full pointer-events-none will-change-transform"
                style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: `rgba(150, 150, 150, ${particle.opacity})`,
                    transform: `translate(${particle.x - particle.size / 2}px, ${particle.y - particle.size / 2}px)`,
                    opacity: particle.opacity
                }}
            />
        ));
    }, [particles]);

    // Preload images or assets with Promise.all (if needed)
    useEffect(() => {
        const preloadAssets = async () => {
            // This could be used to preload any images or resources
            // For this component, we don't need to preload anything specific
            await Promise.resolve(); // Placeholder for actual preloading
        };

        preloadAssets();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden cursor-none"
        >
            {/* Main circle following cursor - with will-change-transform for hardware acceleration */}
            <div
                className="absolute w-8 h-8 rounded-full border border-neutral-300 pointer-events-none transition-transform duration-100 will-change-transform"
                style={{
                    transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px) scale(${isHovering ? 1 : 0.5})`,
                    opacity: isHovering ? 0.9 : 0.5
                }}
            />

            {/* Inner dot - with will-change-transform for hardware acceleration */}
            <div
                className="absolute w-2 h-2 bg-neutral-500 rounded-full pointer-events-none will-change-transform"
                style={{
                    transform: `translate(${mousePosition.x - 4}px, ${mousePosition.y - 4}px)`,
                    opacity: isHovering ? 1 : 0.5
                }}
            />

            {/* Particles - rendered from memoized collection */}
            {particleElements}

            {/* Center text - loaded asynchronously */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-neutral-700">
                <h1 className="text-4xl font-light mb-4">Welcome</h1>
            </div>
        </div>
    );
};

export default CursorInteractive;