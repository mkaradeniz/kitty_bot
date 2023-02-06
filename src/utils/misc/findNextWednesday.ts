import { addDays, endOfDay, getISODay } from 'date-fns';

// Types
import { DayOfWeek } from '../../types';

// Recursive!
const findNextWednesday = (date: Date): Date => {
  const isoDayOfWeek = getISODay(date);

  if (isoDayOfWeek === DayOfWeek.Wednesday) {
    return endOfDay(date);
  }

  return findNextWednesday(addDays(date, 1));
};

export default findNextWednesday;
