import React, { useEffect, useRef, useState } from 'react';

/**
 * Lightweight Intersection Observer hook.
 * Returns [ref, isVisible]. Once visible, stays visible (fires once).
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  threshold = 0.15
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // fire once
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}
