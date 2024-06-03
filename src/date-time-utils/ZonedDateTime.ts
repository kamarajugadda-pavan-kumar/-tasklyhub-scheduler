import { DateTime } from "luxon";

class ZonedDateTime {
  private year: number;
  private month: number;
  private day: number;
  private hour: number;
  private minute: number;
  private zone: string;
  private dateTime: DateTime;

  constructor(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    zone: string
  ) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.zone = zone;
    this.dateTime = DateTime.fromObject(
      {
        year,
        month,
        day,
        hour,
        minute,
      },
      { zone }
    );
  }

  getDateTime(): DateTime {
    return this.dateTime;
  }

  getZone(): string {
    return this.zone;
  }

  getUTCString(): string {
    return this.dateTime.toUTC().toString();
  }
}

export default ZonedDateTime;
