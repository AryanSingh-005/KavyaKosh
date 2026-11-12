import { useState, useEffect } from 'react';

/**
 * Returns live { days, hours, minutes, seconds } until the given deadline ISO string.
 * Returns null if deadline is null/undefined or already passed.
 */
function useCountdown(deadline) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline) { setTimeLeft(null); return; }

    const target = new Date(deadline).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}

export default useCountdown;
