class Calendar {
  #MS_IN_SEC = 1000;
  #SEC_IN_MIN = 60;
  #MIN_IN_HOUR = 60;
  #HOURS_IN_DAY = 24;
  #MS_IN_MIN = this.#SEC_IN_MIN * this.#MS_IN_SEC;
  #MS_IN_HOUR = this.#MIN_IN_HOUR * this.#MS_IN_MIN;
  #MS_IN_DAY = this.#HOURS_IN_DAY * this.#MS_IN_HOUR;
  #SERVER_TIME_ZONE = 0;
  #MONTH_IN_YEAR = 12;

  #constants = {
    weekDayCount: 7,
    monthCount: 12,
    calendarGridDayCount: 42,
  }

  #defaultLocale = {
    dayOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  }

  constructor(props) {
    this.clientInitDate = new Date();

    this.container =
        props.element === undefined
            ? document.querySelector('[data-calendar]')
            : typeof props.element === 'string'
                ? document.querySelector(props.element)
                : props.element;

    this.exceptions = props.exceptions;

    this.mode = props.mode !== undefined
        ? props.mode
        : 'dateSingle';

    this.startDate = typeof props.startDate === 'string' || typeof props.startDate === 'number'
        ? new Date(props.startDate)
        : typeof props.startDate === 'object' && props.startDate instanceof Date
            ? props.startDate
            : this.clientStartDate;

    this.autoSelectFirstDate = props.autoSelectFirstDate !== undefined
        ? props.autoSelectFirstDate
        : false;

    this.autoSelectFirstTime = props.autoSelectFirstTime !== undefined
        ? props.autoSelectFirstTime
        : false;

    this.timeGap = props.timeGap !== undefined
        ? props.timeGap * this.#MS_IN_SEC
        : false;

    this.showOtherMonthsDays = props.showOtherMonthsDays !== undefined
        ? props.showOtherMonthsDays
        : true;


    this.localization = props.localization;

    this.tz = props.tz || 0;

    this.timeFormat = props.timeFormat || '24';

    this.preventPastMonthNavigation = props.preventPastMonthNavigation;
    this.disableExpiredDates = props.disableExpiredDates;
    this.intlDateFormat = props.intlDateFormat;

    this.firstStartDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth());

    this.daysSlotsElements = [];
    this.timeSlotsElements = [];
    this.schedule = {};

    console.log(this);
    console.log(this.mode);
  }

  modeMap = {
    dateSingle: () => {
      this.daySlotsContainer.addEventListener('click', this.daySingleHandler);
      this.currentDate.effect(this.daySingleEffect, {firstCall: false});
      this.daySelection.effect(this.daySingleEffect, {firstCall: false});
    },
    dateRange: () => {
      this.daySlotsContainer.addEventListener('click', this.dayRangeHandler);
      this.currentDate.effect(this.dayRangeEffect, {firstCall: false});
      this.daySelection.effect(this.dayRangeEffect, {firstCall: false});
    },
    timeSingle: () => {
      this.createChosenState();

      this.modeMap.dateSingle();
      this.daySelection.effect(this.chosenTimeEffect, {firstCall: false})

      this.commonTimeSlotCount = this.#MS_IN_DAY / this.timeGap;
      this.insertTimeContainer();
      this.createTimeSlots();

      this.createTimeSelectionsState();
      this.timeSelection.effect([
        this.timeSingleEffect,
        this.chosenTimeEffect
      ], {firstCall: false});

      this.timeContainer.addEventListener('click', this.timeSingeHandler);

      this.chosenTime.callEffects();
    },
    timeRange: () => {
      this.createChosenState();

      this.modeMap.dateSingle();
      this.daySelection.effect(this.chosenTimeRangeEffect, {firstCall: false})

      this.setTimeSlotsCount();
      this.insertTimeContainer();
      this.createTimeSlots();

      this.createTimeSelectionsState();
      this.timeSelection.effect([
        this.timeRangeEffect,
        this.chosenTimeRangeEffect
      ], {firstCall: false});

      this.timeContainer.addEventListener('click', this.timeRangeHandler);

      this.chosenTime.callEffects();
    },
  }

  exceptionsPrepareMap = {
    slots: () => {
      this.processSlotExceptions(this.exception);
      this.prepareSchedule();
    },
    generalSchedule: () => {
      const from = this.exception.from.split(':').reduce((time, cur, i) => {
        if (i === 0) {
          time += cur * this.#MS_IN_HOUR;
        } else if (i === 1) {
          time += cur * this.#MS_IN_MIN;
        }

        return time;
      }, 0);
      const to = this.exception.to.split(':').reduce((time, cur, i) => {
        if (i === 0) {
          time += cur * this.#MS_IN_HOUR;
        } else if (i === 1) {
          time += cur * this.#MS_IN_MIN;
        }

        return time;
      }, 0);

      this.generalSchedule = {
        from: from,
        to: to
      };
    }
  }

  postFillUpDayMap = {
    slots: () => {
      this.exceptionSlots();
    }
  }

  init = () => {

    this.setExceptions();

    this.createCalendar();
    this.setEvents();

    this.createCurrentDateState();
    this.createDaySelectionState();

    this.currentDate.callEffects();
    this.daySelection.callEffects();

    this.modeMap[this.mode]();



    console.log(this.daysSlotsElements);
    console.log(this.timeSlotsElements);

    return this;
  }

  setExceptions = () => {
    if (this.exceptions === undefined || this.exceptions.length === 0) return;


    for (let i = 0; i < this.exceptions.length; i++) {
      if (this.exceptions[i].prefer) {
        this.exception = this.exceptions[i];

        this.exceptionsPrepareMap[this.exception.name]();

        return;
      }
    }
  }

  createCalendar = () => {
    this.container.classList.add('ssn-calendar-container');

    this.createContainers();
    this.renderMonthGrid();
    this.createDaysGrid();

    this.monthHeaderElement = this.container.querySelector('.month-header');

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
        : this.#defaultLocale.dayOfWeek;

    for (let i = 0; i < this.#constants.weekDayCount; i++) {
      dayNameElements += `<div class="day-name">${locale[i]}</div>`;
    }

    this.calendar.innerHTML = `
        <div class="month-wrapper">
            <div class="month-header-wrapper">
              <svg data-calendar-control="prev" class="calendar-arrow">
                <use href="#ssn-icon-arrow-left"></use>
              </svg>
              <h3 class="month-header"></h3>
    
              <svg data-calendar-control="next" class="calendar-arrow">
                <use href="#ssn-icon-arrow-right"></use>
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

    for (let i = 0; i < this.#constants.calendarGridDayCount; i++) {
      const daySlot = document.createElement('div');
      daySlot.classList.add('day');
      daySlot.dayCount = i % this.#constants.weekDayCount;

      this.daysSlotsElements.push(daySlot);
      this.daySlotsContainer.append(daySlot);
    }
  }

  createChosenState = () => {
    this.chosenTime = ref(null, {type: 'setter'});
  }

  createCurrentDateState = () => {
    const fullYear = this.startDate.getFullYear();
    const month = this.startDate.getMonth();

    this.currentDate = ref(new Date(fullYear, month));

    this.currentDate.effect([
      this.fillUpMonthHeaderEffect,
      this.fillUpDaySlotElementsEffect,
    ], {firstCall: false});

    if (this.disableExpiredDates) {
      this.currentDate.effect(this.setExpiredDatesEffect, {firstCall: false});
    }

    if (this.preventPastMonthNavigation) {
      this.currentDate.effect(this.prevMonthButtonVisibilityControlEffect, {firstCall: false});
    }

    this.currentDate.effect([
      this.setDayGridStylesEffect
    ], {firstCall: false});
  }

  createDaySelectionState = () => {
    this.daySelection = ref([]);
  }

  createTimeSelectionsState = () => {
    this.timeSelection = ref([]);
  }

  setEvents = () => {
    this.prevMontButton = this.container.querySelector('[data-calendar-control="prev"]');
    this.prevMontButton.addEventListener('click', this.setPrevMonth);

    this.nextMontButton = this.container.querySelector('[data-calendar-control="next"]');
    this.nextMontButton.addEventListener('click', this.setNextMonth);
  }

  fillUpDaySlotElementsEffect = () => {
    const currentLocalDate = this.currentDate.value;
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
      if ((foundFirstDayOfMonth || foundFirstDayOfMonth === 0) && lastDayOfMonth >= localDate.getTime()) {
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

    if ( this.exception &&  this.postFillUpDayMap[this.exception.name]) this.postFillUpDayMap[this.exception.name]();
  }

  exceptionSlots = () => {
    /*test*/
    this.schedule[2025][5][28].length = 0;
    /*test*/

    this.daysSlotsElements.forEach((daySlot) => {
      if (daySlot.date === null) return;

      const fullYear = daySlot.date.getFullYear();
      const month = daySlot.date.getMonth();
      const day = daySlot.date.getDate() - 1;

      if (this.schedule[fullYear][month][day].length === 0) {
        daySlot.disable = true
      }
    })
  }

  fillUpMonthHeaderEffect = () => {
    const currentLocalDate = this.currentDate.value;

    this.monthHeaderElement.textContent = `${this.#defaultLocale.monthNames[currentLocalDate.getMonth()]}, ${currentLocalDate.getFullYear()}`;
  }

  setDayGridStylesEffect = () => {
    const month = this.currentDate.value.getMonth();
    const year = this.currentDate.value.getFullYear();

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

  setPrevMonth = () => {
    const currentYear = this.currentDate.value.getFullYear();
    const currentMonth = this.currentDate.value.getMonth();

    const prevDate = new Date(currentYear, currentMonth - 1);

    if (this.preventPastMonthNavigation && prevDate < this.firstStartDate) return;

    this.currentDate.value = prevDate;
  }

  setNextMonth = () => {
    const currentYear = this.currentDate.value.getFullYear();
    const currentMonth = this.currentDate.value.getMonth();

    this.currentDate.value = new Date(currentYear, currentMonth + 1);
  }

  prevMonthButtonVisibilityControlEffect = () => {
    this.firstStartDate.getTime() === this.currentDate.value.getTime()
        ? this.prevMontButton.classList.add('disable')
        : this.prevMontButton.classList.remove('disable');
  }

  daySingleHandler = (e) => {
    const daySlot = e.target;

    if (daySlot.disable || daySlot === this.daySlotsContainer) return;

    if (daySlot.date.getTime() !== this.daySelection.value[0]?.getTime()) {
      this.daySelection.value[0] = daySlot.date
    } else {
      this.daySelection.value.length = 0;
    }

    const selectedDaySlotMonth = daySlot.date.getMonth();
    const currentMonth = this.currentDate.value.getMonth();

    if (selectedDaySlotMonth !== currentMonth) {
      this.currentDate.value = new Date(daySlot.date.getFullYear(), selectedDaySlotMonth);
    }
  }

  daySingleEffect = () => {
    const localValue = this.daySelection.value;

    this.daysSlotsElements.forEach((daySlot) => {
      daySlot.classList.remove('selected');

      if (localValue.length > 0 && daySlot.date?.getTime() === localValue[0].getTime()) {
        daySlot.classList.add('selected');
      }
    })
  }

  dayRangeHandler = (e) => {
    const daySlot = e.target;

    if (daySlot.disable || daySlot === this.daySlotsContainer) return;


    if (this.daySelection.value.length === 0) {

      this.daySelection.value[0] = daySlot.date;

    } else if (this.daySelection.value.length === 1) {

      const currentSelectionInitTime = this.daySelection.value[0].getTime();

      if (currentSelectionInitTime < daySlot.date.getTime()) {
        this.daySelection.value[1] = daySlot.date;
      } else {
        this.daySelection.value[1] = this.daySelection.value[0];
        this.daySelection.value[0] = daySlot.date;
      }

      if (this.exception !== undefined && this.isDayRangeWithGaps()) {
        this.daySelection.value[0] = daySlot.date;
        this.daySelection.value.length = 1;
      }


    } else if (this.daySelection.value.length > 1) {

      this.daySelection.value.length = 0;
      this.daySelection.value[0] = daySlot.date;
    }
  }

  isDayRangeWithGaps = () => {
    console.log('Check day gaps');

    const startDate = this.daySelection.value[0];
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const startDay = startDate.getDate() - 1;

    const endDate = this.daySelection.value[1];
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    const endDay = endDate.getDate() - 1;

    const yearDeference = endYear - startYear;

    for (let i = 0; i <= yearDeference; i++) {

      const initMonth = i + startYear === startYear ? startMonth : 0;
      const lastMonth = i + startYear === endYear ? endMonth : this.#MONTH_IN_YEAR;

      for (let j = initMonth; j <= lastMonth; j++) {

        const initDay = i + startYear === startYear && j === startMonth ? startDay : 0;
        const lastDay = i + endYear === endYear && j === endMonth ? endDay : this.schedule[startYear + i][j].length;

        for (let k = initDay; k < lastDay; k++) {
          if (this.schedule[startYear + i][j][k].length === 0) return true
        }
      }
    }

    return false;
  }

  dayRangeEffect = (value) => {
    if (this.daySelection.value.length === 0) {

      this.daysSlotsElements.forEach((daySlot) => {
        daySlot.classList.remove('selected');
      })

    } else if (this.daySelection.value.length === 1) {

      const currentSelectionInitTime = this.daySelection.value[0].getTime();
      this.daysSlotsElements.forEach((daySlot) => {
        if (daySlot.date.getTime() === currentSelectionInitTime) {
          daySlot.classList.add('selected');
        } else {
          daySlot.classList.remove('selected');
        }
        daySlot.classList.remove('selected-in-range');
      })

    } else if (this.daySelection.value.length === 2) {
      const currentSelectionInitTime = this.daySelection.value[0].getTime();
      const currentSelectionEndTime = this.daySelection.value[1].getTime();

      this.daysSlotsElements.forEach((daySlot) => {
        daySlot.classList.remove('selected', 'selected-in-range');

        const daySlotTime = daySlot.date.getTime();

        if (currentSelectionInitTime === daySlotTime || currentSelectionEndTime === daySlotTime) {
          daySlot.classList.add('selected');
        } else if (currentSelectionInitTime < daySlotTime && currentSelectionEndTime > daySlotTime) {
          daySlot.classList.add('selected-in-range');
        }
      })
    }
  }

  setExpiredDatesEffect = () => {
    this.daysSlotsElements.forEach((daySlot) => {

      if (daySlot.date === null || daySlot.date.getTime() < this.clientCurrentDate.getTime()) daySlot.disable = true;
    })
  }

  insertTimeContainer = () => {
    this.calendar.append(this.timeContainer)
  }

  createTimeSlots = () => {
    this.timeSlotsElements.length = 0;
    this.timeContainer.innerHTML = '';

    const initTime = this.exception?.name === 'generalSchedule' ? this.generalSchedule.from : 0;

    for (let timeSlotCount = 0; timeSlotCount < this.commonTimeSlotCount; timeSlotCount++) {
      const timeSlot = document.createElement('div');
      timeSlot.classList.add('time');

      const slotTime = initTime + timeSlotCount * this.timeGap;
      const slotTimeTotalMin = slotTime / this.#MS_IN_SEC / this.#SEC_IN_MIN;
      const slotTimeHours = slotTimeTotalMin / this.#MIN_IN_HOUR | 0;
      const slotTimeMin = slotTimeTotalMin % this.#MIN_IN_HOUR | 0;

      const slotTimeHoursFormated = slotTimeHours.toString().padStart(2, '0');
      const slotTimeMinFormated = slotTimeMin.toString().padStart(2, '0');

      if (this.timeFormat === '24') {
        timeSlot.textContent = `${slotTimeHoursFormated}:${slotTimeMinFormated}`;
      } else if (this.timeFormat === '12') {
        const ampm = (slotTimeHoursFormated / 12 | 0) > 0 ? 'PM' : 'AM';

        timeSlot.textContent = `${slotTimeHoursFormated > 12 ? slotTimeHoursFormated % 12 : slotTimeHoursFormated }:${slotTimeMinFormated} ${ampm}`;
      }

      timeSlot.time = slotTime;
      timeSlot.disable = false;

      this.timeContainer.append(timeSlot);
      this.timeSlotsElements.push(timeSlot);
    }
  }

  removeTimeContainer = () => {
    this.timeContainer.remove();
  }

  timeSingeHandler = (e) => {
    const timeSlot = e.target;

    if (timeSlot.disable || timeSlot === this.timeContainer) return;

    if (timeSlot.time !== this.timeSelection.value[0]) {
      this.timeSelection.value[0] = timeSlot.time
    } else {
      this.timeSelection.value.length = 0;
    }
  }

  timeSingleEffect = () => {
    this.timeSlotsElements.forEach((timeSlot) => {
      if (timeSlot.time === this.timeSelection.value[0]) {
        timeSlot.classList.add('selected');
      } else {
        timeSlot.classList.remove('selected');
      }
    })
  }

  timeRangeHandler = (e) => {
    const timeSlot = e.target;

    if (timeSlot.disable || timeSlot === this.timeContainer) return;


    if (this.timeSelection.value.length === 0) {

      this.timeSelection.value[0] = timeSlot.time;

    } else if (this.timeSelection.value.length === 1) {

      const currentSelectionInitTime = this.timeSelection.value[0];

      if (currentSelectionInitTime < timeSlot.time) {
        this.timeSelection.value[1] = timeSlot.time;
      } else {

        this.timeSelection.value[1] = this.timeSelection.value[0];
        this.timeSelection.value[0] = timeSlot.time;
      }

    } else if (this.timeSelection.value.length > 1) {

      this.timeSelection.value.length = 0;
      this.timeSelection.value[0] = timeSlot.time;
    }
  }

  timeRangeEffect = (value) => {

    if (this.timeSelection.value.length === 0) {

      this.timeSlotsElements.forEach((timeSlot) => {
        timeSlot.classList.remove('selected');
      })

    } else if (this.timeSelection.value.length === 1) {

      const currentSelectionInitTime = value[0];
      this.timeSlotsElements.forEach((timeSlot) => {
        if (timeSlot.time === currentSelectionInitTime) {
          timeSlot.classList.add('selected');
        } else {
          timeSlot.classList.remove('selected');
        }
        timeSlot.classList.remove('selected-in-range');
      })

    } else if (this.timeSelection.value.length === 2) {
      const currentSelectionInitTime = value[0];
      const currentSelectionEndTime = value[1];

      this.timeSlotsElements.forEach((timeSlot) => {
        timeSlot.classList.remove('selected', 'selected-in-range');

        const daySlotTime = timeSlot.time;
        if (currentSelectionInitTime === daySlotTime || currentSelectionEndTime === daySlotTime) {
          timeSlot.classList.add('selected');
        } else if (currentSelectionInitTime < daySlotTime && currentSelectionEndTime > daySlotTime) {
          timeSlot.classList.add('selected-in-range');
        }
      })
    }
  }

  chosenTimeEffect = () => {
    if (this.daySelection.value[0] === undefined || this.timeSelection.value[0] === undefined) return;

    this.chosenTime.value = this.daySelection.value[0].getTime() + this.timeSelection.value[0];
  }

  chosenTimeRangeEffect = () => {
    if (this.daySelection.value[0] === undefined || this.timeSelection.value[0] === undefined) return;

    const startTime = new Date(this.daySelection.value[0].getTime() + this.timeSelection.value[0]);
    const endTime = this.timeSelection.value[1]
        ? new Date(this.daySelection.value[0].getTime() + this.timeSelection.value[1])
        : null;

    this.chosenTime.value = [startTime, endTime];
  }

  processSlotExceptions = (slots) => {
    if (this.slots === undefined) {
      this.slots = [];
    }

    this.slots.push(...slots.list
        .split('')
        .map(a => parseInt(a, 16).toString(2).padStart(4, '0'))
        .join('')
        .slice(1)
        .split('')
        .map(a => +a));

    if (this.slotsFrom === undefined) {
      this.slotsFrom = new Date(this.processDateFromServer(slots.from));
    }

    this.slotTo = new Date(this.processDateFromServer(slots.to));
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

  prepareYearStructure = () => {
    const localYear = this.firstStartDate.getFullYear();

    if (this.schedule[localYear] !== undefined) return;

    this.schedule[localYear] = this.schedule[localYear] ?? Array.from({length: 12}, () => null);

    this.schedule[localYear] = this.schedule[localYear].map((month, i) => {

      return Array.from({length: new Date(localYear, i + 1, 0).getDate()}, () => []);

    })

  }

  prepareSchedule = () => {
    const slotsStartTime = this.slotsFrom.getTime();

    this.slots.forEach((slot, i) => {

      const localFrom = (slotsStartTime + i * this.timeGap);
      const localDateFromObject = new Date(localFrom);
      const localCurrentYear = localDateFromObject.getFullYear();
      const localCurrentMonth = localDateFromObject.getMonth();
      const localCurrentDate = localDateFromObject.getDate() - 1;

      this.prepareYearStructure(localCurrentYear);

      this.schedule[localCurrentYear][localCurrentMonth][localCurrentDate].push({
        from: localDateFromObject,
        to: new Date(localFrom + this.timeGap),
        active: !!slot
      });
    })
  }

  setTimeSlotsCount = () => {
    if (this.exception?.name === 'generalSchedule') {
      this.commonTimeSlotCount = (this.generalSchedule.to - this.generalSchedule.from) / this.timeGap;
    } else {
      this.commonTimeSlotCount = this.#MS_IN_DAY / this.timeGap;
    }
  }

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



