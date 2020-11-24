import { Action } from "../../type";

interface GetCancel {
  (): undefined | Action<void>;
}

export class PreCancel {
  constructor(get_cancel: GetCancel) {
    this.getCancel = get_cancel;
    this._isCancelEarly = false;
  }

  cancel() {
    const cancel = this.getCancel();
    if (cancel) {
      cancel();
    } else {
      this._isCancelEarly = true;
    }
  }

  tryCancel() {
    if (this._isCancelEarly) {
      this.getCancel!();
    }
  }

  private getCancel: GetCancel;
  private _isCancelEarly: boolean;
}
