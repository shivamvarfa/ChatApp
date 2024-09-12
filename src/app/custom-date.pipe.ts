import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'customDate',
  standalone:true
})
export class CustomDatePipe implements PipeTransform {

  transform(value: Date | string | null, ...args: unknown[]): string {
    if (!value) return '';

    // Ensure value is converted to a Date object
    const date = this.toDate(value);
    if (!date) return '';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Determine date formatting based on conditions
    if (this.isSameDay(date, today)) {
      return `Today at ${formatDate(date, 'h:mm a', 'en-US')}`;
    } else if (this.isSameDay(date, yesterday)) {
      return `Yesterday at ${formatDate(date, 'h:mm a', 'en-US')}`;
    } else {
      // return formatDate(date, 'MMM d, y h:mm a', 'en-US');
      return ` ${formatDate(date, 'MMM d, y h:mm a', 'en-US')}`;
    }
  }

  private toDate(value: Date | string | null): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date; // Ensure the date is valid
    }
    return null;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }
}
