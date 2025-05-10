// Created by PimiTree https://github.com/PimiTree/datepicker

export function datepickerExceptionsPatch(props) {

  this.exceptions = props.exceptions;



  /*Exception*/
  this.setExceptions = () => {
    this.exception = this.exceptions[0];

    this.exceptionsPrepareMap[this.exception.name]();

    if (this.exception.name === 'HEXSlots') {
      this.HEXSlots = () => {
        /*test*/
        this.schedule[2025][4][13].length = 0;
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
      this.afterFillUpDaySlotElementsSchedule.push(this.HEXSlots);
    }
  }

  this.exceptionsPrepareMap = {
    HEXSlots: () => {
      this.schedule = {};

      this.processHEXtoBinSlotExceptions(this.exception);
      this.prepareSchedule();
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
    }
  }

  this.processHEXtoBinSlotExceptions = (slots) => {
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

  this.prepareYearStructure = () => {
    const localYear = this.firstStartDate.getFullYear();

    if (this.schedule[localYear] !== undefined) return;

    this.schedule[localYear] = this.schedule[localYear] ?? Array.from({length: 12}, () => null);

    this.schedule[localYear] = this.schedule[localYear].map((month, i) => {

      return Array.from({length: new Date(localYear, i + 1, 0).getDate()}, () => []);

    })

  }

  this.prepareSchedule = () => {
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
  /*Exception END*/

  // add actions to life cycle pool
  this.beforeInitSchelude.push(this.setExceptions);






}