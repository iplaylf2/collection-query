import { EmitForm, EmitType, Emitter, EmitItem } from "./type";
import { Selector, Predicate, Action, Aggregate } from "../../type";
import { getPartitionCollector } from "../common/get-partition-collector";

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
    if (n > 0) {
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
      if (n > 0) {
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

export function partition<T, Te>(
  emitter: Emitter<T, Te>,
  emit: EmitForm<T[], Te>,
  n: number,
  step: number
) {
  if (n <= 0 || step <= 0) {
    emit(EmitType.Complete);
    return () => {};
  }

  const collector = getPartitionCollector<T>(n, step);
  return emitter((t, x?) => {
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
          const partition = collector.getRest();
          if (partition.length > 0) {
            emit(EmitType.Next, partition);
          }

          emit(EmitType.Complete);
        }
        break;
      case EmitType.Error:
        emit(EmitType.Error, x as Te);
    }
  });
}

export function partitionBy<T, Te>(
  emitter: Emitter<T, Te>,
  emit: EmitForm<T[], Te>,
  f: Selector<T, any>
) {
  let active = false;

  let partition: T[] = [];
  let key: any;

  return emitter((t, x?) => {
    switch (t) {
      case EmitType.Next:
        x = x as T;

        const k = f(x);

        if (!active) {
          active = true;
          key = k;
        }

        if (k === key) {
          partition.push(x);
        } else {
          emit(EmitType.Next, partition);

          partition = [x];
          key = k;
        }
        break;
      case EmitType.Complete:
        if (active) {
          emit(EmitType.Next, partition);
        }

        emit(EmitType.Complete);
        break;
      case EmitType.Error:
        emit(EmitType.Error, x as Te);
    }
  });
}

export function concat<T, Te>(
  emitter1: Emitter<T, Te>,
  emitter2: Emitter<T, Te>,
  emit: EmitForm<T, Te>
) {
  let cancel2: Action<void> = function () {};

  const cancel1 = emitter1((t, x?) => {
    switch (t) {
      case EmitType.Next:
        emit(EmitType.Next, x as T);
        break;
      case EmitType.Complete:
        cancel2 = emitter2(emit);
        break;
      case EmitType.Error:
        emit(EmitType.Error, x as Te);
        break;
    }
  });

  const cancel = function () {
    cancel1();
    cancel2();
  };

  return cancel;
}

export * from "./core/zip";
export * from "./core/race";

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
