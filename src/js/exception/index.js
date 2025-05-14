// Created by PimiTree https://github.com/PimiTree/datepicker

export function datepickerExceptionsPatch(props) {
  this.exceptions = props.exceptions;

  this.setExceptions = () => {
    this.exception = this.exceptions[0];

    this.exceptionsPrepareMap[this.exception.name]();
  }

  this.exceptionsPrepareMap = {
    HEXSlots: () => {
      this.schedule = {};

      this.exception.from *= 1000;
      this.exception.to *= 1000;

      this.processHEXtoBinSlotExceptions();
      this.prepareSchedule();

      this.daySlotElementsHEXSlotsPostProcessing = () => {
        this.daysSlotsElements.forEach((daySlot) => {
          if (daySlot.date == null) return;

          const fullYear = daySlot.date.getFullYear();
          const month = daySlot.date.getMonth();
          const day = daySlot.date.getDate();

          if (
              this.schedule[fullYear] === undefined
              || this.schedule[fullYear][month] === undefined
              || this.schedule[fullYear][month][day] === undefined
              || this.schedule[fullYear][month][day].length === 0
          ) {
            daySlot.disable = true
          }
        })

      }

      this.timeSlotElementsPostProcessing = () => {

        if (this.daySelection.value.length === 0) {
          this.timeContainer.innerHTML = '';
          return;
        }

        this.timeSlotElements.forEach((slotElement) => {
          const time = (this.daySelection.value[0].getTime() + slotElement.time);
          const date = new Date(time);
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();


         const timeSlot = this.schedule[year][month][day].find((timeSlot) => timeSlot.date.getTime() === time);

         if (timeSlot === undefined || timeSlot.disable) {
           slotElement.disable = true;
           slotElement.classList.add('disabled');
         }
        })
      }

      // add actions to life cycle pool
      this.afterFillUpDaySlotElementsLifecyclePool.push(this.daySlotElementsHEXSlotsPostProcessing);
      this.afterTimeSlotsRenderPool.push(this.timeSlotElementsPostProcessing);

      this.extendHEXSlotsData = (data) => {
        this.timeGap = data.duration * 1000;
        data.from *= 1000;
        data.to *= 1000;

        this.processHEXtoBinSlotExceptions(data);
        this.prepareSchedule();
      }
    },
    generalSchedule: () => {
      const from = this.exception.from.split(':').reduce((time, cur, i) => {
        if (i === 0) {
          time += cur * this.MS_IN_HOUR;
        } else if (i === 1) {
          time += cur * this.MS_IN_MIN;
        }

        return time;
      }, 0);
      const to = this.exception.to.split(':').reduce((time, cur, i) => {
        if (i === 0) {
          time += cur * this.MS_IN_HOUR;
        } else if (i === 1) {
          time += cur * this.MS_IN_MIN;
        }

        return time;
      }, 0);

      this.generalSchedule = {
        from: from,
        to: to
      };

      this.beforeTimeSlotsRenderPool.push(() => {
        this.timeSlotsinitTime = this.generalSchedule.from;
        this.commonTimeSlotCount = (this.generalSchedule.to - this.generalSchedule.from) / this.timeGap;
      });
    }
  }

  this.processHEXtoBinSlotExceptions = (slots) => {
    const HEXString = this.exception.list;

    if (this.slots === undefined) {
      this.slots = [];
    }
    this.slots[this.slots.length] = {
      from: this.exception.from,
      to: this.exception.to,
      slots: []
    };
    this.slots[this.slots.length - 1].slots.push(...HEXString
        .split('')
        .map(a => parseInt(a, 16).toString(2).padStart(4, '0'))
        .join('')
        .slice(1)
        .split('')
        .map(a => +a));
  }

  this.prepareSchedule = () => {
    this.slots.forEach((subslots) => {
      const from = new Date(subslots.from);
      const to = new Date(subslots.to);

      const fromYearSlots = from.getFullYear();
      const fromMonthSlots = from.getMonth();
      const fromDaySlots = from.getDate();
      const fromTimestamp = from.getTime();

      const toTimestamp = to.getTime();

      const dayDifference = Math.ceil((toTimestamp - fromTimestamp) / this.MS_IN_DAY);

      for (let day = 0; day <= dayDifference; day++) {
        const localDate = new Date(fromYearSlots, fromMonthSlots, fromDaySlots + day);
        const localYear = localDate.getFullYear();
        const localMonth = localDate.getMonth();
        const localDay = localDate.getDate();

        if (this.schedule[localYear] === undefined) this.schedule[localYear] = {};
        if (this.schedule[localYear][localMonth] === undefined) this.schedule[localYear][localMonth] = {};

        this.schedule[localYear][localMonth][localDay] = [];
      }

      subslots.slots.forEach((slot, i) => {
        const localFrom = (subslots.from + i * this.timeGap);
        const localDateFromObject = new Date(localFrom);
        const localCurrentYear = localDateFromObject.getFullYear();
        const localCurrentMonth = localDateFromObject.getMonth();
        const localCurrentDate = localDateFromObject.getDate();


        this.schedule[localCurrentYear][localCurrentMonth][localCurrentDate].push({
          date: localDateFromObject,
          disable: !slot
        });
      })

    })
  }

  // add actions to life cycle pool
  this.beforeInitLifecyclePool.push(this.setExceptions);
}