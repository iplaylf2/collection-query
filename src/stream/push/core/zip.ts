import { Emitter } from "../emitter";
import { EmitForm, EmitType } from "../type";
import { Action } from "../../../type";

export function zip<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T[], Te>) {
  const zipCollector = new ZipCollector(emit);

  zipCollector.start(ee);

  return zipCollector.cancel.bind(zipCollector);
}

class ZipCollector<T, Te> {
  constructor(emit: EmitForm<T[], Te>) {
    this.emit = emit;
    this.cancelList = [];
  }

  start(ee: Emitter<T, Te>[]) {
    const linkedZip = new LinkedZip<T>(ee.length);

    let index = 0;
    for (const emitter of ee) {
      linkedZip.checkIn(index);

      const receiver = this.collect(index, linkedZip);
      const cancel = emitter.emit(receiver);

      this.cancelList.push(cancel);
    }
  }

  cancel() {
    for (const cancel of this.cancelList) {
      cancel();
    }
  }

  private collect(index: number, linkedZip: LinkedZip<T>): EmitForm<T, Te> {
    return (t, x?) => {
      switch (t) {
        case EmitType.Next:
          linkedZip = this.handleNext(index, linkedZip, x as T);
          break;
        case EmitType.Complete:
          this.handleComplete(linkedZip);
          break;
        case EmitType.Error:
          this.handleError(x as Te);
          break;
      }
    };
  }

  private handleNext(index: number, linkedZip: LinkedZip<T>, x: T) {
    const [full, content] = linkedZip.zip(index, x);
    if (full) {
      this.emit(EmitType.Next, content);
    }

    linkedZip = linkedZip.getNext();
    linkedZip.checkIn(index);

    if (linkedZip.broken) {
      this.cancelList[index]();

      if (linkedZip.isAllCheckIn()) {
        this.emit(EmitType.Complete);
      }
    }

    return linkedZip;
  }

  private handleComplete(linkedZip: LinkedZip<T>) {
    const [full, checkInList] = linkedZip.break();
    for (const index of checkInList) {
      this.cancelList[index]();
    }

    if (full) {
      this.emit(EmitType.Complete);
    }
  }

  private handleError(x: Te) {
    this.cancel();
    this.emit(EmitType.Error, x);
  }

  private emit: EmitForm<T[], Te>;

  private cancelList: Action<void>[];
}

class LinkedZip<T> {
  constructor(total: number) {
    this.total = total;
    this.checkInList = [];
    this.broken = false;
    this.zipContent = [];
    this.zipCount = 0;
  }

  checkIn(index: number) {
    this.checkInList.push(index);
  }

  zip(index: number, x: T): [boolean, T[]] {
    this.zipContent[index] = x;
    this.zipCount++;
    return [this.zipCount === this.total, this.zipContent];
  }

  getNext() {
    if (!this.next) {
      this.next = new LinkedZip(this.total);
    }

    return this.next;
  }

  isAllCheckIn() {
    return this.checkInList.length === this.total;
  }

  break(): [boolean, number[]] {
    this.broken = true;
    this.next = null!;

    return [this.isAllCheckIn(), this.checkInList];
  }

  broken: boolean;

  private readonly total: number;
  private readonly checkInList: number[];
  private readonly zipContent: T[];
  private zipCount!: number;
  private next!: LinkedZip<T>;
}
