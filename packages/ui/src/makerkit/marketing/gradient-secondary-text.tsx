import { Slot, Slottable } from '@radix-ui/react-slot';

import { cn } from '../../lib/utils';

export const GradientSecondaryText: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & {
    asChild?: boolean;
  }
> = function GradientSecondaryTextComponent({ className, ...props }) {
  const Comp = props.asChild ? Slot : 'span';

  return (
    <Comp
      className={cn(
        'dark:from-foreground/60 dark:to-foreground text-secondary-foreground dark:bg-linear-to-r dark:bg-clip-text dark:text-transparent',
        className,
      )}
      {...props}
    >
      <Slottable>{props.children}</Slottable>
    </Comp>
  );
};
