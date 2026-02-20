import { useState, useEffect } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

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

export default function EventCountdown({ eventDate, startDate, compact = false }) {
  const targetDate = eventDate || startDate;
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = getTimeLeft(targetDate);
      if (!tl) {
        clearInterval(timer);
        setTimeLeft(null);
        return;
      }
      setTimeLeft(tl);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
        <ClockIcon className="h-3.5 w-3.5 text-primary-500" />
        <div className="flex items-center gap-1 font-mono text-xs font-semibold">
          {timeLeft.days > 0 && (
            <span className="text-primary-700 dark:text-primary-300">{timeLeft.days}<span className="text-primary-400 dark:text-primary-500">d</span></span>
          )}
          <span className="text-primary-700 dark:text-primary-300">{String(timeLeft.hours).padStart(2, '0')}<span className="text-primary-400 dark:text-primary-500">h</span></span>
          <span className="text-primary-700 dark:text-primary-300">{String(timeLeft.minutes).padStart(2, '0')}<span className="text-primary-400 dark:text-primary-500">m</span></span>
          <span className="text-primary-700 dark:text-primary-300">{String(timeLeft.seconds).padStart(2, '0')}<span className="text-primary-400 dark:text-primary-500">s</span></span>
        </div>
      </div>
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
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-lg px-2.5 py-1.5 min-w-[2.75rem]">
              <span className="text-base font-bold font-mono text-primary-700 dark:text-primary-300">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1 block">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="text-primary-400 dark:text-primary-600 font-bold text-sm mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
