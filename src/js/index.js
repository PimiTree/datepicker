import {
  DatepickerCore
} from "./core/index.js";
import {
  datepickerModesPatch
} from "./modes/index.js";
import {
  datepickerExceptionsPatch
} from "./exeption/index.js";

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