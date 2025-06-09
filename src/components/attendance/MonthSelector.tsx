
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfYear, endOfYear } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  showFullYear: boolean;
  onFullYearChange: (fullYear: boolean) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
  showFullYear,
  onFullYearChange
}) => {
  const currentYear = new Date().getFullYear();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleValueChange = (value: string) => {
    if (value === 'full-year') {
      onFullYearChange(true);
    } else {
      onFullYearChange(false);
      const [year, month] = value.split('-');
      onMonthChange(new Date(parseInt(year), parseInt(month), 1));
    }
  };

  const getCurrentValue = () => {
    if (showFullYear) {
      return 'full-year';
    }
    return `${selectedMonth.getFullYear()}-${selectedMonth.getMonth()}`;
  };

  // Generate options for current year and previous year
  const generateOptions = () => {
    const options = [];
    
    // Add full year option
    options.push(
      <SelectItem key="full-year" value="full-year">
        Full Year {currentYear}
      </SelectItem>
    );

    // Add months for current year
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const value = `${currentYear}-${monthIndex}`;
      options.push(
        <SelectItem key={value} value={value}>
          {months[monthIndex]} {currentYear}
        </SelectItem>
      );
    }

    // Add months for previous year
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const value = `${currentYear - 1}-${monthIndex}`;
      options.push(
        <SelectItem key={value} value={value}>
          {months[monthIndex]} {currentYear - 1}
        </SelectItem>
      );
    }

    return options;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Period</label>
      <Select value={getCurrentValue()} onValueChange={handleValueChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {generateOptions()}
        </SelectContent>
      </Select>
    </div>
  );
};
