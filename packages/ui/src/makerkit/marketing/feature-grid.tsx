import React from 'react';

import { cn } from '../../lib/utils';

export const FeatureGrid: React.FC<React.HTMLAttributes<HTMLDivElement>> =
  function FeatureGridComponent({ className, children, ...props }) {
    return (
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-4 space-y-0 lg:grid-cols-3',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  };
