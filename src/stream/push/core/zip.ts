import { Emitter, EmitForm, EmitType } from "../type";
import { Action } from "../../../type";

export function zip<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T[], Te>) {
  const total = ee.length;
  if (!(total > 0)) {
    emit(EmitType.Complete);
    return () => {};
  }

  const cancel_list = new Array<Action<void>>(total);

  const linked_zip_start = new LinkedZip<T>(total);

  let index = 0;
  for (const emitter of ee) {
    let linked_zip = linked_zip_start;

    linked_zip.checkIn(index);

    const i = index;
    const cancel = emitter((t, x?) => {
      switch (t) {
        case EmitType.Next:
          {
            const [full, result] = linked_zip.zip(i, x as T);
            if (full) {
              emit(EmitType.Next, result!);
            }

            linked_zip = linked_zip.getNext(index);

            if (linked_zip.broken) {
              cancel_list[i]();

              if (linked_zip.isAllCheckIn()) {
                emit(EmitType.Complete);
              }
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
          emit(EmitType.Error, x as Te);
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

  checkIn(index: number) {
    this.checkInList.push(index);
  }

  zip(index: number, x: T): [true, T[]] | [false] {
    this.zipContent[index] = x;
    this.zipCount++;
    return [(this.zipCount === this.total) as true, this.zipContent];
  }

  getNext(index: number) {
    if (!this.next) {
      this.next = new LinkedZip(this.total);
    }

    this.next.checkIn(index);

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
