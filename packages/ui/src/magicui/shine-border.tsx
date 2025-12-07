'use client';

import { useEffect, useRef } from 'react';

import { cn } from '../lib/utils';

interface ShineBorderProps {
  /**
   * Array of colors for the shine effect
   * @default ["#A07CFE", "#FE8FB5", "#FFBE7B"]
   */
  shineColor?: string[];
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Border radius of the shine border
   * @default 12
   */
  borderRadius?: number;
  /**
   * Width of the border
   * @default 2
   */
  borderWidth?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function ShineBorder({
  shineColor = ['#A07CFE', '#FE8FB5', '#FFBE7B'],
  duration = 14,
  borderRadius = 12,
  borderWidth = 2,
  className,
}: ShineBorderProps) {
  const borderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = borderRef.current;
    if (!element) return;

    let angle = 0;
    let animationId: number;

    const animate = () => {
      angle = (angle + 360 / (duration * 60)) % 360;
      const gradientColors = [
        shineColor[0],
        shineColor[1] ?? shineColor[0],
        shineColor[2] ?? shineColor[0],
        shineColor[1] ?? shineColor[0],
        shineColor[0],
      ].join(', ');

      element.style.background = `conic-gradient(from ${angle}deg, ${gradientColors})`;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [shineColor, duration]);

  return (
    <div
      ref={borderRef}
      className={cn(
        'pointer-events-none absolute inset-0',
        className,
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
        WebkitMask: `
          linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0)
        `,
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    />
  );
}
