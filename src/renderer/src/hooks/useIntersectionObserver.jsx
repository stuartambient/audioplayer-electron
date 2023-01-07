import React from 'react';

export default function useIntersectionObserver(
  rootRef,
  targetRef,
  onIntersectCallback
) {
  React.useEffect(() => {
    if (rootRef.current && targetRef.current) {
      const interceptConfig = {
        root: rootRef.current,
        rootMargin: '0px',
        threshold: 0.1,
      };

      const observer = new IntersectionObserver(entries => {
        if (entries.every(entry => entry.isIntersecting)) {
          onIntersectCallback();
        }
      }, interceptConfig);

      observer.observe(targetRef.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [rootRef.current, targetRef.current]);
}
