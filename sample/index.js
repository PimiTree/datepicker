// const a = performance.now();

const calendarInstance = new Datepicker({
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
      from: '08:00',
      to: '24:00'
    }
  ],
  // autoSelectFirstDate: true, // true, false:def
  // autoSelectFirstTime: true, // true, false:def <=> mode:timeSingle, timeRange
  // preventPastMonthNavigation: true, // true, false:def (ok)
  // disableExpiredDates: true, // true, false:def (ok)
  // tz: 0,
  // showOtherMonthsDays: false, // false, true:def
 /* localization: {
    dayOfWeek: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  },*/
  // timeFormat: '12' // '12', '24':def
}).init();

// document.body.insertAdjacentHTML('beforeend', `<div>${performance.now() - a}</div>`)