import { cn } from '../../lib/utils';
import { Button } from '../../shadcn/button';

export const CtaButton: React.FC<React.ComponentProps<typeof Button>> =
  function CtaButtonComponent({ className, children, ...props }) {
    return (
      <Button
        className={cn(
          'h-12 rounded-xl px-4 text-base font-semibold',
          className,
          {
            ['dark:shadow-primary/30 transition-all hover:shadow-2xl']:
              props.variant === 'default' || !props.variant,
          },
        )}
        asChild
        {...props}
      >
        {children}
      </Button>
    );
  };
