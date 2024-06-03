import { DateTime, Interval } from "luxon";
import { repeatIntervalUnitType } from "../types";

const isValidDateFormat = (dateString: string, format: string): boolean => {
  try {
    const dt = DateTime.fromFormat(dateString, format);
    if (!dt.isValid) {
      throw new Error("Invalid date format");
    }
    return true;
  } catch (error) {
    return false;
  }
};

interface DateComponents {
  year: number;
  month: number;
  day: number;
}

const extractDateComponents = (
  dateString: string,
  format: string
): DateComponents => {
  const dt = DateTime.fromFormat(dateString, format);
  if (!dt.isValid) {
    throw new Error("Invalid date format");
  }
  return {
    year: dt.year,
    month: dt.month,
    day: dt.day,
  };
};

/**
 * @param timeString looks like "09:30 AM"
 */
interface TimeComponents {
  hour: number;
  minute: number;
  formattedTime: string;
}

const convertTo24HourFormat = (timeString: string): TimeComponents => {
  const time = DateTime.fromFormat(timeString, "h:mm a");
  if (!time.isValid) {
    throw new Error("Invalid time format");
  }
  const formattedTime = time.toFormat("HH:mm");
  const hour = parseInt(time.hour.toString().padStart(2, "0"));
  const minute = parseInt(time.minute.toString().padStart(2, "0"));
  return { hour, minute, formattedTime };
};

const calcMillisecsRepeatIntv = (
  repeatIntervalUnit: repeatIntervalUnitType,
  repeatIntervalNumber: number
): number => {
  const now = DateTime.utc(); // Get the current time in UTC
  const end = now.plus({ [repeatIntervalUnit]: repeatIntervalNumber }); // Calculate the end time

  // Create an interval between now and the calculated end time
  const interval = Interval.fromDateTimes(now, end);

  // Return the length of the interval in milliseconds
  return interval.length("milliseconds");
};

const generateUtcTimestampWithOffset = (
  utcTimestamp: string,
  milliseconds: number
): string => {
  const dt = DateTime.fromISO(utcTimestamp, { zone: "utc" });
  if (!dt.isValid) {
    throw new Error("Invalid UTC timestamp format");
  }
  const newDt = DateTime.fromMillis(dt.toMillis() + milliseconds, {
    zone: "utc",
  });
  return newDt.toUTC().toString();
};

export {
  isValidDateFormat,
  extractDateComponents,
  convertTo24HourFormat,
  calcMillisecsRepeatIntv,
  generateUtcTimestampWithOffset,
};
