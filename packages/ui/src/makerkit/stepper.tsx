'use client';

import { Fragment, useCallback } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../lib/utils';
import { If } from './if';

type Variant = 'numbers' | 'default' | 'dots';

const classNameBuilder = getClassNameBuilder();

/**
 * Stepper component with optional per-step descriptions.
 */
export function Stepper(props: {
  steps: string[];
  description?: string[];
  currentStep: number;
  variant?: Variant;
}) {
  const variant = props.variant ?? 'default';

  const Steps = useCallback(() => {
    return props.steps.map((labelOrKey, index) => {
      const selected = props.currentStep === index;
      const complete = props.currentStep > index;

      const className = classNameBuilder({
        selected,
        variant,
        complete,
      });

      const isNumberVariant = variant === 'numbers';
      const isDotsVariant = variant === 'dots';

      const labelClassName = cn('leading-none', {
        ['px-1.5 py-2 text-xs font-semibold']: !isNumberVariant,
        ['hidden']: isDotsVariant,
      });

      const { label, number } = getStepLabel(labelOrKey, index);
      const description = props.description?.[index];

      return (
        <Fragment key={index}>
          <div aria-selected={selected} className={className}>
            <span className={labelClassName}>
              {number}
              <If condition={!isNumberVariant}>. {label}</If>
            </span>
            <If condition={Boolean(description && isNumberVariant)}>
              <span className="text-muted-foreground hidden text-xs sm:flex">
                {description}
              </span>
            </If>
          </div>

          <If condition={isNumberVariant}>
            <StepDivider selected={selected} complete={complete}>
              {label}
            </StepDivider>
          </If>
        </Fragment>
      );
    });
  }, [props.steps, props.currentStep, variant, props.description]);

  if (props.steps.length < 2) {
    return null;
  }

  const containerClassName = cn('w-full', {
    ['flex flex-col gap-1 md:flex-row md:items-start md:justify-between']: variant === 'numbers',
    ['flex space-x-0.5']: variant === 'default',
    ['flex gap-x-4 self-center']: variant === 'dots',
  });

  return (
    <div className={containerClassName}>
      <Steps />
    </div>
  );
}

function getClassNameBuilder() {
  return cva(``, {
    variants: {
      variant: {
        default: `flex h-[2.5px] w-full flex-col transition-all duration-500`,
        numbers:
          'flex h-9 w-full items-start gap-2 rounded-lg border px-3 py-2 text-sm font-medium',
        dots: 'bg-muted h-2.5 w-2.5 rounded-full transition-colors',
      },
      selected: {
        true: '',
        false: 'hidden sm:flex',
      },
      complete: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        selected: false,
        className: 'text-muted-foreground',
      },
      {
        variant: 'default',
        selected: true,
        className: 'bg-primary font-medium',
      },
      {
        variant: 'default',
        selected: false,
        complete: false,
        className: 'bg-muted',
      },
      {
        variant: 'default',
        selected: false,
        complete: true,
        className: 'bg-primary',
      },
      {
        variant: 'numbers',
        selected: false,
        complete: true,
        className: 'border-primary text-primary',
      },
      {
        variant: 'numbers',
        selected: true,
        className: 'border-primary bg-primary/10 text-primary',
      },
      {
        variant: 'numbers',
        selected: false,
        className: 'text-muted-foreground',
      },
      {
        variant: 'dots',
        selected: true,
        complete: true,
        className: 'bg-primary',
      },
      {
        variant: 'dots',
        selected: false,
        complete: true,
        className: 'bg-primary',
      },
      {
        variant: 'dots',
        selected: true,
        complete: false,
        className: 'bg-primary',
      },
      {
        variant: 'dots',
        selected: false,
        complete: false,
        className: 'bg-muted',
      },
    ],
    defaultVariants: {
      variant: 'default',
      selected: false,
    },
  });
}

function StepDivider({
  selected,
  complete,
  children,
}: React.PropsWithChildren<{
  selected: boolean;
  complete: boolean;
}>) {
  const spanClassName = cn('min-w-max text-sm font-medium', {
    ['text-muted-foreground hidden sm:flex']: !selected,
    ['text-secondary-foreground']: selected || complete,
    ['font-medium']: selected,
  });

  const className = cn(
    'flex h-9 flex-1 items-center justify-center last:flex-[0_0_0]' +
      ' group flex w-full items-center space-x-3 px-3',
  );

  return (
    <div className={className}>
      <span className={spanClassName}>{children}</span>

      <div
        className={cn('h-[3px] w-full rounded-full transition-colors', {
          ['bg-primary']: selected || complete,
          ['bg-muted']: !selected && !complete,
        })}
      />
    </div>
  );
}

function getStepLabel(labelOrKey: string, index: number) {
  return {
    label: labelOrKey,
    number: index + 1,
  };
}
