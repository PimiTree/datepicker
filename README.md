# Datepicker

## Init

#### Template 

```HTML
<div data-calendar> or <div class="ssn-calendar-container">
```

```ecmascript 6
new DatepickerCore();

new DatepickerCore({container: 'ssn-calendar-container'});
```

## Options


### container `selector | HTMLElement | null`
Set datepicker container element.

`default: document.querySelector('[data-calendar]')`

### mode `'dateSingle' | 'dateRange' | 'timeSingle' | 'timeRange'`
Choose picking mode and time picker availability.

`default: dateSingle`

### startDate `Date object, timestamp: Number, string: Date string`
Set initial month and year of 

`default: current client month`

### timeGap `int`
`required mode: 'timeSingle' | 'timeRange` 
Number seconds from 600 sec until 86_400 sec. 

`default: false`

### autoSelectFirstDate `boolean`
For any mode type, choose the first available date slot.

`default: false`

### autoSelectFirstTime `boolean`
`required mode: 'timeSingle' | 'timeRange`
Choose first available time slot.

`default: false`

### preventPastMonthNavigation `boolean`
Block navigation to the month less than the current month.

`default: false`

### disableExpiredDates `boolean`
Disable all date slots being in the past of current day.

`default: false`

### showOtherMonthsDays `boolean`
Let's datepicker to fill up the days of previous and next month.

`default: false`


### localization `Object`
```ecmascript 6
{
 dayOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
 monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}
```
Override default datepicker localization.
Day of weeks name and month names must be the same as above.
Notice! Datepicker don't support RTL. 

### timeFormat `12 | 24`
#### `required mode: 'timesingle' | 'timeRange'`
Set time slots time format.

`default: 24`


### tz `number in range -12 - 12 `
Used to transform dates from external sources and for external sources.

`default: 0`

## Live cycle hooks 

### Hooks pools:
- `beforeInitSchelude`
- `afterInitSchelude`
- `afterFillUpDaySlotElementsSchedule`

Hook pool is just a plain array of functions called at certain time of Datepicker run phase.

#### Use hooks pools 
```ecmascript 6
this.beforeInitSchelude.push((datepickerInstance) => {
  console.log('Some action');
})
```

##  Exceptions
Group of filters to control availability day and time slots.
The exceptions are not work together the only one can be applied at once. Current exception type has chosen by first element of `exceptions: []`.

### HEXSlots exception
#### `reqired: timeGap != null`
#### `reqired: timeGap != null`
```ecmascript 6
exceptions: [
    {
      name: 'HEXSlots',
      list: "89090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909090909000009090909090000090909090900000909",
      from: 1745366400,
      to: 1753218000
    }
]
```
HEXSlots exception takes from-to range for dates availability control. The `list` parameter is the HEXa decimal representation of continuous time slots in order `from + timeGap * currentSlot`. 

### generalSchedule `object`
#### `required mode: timeSingle | timeRange`
```ecmascript 6
exceptions: [
    {
      name: 'generalSchedule',
      from: '08:00',
      to: '24:00',
    }
]
```
Set the general available time range. 


## Soon:
1.  `autoSelectFirstDate`
2.  `autoSelectFirstTime`
3. Option `disableExpiredDates` must set the `preventPastMonthNavigation` to true by default.
4. The Exception `name: HEXSlots` responsibility have to be only in date range from-to. Not apply disability to days-times slots elements in out of range.
