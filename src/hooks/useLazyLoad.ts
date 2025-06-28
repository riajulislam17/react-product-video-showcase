import { useEffect, useRef, useState } from "react";

export function useLazyLoad<T extends HTMLElement>(): [
  React.RefObject<T>,
  boolean
] {
  const ref = useRef<T>(null);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}
