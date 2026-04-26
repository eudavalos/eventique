import { useState, useEffect, useCallback } from 'react';
import { getCountdown } from '../lib/utils';

interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

export function useCountdown(targetDate: string): CountdownValues {
  const calculate = useCallback(() => getCountdown(targetDate), [targetDate]);
  const [values, setValues] = useState<CountdownValues>(calculate);

  useEffect(() => {
    if (values.expired) return;
    const id = setInterval(() => {
      const next = calculate();
      setValues(next);
      if (next.expired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [calculate, values.expired]);

  return values;
}
