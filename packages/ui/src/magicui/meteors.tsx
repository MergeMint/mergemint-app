'use client';

import { useEffect, useState } from 'react';

import { cn } from '../lib/utils';

interface MeteorsProps {
  number?: number;
  className?: string;
}

export const Meteors = ({ number = 20, className }: MeteorsProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate random positions for meteors
  // Start above the container (-20% to -5%) so they slide in from the top
  const meteors = Array.from({ length: number }, (_, idx) => ({
    id: idx,
    left: `${Math.random() * 100}%`,
    top: `${-20 + Math.random() * 15}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${Math.random() * 3 + 2}s`,
  }));

  return (
    <>
      {meteors.map((meteor) => (
        <span
          key={meteor.id}
          className={cn(
            'pointer-events-none absolute h-0.5 w-0.5 rotate-[35deg] animate-meteor rounded-full bg-purple-400',
            'before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-1/2 before:bg-gradient-to-r before:from-purple-400 before:to-transparent before:content-[""]',
            className,
          )}
          style={{
            left: meteor.left,
            top: meteor.top,
            animationDelay: meteor.animationDelay,
            animationDuration: meteor.animationDuration,
          }}
        />
      ))}
    </>
  );
};

