import { Emitter, EmitForm, EmitType } from "../type";
import { Action } from "../../../type";

export function zip<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T[], Te>) {
  if (ee.length === 0) {
    emit(EmitType.Complete);
    return () => {};
  }

  const zip_collector = new ZipCollector(ee, emit);

  zip_collector.start();

  return zip_collector.cancel.bind(zip_collector);
}

class ZipCollector<T, Te> {
  constructor(ee: Emitter<T, Te>[], emit: EmitForm<T[], Te>) {
    this.ee = ee;
    this.emit = emit;
    this.cancelList = [];
  }

  start() {
    const linked_zip = new LinkedZip<T>(this.ee.length);

    let index = 0;
    for (const emitter of this.ee) {
      linked_zip.checkIn(index);

      const receiver = this.collect(index, linked_zip);
      const cancel = emitter(receiver);

      this.cancelList.push(cancel);
      index++;
    }
  }

  cancel() {
    for (const cancel of this.cancelList) {
      cancel();
    }
  }

  private collect(index: number, linked_zip: LinkedZip<T>): EmitForm<T, Te> {
    return (t, x?) => {
      switch (t) {
        case EmitType.Next:
          linked_zip = this.handleNext(index, linked_zip, x as T);
          break;
        case EmitType.Complete:
          this.handleComplete(linked_zip);
          break;
        case EmitType.Error:
          this.handleError(x as Te);
          break;
      }
    };
  }

  private handleNext(index: number, linked_zip: LinkedZip<T>, x: T) {
    const [full, content] = linked_zip.zip(index, x);
    if (full) {
      this.emit(EmitType.Next, content);
    }

    linked_zip = linked_zip.getNext();
    linked_zip.checkIn(index);

    if (linked_zip.broken) {
      this.cancelList[index]();

      if (linked_zip.isAllCheckIn()) {
        this.emit(EmitType.Complete);
      }
    }

    return linked_zip;
  }

  private handleComplete(linked_zip: LinkedZip<T>) {
    const [full, check_in_list] = linked_zip.break();
    for (const index of check_in_list) {
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

  private readonly ee: Emitter<T, Te>[];
  private readonly cancelList: Action<void>[];
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
