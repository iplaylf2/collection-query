import { EmitForm, EmitType, Emitter, EmitItem, Cancel } from "./type";
import { Selector, Predicate, Action, Aggregate } from "../../type";
import { PartitionCollector } from "../common/partition-collector";
import { PartitionByCollector } from "../common/partition-by-collector/partition-by-collector";

export function map<T, K>(emit: EmitForm<K, never>, f: Selector<T, K>) {
  return (x: T) => {
    emit(EmitType.Next, f(x));
  };
}

export function filter<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return (x: T) => {
    if (f(x)) {
      emit(EmitType.Next, x);
    }
  };
}

export function remove<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return (x: T) => {
    if (!f(x)) {
      emit(EmitType.Next, x);
    }
  };
}

export function take<T>(emit: EmitForm<T, never>, n: number) {
  return (x: T) => {
    if (0 < n) {
      n--;
      emit(EmitType.Next, x);
    } else {
      emit(EmitType.Complete);
    }
  };
}

export function takeWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return (x: T) => {
    if (f(x)) {
      emit(EmitType.Next, x);
    } else {
      emit(EmitType.Complete);
    }
  };
}

export function skip<T>(emit: EmitForm<T, never>, n: number) {
  let skip = true;
  return (x: T) => {
    if (skip) {
      if (0 < n) {
        n--;
      } else {
        skip = false;
        emit(EmitType.Next, x);
      }
    } else {
      emit(EmitType.Next, x);
    }
  };
}

export function skipWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  let skip = true;
  return (x: T) => {
    if (skip) {
      if (!f(x)) {
        skip = false;
        emit(EmitType.Next, x);
      }
    } else {
      emit(EmitType.Next, x);
    }
  };
}

export function partition<T>(
  emitter: Emitter<T, any>,
  emit: EmitForm<T[], any>,
  expose: Action<Cancel>,
  n: number
) {
  if (!(0 < n)) {
    expose(() => {});
    emit(EmitType.Complete);
  }

  const collector = new PartitionCollector<T>(n);
  emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        {
          const [full, partition] = collector.collect(x as T);
          if (full) {
            emit(EmitType.Next, partition!);
          }
        }
        break;
      case EmitType.Complete:
        {
          const [rest, partition] = collector.getRest();
          if (rest) {
            emit(EmitType.Next, partition!);
          }

          emit(EmitType.Complete);
        }
        break;
      case EmitType.Error:
        emit(EmitType.Error, x);
    }
  }, expose);
}

export function partitionBy<T>(
  emitter: Emitter<T, any>,
  emit: EmitForm<T[], any>,
  expose: Action<Cancel>,
  f: Selector<T, any>
) {
  const collector = new PartitionByCollector<T>(f);

  emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        {
          const [full, partition] = collector.collect(x as T);
          if (full) {
            emit(EmitType.Next, partition!);
          }
        }
        break;
      case EmitType.Complete:
        {
          const [rest, partition] = collector.getRest();
          if (rest) {
            emit(EmitType.Next, partition!);
          }

          emit(EmitType.Complete);
        }
        break;
      case EmitType.Error:
        emit(EmitType.Error, x);
    }
  }, expose);
}

export function flatten<T>(emit: EmitForm<T, never>) {
  return (xx: T[]) => {
    for (const x of xx) {
      emit(EmitType.Next, x);
    }
  };
}

export * from "./core/group-by";

export function incubate<T>(
  emitter: Emitter<Promise<T>, any>,
  emit: EmitForm<T, any>,
  expose: Action<Cancel>
) {
  let exhausted = false,
    count = 0;

  emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        count++;
        const p: Promise<T> = x;

        (async () => {
          try {
            const x = await p;
            emit(EmitType.Next, x);

            count--;
            if (exhausted && 0 === count) {
              emit(EmitType.Complete);
            }
          } catch (e) {
            emit(EmitType.Error, e);
          }
        })();

        break;
      case EmitType.Complete:
        exhausted = true;
        if (0 === count) {
          emit(EmitType.Complete);
        }

        break;
      case EmitType.Error:
        emit(EmitType.Error, x);

        break;
    }
  }, expose);
}

