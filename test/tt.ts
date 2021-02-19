import { EmitType } from "collection-query";
import { Emitter } from "collection-query/stream/push/type";

interface TransduceNext {
  (x: any): void;
}

interface TransduceBreak {
  (): void;
}

interface Transduce {
  (next: TransduceNext, break_: TransduceBreak): TransduceNext;
}

interface TransduceFunction {
  (x: any, next_: TransduceNext, break_: TransduceBreak): void;
}

class PullStream {
  static create() {
    return new PullStream((yield_) => {
      return (x) => {
        yield_(x);
      };
    });
  }

  constructor(trans: Transduce) {
    this.trans = trans;
  }

  transduce(tf: TransduceFunction) {
    return new PullStream((y, b) => {
      const next = this.trans(y, b);
      const tf_ = tf(b);
      return (x: any) => {
        tf_(x, next);
      };
    });
  }

  *iterate(s: any) {
    let is_take = false;
    let value = null;
    const y = function (x: any) {
      is_take = true;
      value = x;
    };
    let is_break = false;
    const b = function () {
      is_break = true;
    };

    const next = this.trans(y, b);
    for (const x of s) {
      next(x);
      if (is_take) {
        yield value;
        is_take = false;
      }
      if (is_break) {
        break;
      }
    }
  }

  reduce(s: any, rf: any, v: any) {
    let is_take = false;
    let value = null;
    const y = function (x: any) {
      is_take = true;
      value = x;
    };
    let is_break = false;
    const b = function () {
      is_break = true;
    };

    const next = this.trans(y, b);
    let r: any = v;
    for (const x of s) {
      next(x);
      if (is_take) {
        r = rf(r, value);
        is_take = false;
      }
      if (is_break) {
        break;
      }
    }
    return r;
  }

  private trans: Transduce;
}

class PushStream {
  static create() {
    return new PullStream((yield_) => {
      return (x) => {
        yield_(x);
      };
    });
  }

  constructor(trans: Transduce) {
    this.trans = trans;
  }

  transduce(tf: TransduceFunction) {
    return new PullStream((y, b) => {
      const next = this.trans(y, b);
      return (x: any) => {
        tf(x, next, b);
      };
    });
  }

  reduce(s: Emitter<any>, rf: any, v: any) {
    const next = this.trans(
      (x) => {
        r = rf(r, x);
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(r);
        }
      }
    );
    let r: any = v;

    s((t, x?) => {
      switch (t) {
        case EmitType.Next:
          next(x);
          break;
        case EmitType.Complete:
          resolve(r);
          break;
        case EmitType.Error:
          reject(r);
          break;
      }
    });
    return r;
  }

  private trans: Transduce;
}
