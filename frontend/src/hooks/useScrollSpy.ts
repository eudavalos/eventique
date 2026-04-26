import { useState, useEffect } from 'react';

export function useScrollSpy(sectionIds: string[], offset = 80): string {
  const [active, setActive] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + offset;
      let current = sectionIds[0] ?? '';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          current = id;
        }
      }
      setActive(current);
    };

    window.addEventListener('scroll', handler, { passive: true });
    handler();
    return () => window.removeEventListener('scroll', handler);
  }, [sectionIds, offset]);

  return active;
}
