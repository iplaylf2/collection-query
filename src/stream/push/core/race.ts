import { Emitter } from "../emitter";
import { EmitForm, EmitType } from "../type";
import { Action } from "../../../type";

export function race<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T, Te>) {
  if (ee.length === 0) {
    emit(EmitType.Complete);
    return;
  }

  const raceDispatch = new RaceDispatch(ee, emit);

  raceDispatch.start();

  return raceDispatch.cancel.bind(raceDispatch);
}

class RaceDispatch<T, Te> {
  constructor(ee: Emitter<T, Te>[], emit: EmitForm<T, Te>) {
    this.ee = ee;
    this.emit = emit;
    this.cancelList = [];
    this.count = this.ee.length;
  }

  start() {
    for (const emitter of this.ee) {
      const receiver = this.join.bind(this);
      const cancel = emitter.emit(receiver);

      this.cancelList.push(cancel);
    }
  }

  cancel() {
    for (const cancel of this.cancelList) {
      cancel();
    }
  }

  private join(t: EmitType, x?: T | Te) {
    switch (t) {
      case EmitType.Next:
        this.handleNext(x as T);
        break;
      case EmitType.Complete:
        this.handleComplete();
        break;
      case EmitType.Error:
        this.handleError(x as Te);
        break;
    }
  }

  private handleNext(x: T) {
    this.emit(EmitType.Next, x);
  }

  private handleComplete() {
    this.count--;
    if (this.count === 0) {
      this.emit(EmitType.Complete);
    }
  }

  private handleError(x: Te) {
    this.cancel();
    this.emit(EmitType.Error, x);
  }

  private emit: EmitForm<T, Te>;

  private readonly ee: Emitter<T, Te>[];
  private readonly cancelList: Action<void>[];
  private count: number;
}
