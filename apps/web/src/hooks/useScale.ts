import { useState, useEffect } from 'react';

export function useScale(designWidth: number = 800) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setScale(Math.min(w / designWidth, 1.5));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [designWidth]);

  return scale;
}
