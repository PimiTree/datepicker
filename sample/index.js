import {
  DatepickerCore
} from "../src/js/core";
import {
  DatePicker
} from "../src/js";

const a = performance.now();

const calendarInstance = new DatePicker({
  // container: '[data-calendar]',  // document.querySelector('[data-calendar]'):def
  mode: 'timeRange', // dateSingle:def, dateRange, timeSingle, timeRange, dateRangeTimeStartEnd
  // startDate: null,  // new Date(), timestamp, todayStart:def (ok)
  timeGap: 3600, // seconds between time slots
  exceptions: [
    {
      name: 'HEXSlots',
      list: "89090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909",
      from: 1745366400,
      to: 1753218000
    },
    {
      name: 'generalSchedule',
      from: '01:00',
      to: '10:00'
    },
  ],
  autoSelectFirstDate: true, // true, false:def
  autoSelectFirstTime: true, // true, false:def <=> mode:timeSingle, timeRange
  preventPastMonthNavigation: true, // true, false:def (ok)
  disableExpiredDates: false, // true, false:def (ok)
  tz: 0, // number in range -12 - 12 (ok)
  showOtherMonthsDays: true, // false, true:def (ok)
  localization: {
    dayOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  },  // (ok)
  timeFormat: '12', // '12', '24':def (ok)
  mondayIsFirstDayOfWeek: false // true, false
});

document.body.insertAdjacentHTML('beforeend', `<div>${(performance.now() - a).toFixed(2)} ms </div>`)