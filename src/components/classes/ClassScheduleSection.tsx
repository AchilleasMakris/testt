
import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CreateOnlineClassForm } from './types';

interface ClassScheduleSectionProps {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setValue: UseFormSetValue<CreateOnlineClassForm>;
  watch: UseFormWatch<CreateOnlineClassForm>;
}

export const ClassScheduleSection: React.FC<ClassScheduleSectionProps> = ({
  startDate,
  setStartDate,
  setValue,
  watch,
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
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-blue-600" />
        <Label className="text-base font-medium text-blue-900">Class Schedule *</Label>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Class Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Start Time *</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="start_hour" className="text-xs text-gray-600">Hour</Label>
              <Select onValueChange={(value) => setValue('start_hour', value)}>
                <SelectTrigger className="mt-1 bg-white">
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
              <Label htmlFor="start_minute" className="text-xs text-gray-600">Minutes</Label>
              <Select onValueChange={(value) => setValue('start_minute', value)}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Minutes" />
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
              <Label htmlFor="start_period" className="text-xs text-gray-600">AM/PM</Label>
              <Select onValueChange={(value) => setValue('start_period', value)}>
                <SelectTrigger className="mt-1 bg-white">
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

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">End Time (Optional)</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="end_hour" className="text-xs text-gray-600">Hour</Label>
              <Select onValueChange={(value) => setValue('end_hour', value)}>
                <SelectTrigger className="mt-1 bg-white">
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
              <Label htmlFor="end_minute" className="text-xs text-gray-600">Minutes</Label>
              <Select onValueChange={(value) => setValue('end_minute', value)}>
                <SelectTrigger className="mt-1 bg-white">
                  <SelectValue placeholder="Minutes" />
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
              <Label htmlFor="end_period" className="text-xs text-gray-600">AM/PM</Label>
              <Select onValueChange={(value) => setValue('end_period', value)}>
                <SelectTrigger className="mt-1 bg-white">
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
      </div>
      
      <p className="text-xs text-blue-600 mt-2">
        Set the date and time for this class session. End time is optional.
      </p>
    </div>
  );
};