export function concat<T>(
  emitter1: Emitter<T, any>,
  emitter2: Emitter<T, any>,
  emit: EmitForm<T, any>,
  expose: Action<Cancel>
) {
  let cancel1!: Cancel;
  let cancel2: Cancel = function () {};

  const cancel = function () {
    cancel1();
    cancel2();
  };

  expose(cancel);

  emitter1(
    (t, x?) => {
      switch (t) {
        case EmitType.Next:
          emit(EmitType.Next, x as T);
          break;
        case EmitType.Complete:
          emitter2(emit, (c) => (cancel2 = c));
          break;
        case EmitType.Error:
          emit(EmitType.Error, x);
          break;
      }
    },
    (c) => (cancel1 = c)
  );
}

export * from "./core/zip";

export function race<T>(
  ee: Emitter<T, any>[],
  emit: EmitForm<T, any>,
  expose: Action<Cancel>
) {
  let count = ee.length;
  if (!(0 < count)) {
    expose(() => {});
    emit(EmitType.Complete);
  }

  let isCancel = false;
  const cancel_list: Cancel[] = [];

  const cancel = function () {
    isCancel = true;
    for (const c of cancel_list) {
      c();
    }
  };

  expose(cancel);

  for (const emitter of ee) {
    if (isCancel) {
      break;
    }

    emitter(
      (t, x?) => {
        switch (t) {
          case EmitType.Next:
            emit(EmitType.Next, x as T);
            break;
          case EmitType.Complete:
            count--;
            if (!(0 < count)) {
              emit(EmitType.Complete);
            }
            break;
          case EmitType.Error:
            emit(EmitType.Error, x);
            break;
        }
      },
      (c) => cancel_list.push(c)
    );
  }
}

export function reduce<T, K>(
  resolve: Action<K>,
  reject: Action<any>,
  f: Aggregate<T, K>,
  v: K
) {
  let r = v;
  return (...[t, x]: EmitItem<T, any>) => {
    switch (t) {
      case EmitType.Next:
        r = f(r, x);
        break;
      case EmitType.Complete:
        resolve(r);
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}

export function count(resolve: Action<number>, reject: Action<any>) {
  let n = 0;
  return (...[t, x]: EmitItem<any, any>) => {
    switch (t) {
      case EmitType.Next:
        n++;
        break;
      case EmitType.Complete:
        resolve(n);
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}

export function include<T>(
  resolve: Action<boolean>,
  reject: Action<any>,
  v: T
) {
  return (...[t, x]: EmitItem<T, any>) => {
    switch (t) {
      case EmitType.Next:
        if (x === v) {
          resolve(true);
        }
        break;
      case EmitType.Complete:
        resolve(false);
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}

export function every<T>(
  resolve: Action<boolean>,
  reject: Action<any>,
  f: Predicate<T>
) {
  return (...[t, x]: EmitItem<T, any>) => {
    switch (t) {
      case EmitType.Next:
        if (!f(x)) {
          resolve(false);
        }
        break;
      case EmitType.Complete:
        resolve(true);
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}

export function some<T>(
  resolve: Action<boolean>,
  reject: Action<any>,
  f: Predicate<T>
) {
  return (...[t, x]: EmitItem<T, any>) => {
    switch (t) {
      case EmitType.Next:
        if (f(x)) {
          resolve(true);
        }
        break;
      case EmitType.Complete:
        resolve(false);
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}

export function first<T>(resolve: Action<T | void>, reject: Action<any>) {
  return (...[t, x]: EmitItem<T, any>) => {
    switch (t) {
      case EmitType.Next:
        resolve(x);
        break;
      case EmitType.Complete:
        resolve();
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}

export function last<T>(resolve: Action<T | void>, reject: Action<any>) {
  let last: T | void;
  return (...[t, x]: EmitItem<T, any>) => {
    switch (t) {
      case EmitType.Next:
        last = x;
        break;
      case EmitType.Complete:
        resolve(last);
        break;
      case EmitType.Error:
        reject(x);
        break;
    }
  };
}
