'use client';

import * as React from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';

import { cn } from '@kit/ui/utils';

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};
import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@kit/ui/popover';

export type DatePreset = {
  label: string;
  days: number;
};

const DEFAULT_PRESETS: DatePreset[] = [
  { label: 'This week', days: 7 },
  { label: 'Last 2 weeks', days: 14 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
  { label: '6 Months', days: 180 },
  { label: '1 Year', days: 365 },
];

export type DateRangeValue =
  | { type: 'preset'; days: number }
  | { type: 'custom'; from: Date; to: Date };

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  presets?: DatePreset[];
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [customRange, setCustomRange] = React.useState<DateRange | undefined>(
    value.type === 'custom'
      ? { from: value.from, to: value.to }
      : undefined
  );

  const getDisplayText = () => {
    if (value.type === 'preset') {
      const preset = presets.find((p) => p.days === value.days);
      return preset?.label ?? `Last ${value.days} days`;
    }
    return `${format(value.from, 'MMM d, yyyy')} - ${format(value.to, 'MMM d, yyyy')}`;
  };

  const handlePresetSelect = (days: number) => {
    onChange({ type: 'preset', days });
    setShowCalendar(false);
    setOpen(false);
  };

  const handleCustomApply = () => {
    if (customRange?.from && customRange?.to) {
      onChange({
        type: 'custom',
        from: startOfDay(customRange.from),
        to: endOfDay(customRange.to),
      });
      setShowCalendar(false);
      setOpen(false);
    }
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setCustomRange(range);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[220px] justify-between text-left font-normal',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{getDisplayText()}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {!showCalendar ? (
          <div className="p-2">
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.days}
                  onClick={() => handlePresetSelect(preset.days)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                    value.type === 'preset' && value.days === preset.days && 'bg-accent'
                  )}
                >
                  <span>{preset.label}</span>
                  {value.type === 'preset' && value.days === preset.days && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
              <div className="my-2 border-t" />
              <button
                onClick={() => {
                  setShowCalendar(true);
                  if (value.type === 'custom') {
                    setCustomRange({ from: value.from, to: value.to });
                  } else {
                    setCustomRange({
                      from: subDays(new Date(), value.days),
                      to: new Date(),
                    });
                  }
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                  value.type === 'custom' && 'bg-accent'
                )}
              >
                <span>Custom range...</span>
                {value.type === 'custom' && <Check className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(false)}
              >
                ← Back
              </Button>
              <span className="text-sm font-medium">Select date range</span>
            </div>
            <Calendar
              mode="range"
              selected={customRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
              defaultMonth={customRange?.from ?? subDays(new Date(), 30)}
            />
            <div className="flex items-center justify-between border-t pt-3 mt-3">
              <div className="text-sm text-muted-foreground">
                {customRange?.from && customRange?.to ? (
                  <>
                    {format(customRange.from, 'MMM d')} - {format(customRange.to, 'MMM d, yyyy')}
                  </>
                ) : (
                  'Select start and end dates'
                )}
              </div>
              <Button
                size="sm"
                onClick={handleCustomApply}
                disabled={!customRange?.from || !customRange?.to}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Helper function to convert DateRangeValue to API parameters
export function getDateRangeParams(value: DateRangeValue): {
  days?: number;
  from?: string;
  to?: string;
} {
  if (value.type === 'preset') {
    return { days: value.days };
  }
  return {
    from: value.from.toISOString(),
    to: value.to.toISOString(),
  };
}

// Helper to create initial value from days
export function createPresetValue(days: number): DateRangeValue {
  return { type: 'preset', days };
}
