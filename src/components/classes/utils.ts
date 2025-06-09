
export const combineDateTime = (date: Date | undefined, hour: string, minute: string, period: string): string | null => {
  console.log('combineDateTime called with:', { date, hour, minute, period });
  
  if (!date || !hour || !minute || !period) {
    console.log('Missing required parameters for date/time combination');
    return null;
  }

  try {
    let hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);

    // Convert to 24-hour format
    if (period === 'PM' && hourNum !== 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }

    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hourNum, minuteNum, 0, 0);
    
    console.log('Combined date time:', combinedDateTime.toISOString());
    return combinedDateTime.toISOString();
  } catch (error) {
    console.error('Error combining date and time:', error);
    return null;
  }
};
