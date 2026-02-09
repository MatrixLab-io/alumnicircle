import { useState, useEffect } from 'react';

function getTimeLeft(targetDate) {
  const now = new Date();
  const target = targetDate?.toDate ? targetDate.toDate() : new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function EventCountdown({ startDate, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(startDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = getTimeLeft(startDate);
      if (!tl) {
        clearInterval(timer);
        setTimeLeft(null);
        return;
      }
      setTimeLeft(tl);
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  if (!timeLeft) return null;

  if (compact) {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(`${timeLeft.hours}h`);
    parts.push(`${timeLeft.minutes}m`);
    parts.push(`${timeLeft.seconds}s`);

    return (
      <span className="text-xs font-mono text-primary-600 dark:text-primary-400">
        {parts.join(' ')}
      </span>
    );
  }

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Sec', value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="bg-primary-100 dark:bg-primary-900/30 rounded-lg px-2 py-1 min-w-[2.5rem]">
            <span className="text-sm font-bold font-mono text-primary-700 dark:text-primary-300">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 block">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
