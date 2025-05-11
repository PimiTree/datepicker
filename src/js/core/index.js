// Created by PimiTree https://github.com/PimiTree/datepicker

import {
  ref
} from "../reactivity"


export class DatepickerCore {
  MS_IN_SEC = 1000;
  SEC_IN_MIN = 60;
  MIN_IN_HOUR = 60;
  HOURS_IN_DAY = 24;
  MS_IN_MIN = this.SEC_IN_MIN * this.MS_IN_SEC;
  MS_IN_HOUR = this.MIN_IN_HOUR * this.MS_IN_MIN;
  MS_IN_DAY = this.HOURS_IN_DAY * this.MS_IN_HOUR;
  SEC_IN_DAY = this.MS_IN_DAY / this.MS_IN_SEC;
  MONTH_IN_YEAR = 12;
  MIN_TIME_GAP_SEC = 10 * this.SEC_IN_MIN; // 10 minutes in seconds
  MAX_TIME_GAP_SEC = this.SEC_IN_DAY;

  constants = {
    weekDayCount: 7,
    monthCount: 12,
    calendarGridDayCount: 42,
  }

  defaultLocale = {
    dayOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }

  constructor(props) {
    this.clientInitDate = new Date();

    this.container =
        props.container == null
            ? document.querySelector('[data-calendar]')
            : typeof props.container === 'string'
                ? document.querySelector(props.container)
                : props.container;

    this.startDate =
        typeof props.startDate === 'string' || typeof props.startDate === 'number'
            ? new Date(props.startDate)
            : typeof props.startDate === 'object' && props.startDate instanceof Date
                ? props.startDate
                : this.clientStartDate;

    this.showOtherMonthsDays =
        props.showOtherMonthsDays != null
            ? props.showOtherMonthsDays
            : true;

    this.timeFormat =
        props.timeFormat === '12' || props.timeFormat === '12'
            ? props.timeFormat
            : '24';


    this.localization = props.localization;
    this.preventPastMonthNavigation = props.preventPastMonthNavigation;
    this.disableExpiredDates = props.disableExpiredDates;
    this.mondayIsFirstDayOfWeek = props.mondayIsFirstDayOfWeek;

    this.tz = props.tz || 0;

    this.firstStartDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth());

    this.daysSlotsElements = [];
    this.timeSlotsElements = [];

