import {
  DatepickerCore
} from "./core";
import {
  datepickerModesPatch
} from "./modes";
import {
  datepickerExceptionsPatch
} from "./exeption";

export class DatePicker {
  constructor(props) {
    const core = new DatepickerCore(props);

    datepickerModesPatch.call(core, props);

    if (props.exceptions != null && props.exceptions.length > 0) {
      datepickerExceptionsPatch.call(core, props);
    }

    core.init();

    return core;
  }
}