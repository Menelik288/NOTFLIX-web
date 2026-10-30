import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

export const CustomCursor = () => {
    const { currentMedia, currentRoute } = useApp();
    const dotRef = useRef(null);
    const circleRef = useRef(null);
    const requestRef = useRef(null);
    
    // Store positions as refs to avoid re-renders
    const mousePos = useRef({ x: -100, y: -100 });
    const circlePos = useRef({ x: -100, y: -100 });
    
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const checkIsDetailsRoute = (route) => {
        if (!route) return false;
        const clean = route.replace(/^#/, '').split('?')[0];
        return (
            clean.startsWith('/details/') ||
            clean.startsWith('/movie/') ||
            clean.startsWith('/tv/') ||
            clean.startsWith('/anime/') ||
            clean.startsWith('/watch/') ||
            route.includes('/details/') ||
            route.includes('/movie/') ||
            route.includes('/tv/') ||
            route.includes('/anime/') ||
            route.includes('/watch/')
        );
    };

    const isDetailsPage = 
        checkIsDetailsRoute(currentRoute) ||
        (typeof window !== 'undefined' && (
            checkIsDetailsRoute(window.location.pathname) ||
            checkIsDetailsRoute(window.location.hash) ||
            document.body.getAttribute('data-default-cursor') === 'true'
        ));

    const isPlayerOpen = !!currentMedia;
    const shouldHide = isDetailsPage || isPlayerOpen;

    // Toggle a body attribute so CSS can restore the default cursor
    useEffect(() => {
        if (shouldHide) {
            document.body.setAttribute('data-default-cursor', 'true');
        } else {
            const isStillDetails = typeof window !== 'undefined' && (
                checkIsDetailsRoute(window.location.pathname) || 
                checkIsDetailsRoute(window.location.hash)
            );
            if (!isStillDetails) {
                document.body.removeAttribute('data-default-cursor');
            }
        }
        return () => {
            const isStillDetails = typeof window !== 'undefined' && (
                checkIsDetailsRoute(window.location.pathname) || 
                checkIsDetailsRoute(window.location.hash)
            );
            if (!isStillDetails) {
                document.body.removeAttribute('data-default-cursor');
            }
        };
    }, [shouldHide, currentRoute]);

    useEffect(() => {
        // Only run on non-touch devices and when cursor should be active
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return;
        if (shouldHide) return;

        const onMouseMove = (e) => {
            if (!isVisible) setIsVisible(true);
            mousePos.current.x = e.clientX;
            mousePos.current.y = e.clientY;
        };

        const onMouseOver = (e) => {
            const target = e.target;
            const isInteractive = target?.closest?.('button, a, input, select, textarea, .group, .premium-hover, [role="button"], [role="link"], label, .cursor-pointer');
            setIsHovering(!!isInteractive);
        };

        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);

        document.addEventListener('mousemove', onMouseMove, true);
        document.addEventListener('mouseover', onMouseOver, true);
        document.body.addEventListener('mouseleave', onMouseLeave);
        document.body.addEventListener('mouseenter', onMouseEnter);

        const updateCursor = () => {
            circlePos.current.x += (mousePos.current.x - circlePos.current.x) * 0.15;
            circlePos.current.y += (mousePos.current.y - circlePos.current.y) * 0.15;

            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
            }
            if (circleRef.current) {
                circleRef.current.style.transform = `translate3d(${circlePos.current.x}px, ${circlePos.current.y}px, 0)`;
            }

            requestRef.current = requestAnimationFrame(updateCursor);
        };
        
        requestRef.current = requestAnimationFrame(updateCursor);

        return () => {
            document.removeEventListener('mousemove', onMouseMove, true);
            document.removeEventListener('mouseover', onMouseOver, true);
            document.body.removeEventListener('mouseleave', onMouseLeave);
            document.body.removeEventListener('mouseenter', onMouseEnter);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isVisible, shouldHide]);

    // Render nothing if on mobile/touch device or if cursor should be hidden (details page or player open)
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        return null;
    }

    if (shouldHide) {
        return null;
    }

    return (
        <div 
            className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" 
            style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}
        >
            {/* Outer Circle */}
            <div ref={circleRef} className="absolute top-0 left-0 will-change-transform">
                <div 
                    className={`-ml-[16px] -mt-[16px] w-8 h-8 rounded-full border-2 transition-all duration-300 ease-out flex items-center justify-center
                        ${isHovering 
                            ? 'scale-[1.25] border-red-500 bg-red-600/10 shadow-[0_0_15px_rgba(229,9,20,0.5)]' 
                            : 'scale-100 border-red-600/70 bg-transparent'
                        }
                    `}
                ></div>
            </div>
            
            {/* Inner Dot */}
            <div ref={dotRef} className="absolute top-0 left-0 will-change-transform">
                <div 
                    className={`-ml-[4px] -mt-[4px] w-2 h-2 rounded-full transition-all duration-300
                        ${isHovering ? 'bg-red-500 scale-100 shadow-[0_0_15px_rgba(229,9,20,0.8)]' : 'bg-red-600 scale-100 shadow-[0_0_10px_rgba(229,9,20,0.8)]'}
                    `}
                ></div>
            </div>
        </div>
    );
};

export default CustomCursor;
