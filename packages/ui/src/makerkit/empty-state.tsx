import React from 'react';

import { cn } from '../lib/utils';
import { Button } from '../shadcn/button';

const EmptyStateHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => (
  <h3
    className={cn('text-2xl font-bold tracking-tight', className)}
    {...props}
  />
);
EmptyStateHeading.displayName = 'EmptyStateHeading';

const EmptyStateText: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <p className={cn('text-muted-foreground text-sm', className)} {...props} />
);
EmptyStateText.displayName = 'EmptyStateText';

const EmptyStateButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Button>
> = ({ className, ...props }) => (
  <Button className={cn('mt-4', className)} {...props} />
);

EmptyStateButton.displayName = 'EmptyStateButton';

const EmptyState: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);

  const heading = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyStateHeading,
  );

  const text = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyStateText,
  );

  const button = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === EmptyStateButton,
  );

  const cmps = [EmptyStateHeading, EmptyStateText, EmptyStateButton];

  const otherChildren = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      !cmps.includes(child.type as (typeof cmps)[number]),
  );

  return (
    <div
      className={cn(
        'flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-xs',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-center gap-1 text-center">
        {heading}
        {text}
        {button}
        {otherChildren}
      </div>
    </div>
  );
};
EmptyState.displayName = 'EmptyState';

export { EmptyState, EmptyStateHeading, EmptyStateText, EmptyStateButton };
