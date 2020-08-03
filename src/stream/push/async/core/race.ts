import { Emitter, EmitForm } from "../type";
import { Action } from "../../../../type";
import { EmitType, EmitItem } from "../../type";

export function race<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T, Te>) {
  if (ee.length === 0) {
    emit(EmitType.Complete);
    return () => {};
  }

  const race_dispatch = new RaceDispatch(ee, emit);

  race_dispatch.start();

  return race_dispatch.cancel.bind(race_dispatch);
}

class RaceDispatch<T, Te> {
  constructor(ee: Emitter<T, Te>[], emit: EmitForm<T, Te>) {
    this.ee = ee;
    this.emit = emit;
    this.cancel_list = [];
    this.count = this.ee.length;
  }

  start() {
    for (const emitter of this.ee) {
      const receiver = this.join.bind(this);
      const cancel = emitter(receiver);

      this.cancel_list.push(cancel);
    }
  }

  cancel() {
    for (const cancel of this.cancel_list) {
      cancel();
    }
  }

  private async join(...[t, x]: EmitItem<T, Te>) {
    switch (t) {
      case EmitType.Next:
        await this.handleNext(x as T);
        break;
      case EmitType.Complete:
        this.handleComplete();
        break;
      case EmitType.Error:
        this.handleError(x as Te);
        break;
    }
  }

  private async handleNext(x: T) {
    await this.emit(EmitType.Next, x);
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
  private readonly cancel_list: Action<void>[];
  private count: number;
}
