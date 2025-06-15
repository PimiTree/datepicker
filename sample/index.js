import {
  DatePicker
} from "../src/js/index.js";

const a = performance.now();

const calendarInstance = new DatePicker({
  // container: '[data-datepicker]',  // document.querySelector('[data-datepicker]'):def
  mode: "timeRange", // dateSingle:def, dateRange, timeSingle, timeRange
  // startDate: null,  // new Date(), timestamp, todayStart:def (ok)
  timeGap: 600, // seconds between time slots
  exceptions: [
    {
      name: 'HEXSlots',
      list: "0003ff7feffdffbff7fe001ffbff7feffdfffff8007feffdffbff7feffc003ff7feffdfffffbff000ffdffbff7feffdff8007feffdfffffbff7fe001ffbff7feffdffbff000ffdfffffbff7feffc003ff7feffdffbff7fe001fffffbff7feffdff8007feffdffbff7feffc003ffbff7feffdffbff000ffdffbff7feffdffc00",
      from: 1750032000,
      to: 1757894400
    },
    // {
    //   name: 'generalSchedule',
    //   from: '01:00',
    //   to: '16:00'
    // },
  ],
  autoSelectFirstDate: true, // true, false:def
  preventPastMonthNavigation: true, // true, false:def (ok)
  disableExpiredDates: false, // true, false:def (ok)
  disableExpiredTime: true, // true, false: def
  tz: 0, // number in range -12 - 12 (ok)
  showOtherMonthsDays: true, // false, true:def (ok)
  localization: {
    dayOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  },  // (ok)
  timeFormat: '12', // '12', '24':def (ok)v
  mondayIsFirstDayOfWeek: false // true, false
});

document.body.insertAdjacentHTML('beforeend', `<div>${(performance.now() - a).toFixed(2)} ms </div>`);

document.querySelector('#datepicker-hext-extend-data').addEventListener('click', () => {
  const a = performance.now();

  calendarInstance.extendHEXSlotsData({
    list: "79090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909",
    from: 1753218000,
    to: 1760994000,
    duration: 3600
  })
  document.body.insertAdjacentHTML('beforeend', `<div>${(performance.now() - a).toFixed(2)} ms </div>`);
  console.log(calendarInstance);
})