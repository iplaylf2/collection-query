import { Emitter, EmitForm, EmitType } from "../type";
import { PreCancel } from "../pre-cancel";

export function zip<T>(ee: Emitter<T, any>[], emit: EmitForm<T[], any>) {
  const total = ee.length;
  if (!(0 < total)) {
    emit(EmitType.Complete);
    return () => {};
  }

  const linked_zip_start = new LinkedZip<T>(total);

  const cancel_list = ee.map((emitter, index) => {
    let linked_zip = linked_zip_start;
    linked_zip.arrive(index);

    const pre_cancel = new PreCancel(() => cancel);

    const cancel = emitter((t, x?) => {
      switch (t) {
        case EmitType.Next:
          {
            /*
            if(linked_zip.isBroken){
              //never
            }
            */

            const [full, result] = linked_zip.zip(index, x as T);
            if (full) {
              emit(EmitType.Next, result!);
            }

            const next_linked = linked_zip.arriveNext(index);
            if (next_linked.isBroken) {
              if (next_linked.isAllArrival) {
                emit(EmitType.Complete);
              } else {
                pre_cancel.tryCancel();
              }
            } else {
              linked_zip = next_linked;
            }
          }
          break;
        case EmitType.Complete:
          {
            const check_in_list = linked_zip.break();

            if (linked_zip.isAllArrival) {
              emit(EmitType.Complete);
            } else {
              for (const i of check_in_list) {
                if (i === index) continue;
                cancel_list[i]();
              }
            }
          }
          break;
        case EmitType.Error:
          emit(EmitType.Error, x);
          break;
      }
    });

    pre_cancel.fulfil();

    return cancel;
  });

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
    this.arrivalList = [];
    this.zipContent = new Array(total);
    this._isBroken = false;
    this.zipCount = 0;
  }

  arrive(i: number) {
    this.arrivalList.push(i);
  }

  zip(i: number, x: T): [true, T[]] | [false] {
    this.zipContent[i] = x;
    this.zipCount++;
    return [(this.zipCount === this.total) as true, this.zipContent];
  }

  arriveNext(i: number): LinkedZip<T> {
    if (!this.next) {
      this.next = new LinkedZip(this.total);
    }
    this.next.arrive(i);
    return this.next;
  }

  break(): number[] {
    this._isBroken = true;
    this.zipContent = null!;
    this.next = null!;
    return this.arrivalList;
  }

  get isBroken() {
    return this._isBroken;
  }

  get isAllArrival() {
    return this.arrivalList.length === this.total;
  }

  private readonly total: number;
  private readonly arrivalList: number[];
  private zipContent: T[];
  private _isBroken: boolean;
  private zipCount!: number;
  private next!: LinkedZip<T>;
}
