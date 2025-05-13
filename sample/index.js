import {
  DatePicker
} from "../src/js/index.js";

const a = performance.now();

const calendarInstance = new DatePicker({
  // container: '[data-datepicker]',  // document.querySelector('[data-datepicker]'):def
  mode: 'timeRange', // dateSingle:def, dateRange, timeSingle, timeRange
  // startDate: null,  // new Date(), timestamp, todayStart:def (ok)
  timeGap: 3600, // seconds between time slots
  exceptions: [
    {
      name: 'HEXSlots',
      list: "800000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000007e7e007e7e007e7e007e7e007e7e007000000000",
      from: 1746990000,
      to: 1754935200
    },
    {
      name: 'generalSchedule',
      from: '01:00',
      to: '10:00'
    },


  ],
  autoSelectFirstDate: false, // true, false:def
  autoSelectFirstTime: false, // true, false:def <=> mode:timeSingle, timeRange
  preventPastMonthNavigation: false, // true, false:def (ok)
  disableExpiredDates: false, // true, false:def (ok)
  tz: 0, // number in range -12 - 12 (ok)
  showOtherMonthsDays: true, // false, true:def (ok)
  localization: {
    dayOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  },  // (ok)
  timeFormat: '12', // '12', '24':def (ok)
  mondayIsFirstDayOfWeek: false // true, false
});

document.body.insertAdjacentHTML('beforeend', `<div>${(performance.now() - a).toFixed(2)} ms </div>`);

document.querySelector('#datepicker-hext-extend-data').addEventListener('click', () => {
  const a = performance.now();

  calendarInstance.extendHEXSlotsData({
    list: "89090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909",
    from: 1753218000,
    to: 1760994000,
    duration: 3600
  })
  document.body.insertAdjacentHTML('beforeend', `<div>${(performance.now() - a).toFixed(2)} ms </div>`);
  console.log(calendarInstance);
})