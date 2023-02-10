import { addDays, endOfDay, getISODay } from 'date-fns';

enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

// ! Recursive
const findNextWednesday = (date: Date): Date => {
  const isoDayOfWeek = getISODay(date);

  if (isoDayOfWeek === DayOfWeek.Wednesday) {
    return endOfDay(date);
  }

  return findNextWednesday(addDays(date, 1));
};

export default findNextWednesday;
