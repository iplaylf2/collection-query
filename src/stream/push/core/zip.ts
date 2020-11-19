import { Emitter, EmitForm, EmitType } from "../type";
import { Action } from "../../../type";

export function zip<T>(ee: Emitter<T, any>[], emit: EmitForm<T[], any>) {
  const total = ee.length;
  if (!(0 < total)) {
    emit(EmitType.Complete);
    return () => {};
  }

  const cancel_list = new Array<Action<void>>(total);

  const linked_zip_start = new LinkedZip<T>(total);

  let index = 0;
  for (const emitter of ee) {
    let linked_zip = linked_zip_start;

    linked_zip.checkIn(index);

    const _index = index;
    const cancel = emitter((t, x?) => {
      switch (t) {
        case EmitType.Next:
          {
            const [full, result] = linked_zip.zip(_index, x as T);
            if (full) {
              emit(EmitType.Next, result!);
            }

            const [status, next_linked] = linked_zip.getNext(_index);

            switch (status) {
              case LinkedZipStatus.Active:
                linked_zip = next_linked;
                break;
              case LinkedZipStatus.Broken:
                cancel_list[_index]();
                break;
              case LinkedZipStatus.Inactive:
                cancel_list[_index]();
                emit(EmitType.Complete);
                break;
            }
          }
          break;
        case EmitType.Complete:
          {
            const [full, check_in_list] = linked_zip.break();
            for (const i of check_in_list!) {
              cancel_list[i]();
            }

            if (full) {
              emit(EmitType.Complete);
            }
          }
          break;
        case EmitType.Error:
          cancel();
          emit(EmitType.Error, x);
          break;
      }
    });

    cancel_list[index] = cancel;

    index++;
  }

  const cancel = function () {
    for (const c of cancel_list) {
      c();
    }
  };

  return cancel;
}

class LinkedZip<T> {
  constructor(total: number) {
    this.total = total;
    this.checkInList = [];
    this.broken = false;
    this.zipContent = [];
    this.zipCount = 0;
  }

  checkIn(i: number) {
    this.checkInList.push(i);
  }

  zip(i: number, x: T): [true, T[]] | [false] {
    this.zipContent[i] = x;
    this.zipCount++;
    return [(this.zipCount === this.total) as true, this.zipContent];
  }

  getNext(i: number): [LinkedZipStatus, LinkedZip<T>] {
    if (!this.next) {
      this.next = new LinkedZip(this.total);
    }

    this.next.checkIn(i);

    let status: LinkedZipStatus;
    if (this.broken) {
      if (this.isAllCheckIn()) {
        status = LinkedZipStatus.Inactive;
      } else {
        status = LinkedZipStatus.Broken;
      }
    } else {
      status = LinkedZipStatus.Active;
    }

    return [status, this.next];
  }

  break(): [boolean, number[]] {
    this.broken = true;
    this.zipContent = null!;
    this.next = null!;

    return [this.isAllCheckIn(), this.checkInList];
  }

  private isAllCheckIn() {
    return this.checkInList.length === this.total;
  }

  private readonly total: number;
  private readonly checkInList: number[];
  private broken: boolean;
  private zipContent: T[];
  private zipCount!: number;
  private next!: LinkedZip<T>;
}

enum LinkedZipStatus {
  Active,
  Broken,
  Inactive,
}