    this.beforeInitLifecyclePool = [];
    this.afterInitLifecyclePool = [];
    this.afterFillUpDaySlotElementsLifecyclePool = [];
  }

  init = () => {

    this.beforeInitLifecyclePool.length > 0 && this.beforeCoreInit()

    /* Core init*/
    this.container.classList.add('ssn-calendar-container');

    this.createCalendar();
    this.setEvents();

    this.createCurrentMonthDateState();
    this.currentMonthDate.callEffects();
    /* Core init END*/


    this.afterInitLifecyclePool.length > 0 && this.afterCoreInit();

    return this;
  }

  createCalendar = () => {
    this.container.classList.add('ssn-calendar-container');

    this.createContainers();
    this.renderMonthGrid();
    this.createDaysGrid();

    this.monthHeaderElement = this.container.querySelector('.month-header');

  }

  setEvents = () => {
    this.prevMontButton = this.container.querySelector('[data-calendar-control="prev"]');
    this.prevMontButton.addEventListener('click', this.setPrevMonth);

    this.nextMontButton = this.container.querySelector('[data-calendar-control="next"]');
    this.nextMontButton.addEventListener('click', this.setNextMonth);
  }

  createCurrentMonthDateState = () => {
    const fullYear = this.startDate.getFullYear();
    const month = this.startDate.getMonth();

    this.currentMonthDate = ref(new Date(fullYear, month));

    this.currentMonthDate.effect([
      this.fillUpMonthHeaderEffect,
      this.fillUpDaySlotElementsEffect,
    ], {firstCall: false});

    if (this.disableExpiredDates) {
      this.currentMonthDate.effect(this.setExpiredDatesEffect, {firstCall: false});
    }

    if (this.preventPastMonthNavigation) {
      this.currentMonthDate.effect(this.prevMonthButtonVisibilityControlEffect, {firstCall: false});
    }

    this.currentMonthDate.effect([
      this.setDayGridViewEffect
    ], {firstCall: false});
  }

  createContainers = () => {
    this.timeContainer = document.createElement('div');
    this.timeContainer.classList.add('time-container');

    this.calendar = document.createElement('div');
    this.calendar.classList.add('ssn-calendar');
  }

  renderMonthGrid = () => {
    let dayNameElements = '';

    const locale = this.localization && this.localization.dayOfWeek
        ? this.localization.dayOfWeek
        : this.defaultLocale.dayOfWeek;

    for (let i = 0; i < this.constants.weekDayCount; i++) {
      dayNameElements += `<div class="day-name">${locale[i]}</div>`;
    }

    this.calendar.innerHTML = `
        <div class="month-wrapper">
            <div class="month-header-wrapper">
              <svg data-calendar-control="prev" class="calendar-arrow"  viewBox="0 0 10 16" fill="none">
                 <path d="M10 0.160001C7.66667 2.72 5.16667 7.04 4.33333 8C5.16667 8.96 7.66667 13.28 10 15.84L9.83333 16C7.5 13.44 0.333334 8.32 0 8C0.333334 7.68 7.5 2.56 9.83333 0L10 0.160001Z"
        fill="currentColor"/>
              </svg>
              <h3 class="month-header"></h3>
    
              <svg data-calendar-control="next" class="calendar-arrow" viewBox="0 0 6 10" fill="none">
                <path xmlns="http://www.w3.org/2000/svg" d="M0 9.9C1.4 8.3 2.9 5.6 3.4 5C2.9 4.4 1.4 1.7 0 0.1L0.1 0C1.5 1.6 5.8 4.8 6 5C5.8 5.2 1.5 8.4 0.1 10L0 9.9Z"
        fill="currentColor"/>
              </svg>
            </div>
            <div class="day-names-container"> ${dayNameElements}</div>
            <div class="days-container"></div>
        </div>`;

    this.container.append(this.calendar);

    this.daySlotsContainer = this.calendar.querySelector('.days-container');
  }

  createDaysGrid = () => {
    this.daysSlotsElements.length = 0;

    for (let i = 0; i < this.constants.calendarGridDayCount; i++) {
      const daySlot = document.createElement('div');
      daySlot.classList.add('day');
      daySlot.dayCount = i % this.constants.weekDayCount;

      this.daysSlotsElements.push(daySlot);
      this.daySlotsContainer.append(daySlot);
    }
  }

  setPrevMonth = () => {
    const currentYear = this.currentMonthDate.value.getFullYear();
    const currentMonth = this.currentMonthDate.value.getMonth();

    const prevDate = new Date(currentYear, currentMonth - 1);

    if (this.preventPastMonthNavigation && prevDate < this.firstStartDate) return;

    this.currentMonthDate.value = prevDate;
  }

  setNextMonth = () => {
    const currentYear = this.currentMonthDate.value.getFullYear();
    const currentMonth = this.currentMonthDate.value.getMonth();

    this.currentMonthDate.value = new Date(currentYear, currentMonth + 1);
  }

  setDayGridViewEffect = () => {
    const month = this.currentMonthDate.value.getMonth();
    const year = this.currentMonthDate.value.getFullYear();

    this.daysSlotsElements.forEach((daySlot) => {
      daySlot.classList.remove('disable', 'another-month', 'next-month', 'prev-month')

      if (!daySlot.date) {
        daySlot.classList.add('disable');
        return;
      }

      const localMonth = daySlot.date.getMonth();
      const localYear = daySlot.date.getFullYear();

      if (localMonth < month || localYear < year) {
        daySlot.classList.add('prev-month', 'another-month');
      }

      if (localMonth > month || localYear > year) {
        daySlot.classList.add('next-month', 'another-month');
      }

      if (daySlot.disable) {
        daySlot.classList.add('disable');
      }
    })
  }

  fillUpMonthHeaderEffect = () => {
    const currentLocalDate = this.currentMonthDate.value;

    this.monthHeaderElement.textContent = `${this.defaultLocale.monthNames[currentLocalDate.getMonth()]}, ${currentLocalDate.getFullYear()}`;
  }

  fillUpDaySlotElementsEffect = () => {
    const currentLocalDate = this.currentMonthDate.value;
    const fullYear = currentLocalDate.getFullYear();
    const month = currentLocalDate.getMonth();
    const dayOfWeek = currentLocalDate.getDay();
    const lastDayOfMonth = new Date(fullYear, month + 1, 0).getTime();

    this.daysSlotsElements.forEach((daySlot) => {
      daySlot.disable = false;
      daySlot.date = null;
      daySlot.textContent = '';
    })

    let foundFirstDayOfMonth = false;
    this.daysSlotsElements.forEach((daySlot, slotCount) => {
      if (!foundFirstDayOfMonth && daySlot.dayCount === dayOfWeek) {
        foundFirstDayOfMonth = daySlot.dayCount;
      }
      const gridDay = slotCount - foundFirstDayOfMonth + 1
      const localDate = new Date(fullYear, month, gridDay);
      if ((foundFirstDayOfMonth || foundFirstDayOfMonth === 0) && lastDayOfMonth >= localDate.getTime() || this.showOtherMonthsDays) {
        daySlot.textContent = localDate.getDate();
        daySlot.date = localDate;
      }
    })

    if (this.showOtherMonthsDays) {
      for (let i = 0; i < foundFirstDayOfMonth; i++) {
        const localDate = new Date(fullYear, month, i - foundFirstDayOfMonth + 1);

        this.daysSlotsElements[i].textContent = localDate.getDate();
        this.daysSlotsElements[i].date = localDate;

        if (this.preventPastMonthNavigation && this.daysSlotsElements[i].date.getTime() < this.firstStartDate.getTime()) {
          this.daysSlotsElements[i].disable = true;
        }

      }
    }

    // life cycle pool call
    this.afterFillUpDaySlotElementsLifecyclePool.length > 0 && this.afterFillUpDaySlot();
  }

  prevMonthButtonVisibilityControlEffect = () => {
    this.firstStartDate.getTime() === this.currentMonthDate.value.getTime()
        ? this.prevMontButton.classList.add('disable')
        : this.prevMontButton.classList.remove('disable');
  }

  setExpiredDatesEffect = () => {
    this.daysSlotsElements.forEach((daySlot) => {

      if (daySlot.date === null || daySlot.date.getTime() < this.clientCurrentDate.getTime()) daySlot.disable = true;
    })
  }

  processDateFromServer = (ts) => {
    return this.convertCurrentTimezoneOffset(ts * 1000, this.tz, true);
  }

  processDateToServer = (date) => {
    return this.convertCurrentTimezoneOffset(date.getTime(), this.tz) / 1000;
  }

  convertCurrentTimezoneOffset = (timestamp, toTimezoneOffset, reverse) => {
    const fromTimezoneOffset = new Date().getTimezoneOffset();
    const offsetDifference = ((toTimezoneOffset * 60) + fromTimezoneOffset) * 60 * 1000;

    return timestamp - (reverse ? -offsetDifference : offsetDifference);
  }

  /*Hooks*/
  beforeCoreInit = () => {
    this.beforeInitLifecyclePool.forEach((hook) => {
      hook(this);
    })
  }

  afterCoreInit = () => {
    this.afterInitLifecyclePool.forEach((hook) => {
      hook(this);
    })
  }

  afterFillUpDaySlot = () => {
    this.afterFillUpDaySlotElementsLifecyclePool.forEach((hook) => {
      hook(this);
    })
  }

  /*Hooks end*/


  get clientStartDate() {
    return new Date(this.clientInitDate.getFullYear(), this.clientInitDate.getMonth(), this.clientInitDate.getDate());
  }

  get clientCurrentDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  get clientMonth() {
    return this.clientInitDate.getMonth();
  }

}



