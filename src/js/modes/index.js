// Created by PimiTree https://github.com/PimiTree/datepicker

import {
  ref
} from "../reactivity";

export function datepickerModesPatch(props) {

  this.mode = props.mode != null
      ? props.mode
      : 'dateSingle';

  this.timeGap =
      props.timeGap != null
      && props.timeGap >= this.MIN_TIME_GAP_SEC
      && props.timeGap <= this.MAX_TIME_GAP_SEC
          ? props.timeGap * this.MS_IN_SEC
          : false;

  /* Date modes */
  this.setDateMode = (handler, viewEffect) => {
    this.autoSelectFirstDate = props.autoSelectFirstDate != null
        ? props.autoSelectFirstDate
        : false;

    this.daySlotsContainer.addEventListener('click', handler);

    this.currentMonthDate.effect(viewEffect, {firstCall: false});

    this.daySelection = ref([]);
    this.daySelection.effect(viewEffect);
  }
  this.daySingleHandler = (e) => {
    const daySlot = e.target;

    if (daySlot.disable || daySlot === this.daySlotsContainer) return;

    if (daySlot.date.getTime() !== this.daySelection.value[0]?.getTime()) {
      this.daySelection.value[0] = daySlot.date
    } else {
      this.daySelection.value.length = 0;
    }

    const selectedDaySlotMonth = daySlot.date.getMonth();
    const currentMonth = this.currentMonthDate.value.getMonth();

    if (selectedDaySlotMonth !== currentMonth) {
      this.currentMonthDate.value = new Date(daySlot.date.getFullYear(), selectedDaySlotMonth);
    }
  }
  this.dayRangeHandler = (e) => {
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
  this.daySingleViewEffect = () => {
    const localValue = this.daySelection.value;

    this.daysSlotsElements.forEach((daySlot) => {
      daySlot.classList.remove('selected');

      if (localValue.length > 0 && daySlot.date?.getTime() === localValue[0].getTime()) {
        daySlot.classList.add('selected');
      }
    })
  }
  this.dayRangeViewEffect = () => {
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
  this.isDayRangeWithGaps = () => {
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
      const lastMonth = i + startYear === endYear ? endMonth : this.MONTH_IN_YEAR;

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
  /* Date modes end*/

  /* Time modes */
  this.setTimeMode = (timeEffect, selectionEffects, timeHandler) => {
    this.autoSelectFirstTime = props.autoSelectFirstTime != null
        ? props.autoSelectFirstTime
        : false;

    this.chosenTime = ref(null, {type: 'setter'});

    this.modeMap.dateSingle();
    this.daySelection.effect(timeEffect, {firstCall: false});

    this.setTimeSlotsCount();
    this.calendar.append(this.timeContainer);
    this.createTimeSlotElements();

    this.timeSelection = ref([]);
    this.timeSelection.effect(selectionEffects, {firstCall: false});

    this.timeContainer.addEventListener('click', timeHandler);
  }
  this.timeSingeHandler = (e) => {
    const timeSlot = e.target;

    if (timeSlot.disable || timeSlot === this.timeContainer) return;

    if (timeSlot.time !== this.timeSelection.value[0]) {
      this.timeSelection.value[0] = timeSlot.time
    } else {
      this.timeSelection.value.length = 0;
    }
  }
  this.timeRangeHandler = (e) => {
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
  this.timeSingleEffect = () => {
    this.timeSlotsElements.forEach((timeSlot) => {
      if (timeSlot.time === this.timeSelection.value[0]) {
        timeSlot.classList.add('selected');
      } else {
        timeSlot.classList.remove('selected');
      }
    })
  }
  this.timeRangeEffect = (value) => {

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
  this.chosenTimeSingleEffect = () => {
    if (this.daySelection.value[0] === undefined || this.timeSelection.value[0] === undefined) return;

    this.chosenTime.value = this.daySelection.value[0].getTime() + this.timeSelection.value[0];
  }
  this.chosenTimeRangeEffect = () => {
    if (this.daySelection.value[0] === undefined || this.timeSelection.value[0] === undefined) return;

    const startTime = new Date(this.daySelection.value[0].getTime() + this.timeSelection.value[0]);
    const endTime = this.timeSelection.value[1]
        ? new Date(this.daySelection.value[0].getTime() + this.timeSelection.value[1])
        : null;

    this.chosenTime.value = [startTime, endTime];
  }
  this.createTimeSlotElements = () => {
    this.timeSlotsElements.length = 0;
    this.timeContainer.innerHTML = '';

    // generalSchedule exception
    const initTime = this.exception?.name === 'generalSchedule' ? this.generalSchedule.from : 0;

    for (let timeSlotCount = 0; timeSlotCount < this.commonTimeSlotCount; timeSlotCount++) {
      const timeSlot = document.createElement('div');
      timeSlot.classList.add('time');

      const slotTime = initTime + timeSlotCount * this.timeGap;
      const slotTimeTotalMin = slotTime / this.MS_IN_SEC / this.SEC_IN_MIN;
      const slotTimeHours = slotTimeTotalMin / this.MIN_IN_HOUR | 0;
      const slotTimeMin = slotTimeTotalMin % this.MIN_IN_HOUR | 0;

      const slotTimeHoursFormated = slotTimeHours.toString().padStart(2, '0');
      const slotTimeMinFormated = slotTimeMin.toString().padStart(2, '0');

      if (this.timeFormat === '24') {
        timeSlot.textContent = `${slotTimeHoursFormated}:${slotTimeMinFormated}`;
      } else if (this.timeFormat === '12') {
        const ampm = (slotTimeHoursFormated / 12 | 0) > 0 ? 'PM' : 'AM';

        timeSlot.textContent = `${slotTimeHoursFormated > 12 ? slotTimeHoursFormated % 12 : slotTimeHoursFormated}:${slotTimeMinFormated} ${ampm}`;
      }

      timeSlot.time = slotTime;
      timeSlot.disable = false;

      this.timeContainer.append(timeSlot);
      this.timeSlotsElements.push(timeSlot);
    }
  }
  this.setTimeSlotsCount = () => {
    if (this.exception?.name === 'generalSchedule') {
      this.commonTimeSlotCount = (this.generalSchedule.to - this.generalSchedule.from) / this.timeGap;
    } else {
      this.commonTimeSlotCount = this.MS_IN_DAY / this.timeGap;
    }
  }
  this.removeTimeContainer = () => {
    this.timeContainer.remove();
  }
  /* Time modes EMD*/

  this.modeMap = {
    dateSingle: () => {
      this.setDateMode(this.daySingleHandler, this.daySingleViewEffect);
    },
    dateRange: () => {
      this.setDateMode(this.dayRangeHandler, this.dayRangeViewEffect);
    },
    timeSingle: () => {
      this.setTimeMode(
          this.chosenTimeSingleEffect,
          [
            this.timeSingleEffect,
            this.chosenTimeSingleEffect
          ],
          this.timeSingeHandler
      )
    },
    timeRange: () => {
      this.setTimeMode(
          this.chosenTimeRangeEffect,
          [
            this.timeRangeEffect,
            this.chosenTimeRangeEffect
          ],
          this.timeRangeHandler
      )
    },
  }

  this.afterInitSchelude.push(this.modeMap[this.mode]);
}