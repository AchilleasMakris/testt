
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSelectorProps {
  label: string;
  hourValue?: string;
  minuteValue?: string;
  periodValue?: string;
  onHourChange: (value: string) => void;
  onMinuteChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
  required?: boolean;
}

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  hourValue,
  minuteValue,
  periodValue,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
  required = false,
}) => {
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return { value: hour.toString(), label: hour.toString() };
  });

  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    return { value: i.toString().padStart(2, '0'), label: i.toString().padStart(2, '0') };
  });

  const periodOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];

  return (
    <div>
      <Label className={`text-sm font-medium text-gray-700 mb-2 block ${required ? 'after:content-["*"] after:text-red-500' : ''}`}>
        {label}
      </Label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs text-gray-600">Hour</Label>
          <Select value={hourValue} onValueChange={onHourChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {hourOptions.map((hour) => (
                <SelectItem key={hour.value} value={hour.value}>
                  {hour.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-600">Minutes</Label>
          <Select value={minuteValue} onValueChange={onMinuteChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {minuteOptions.map((minute) => (
                <SelectItem key={minute.value} value={minute.value}>
                  {minute.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-600">AM/PM</Label>
          <Select value={periodValue} onValueChange={onPeriodChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
