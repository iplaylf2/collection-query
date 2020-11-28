import { EmitForm, Emitter } from "./type";
import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Action,
  Aggregate,
  AsyncAggregate,
} from "../../../type";
import { EmitType, EmitItem, Cancel } from "../type";
import { PartitionCollector } from "../../common/partition-collector";
import { AsyncPartitionByCollector } from "../../common/partition-by-collector/async-partition-by-collector";
import { ZipHandler } from "../../common/async/zip-handler";
import { RaceHandler } from "../../common/async/race-handler";
import { IteratorStatus } from "../../common/async/controlled-iterator";

export function map<T, K>(
  emit: EmitForm<K>,
  f: Selector<T, K> | AsyncSelector<T, K>
) {
  return async (x: T) => {
    const r = await f(x);
    await emit(EmitType.Next, r);
  };
}

export function filter<T>(
  emit: EmitForm<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  return async (x: T) => {
    const p = await f(x);
    if (p) {
      await emit(EmitType.Next, x);
    }
  };
}

export function remove<T>(
  emit: EmitForm<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  return async (x: T) => {
    const p = await f(x);
    if (!p) {
      await emit(EmitType.Next, x);
    }
  };
}

export function take<T>(emit: EmitForm<T>, n: number) {
  return async (x: T) => {
    if (0 < n) {
      n--;
      await emit(EmitType.Next, x);
    } else {
      emit(EmitType.Complete);
    }
  };
}

export function takeWhile<T>(
  emit: EmitForm<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  return async (x: T) => {
    const p = await f(x);
    if (p) {
      await emit(EmitType.Next, x);
    } else {
      emit(EmitType.Complete);
    }
  };
}

export function skip<T>(emit: EmitForm<T>, n: number) {
  let skip = true;
  return async (x: T) => {
    if (skip) {
      if (0 < n) {
        n--;
      } else {
        skip = false;
        await emit(EmitType.Next, x);
      }
    } else {
      await emit(EmitType.Next, x);
    }
  };
}

export function skipWhile<T>(
  emit: EmitForm<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  let skip = true;
  return async (x: T) => {
    if (skip) {
      const p = await f(x);
      if (!p) {
        skip = false;
        await emit(EmitType.Next, x);
      }
    } else {
      await emit(EmitType.Next, x);
    }
  };
}

export function partition<T>(
  emitter: Emitter<T>,
  emit: EmitForm<T[]>,
  expose: Action<Cancel>,
  n: number
) {
  if (!(0 < n)) {
    expose(() => {});
    emit(EmitType.Complete);
  }

  const collector = new PartitionCollector<T>(n);
  emitter(async (t, x?) => {
    switch (t) {
      case EmitType.Next:
        {
          const [full, partition] = collector.collect(x as T);
          if (full) {
            await emit(EmitType.Next, partition!);
          }
        }
        break;
      case EmitType.Complete:
        {
          const [rest, partition] = collector.getRest();
          if (rest) {
            await emit(EmitType.Next, partition!);
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
  emitter: Emitter<T>,
  emit: EmitForm<T[]>,
  expose: Action<Cancel>,
  f: Selector<T, any> | AsyncSelector<T, any>
) {
  const collector = new AsyncPartitionByCollector<T>(f);

  emitter(async (t, x?) => {
    switch (t) {
      case EmitType.Next:
        {
          const [full, partition] = await collector.collect(x as T);
          if (full) {
            await emit(EmitType.Next, partition!);
          }
        }
        break;
      case EmitType.Complete:
        {
          const [rest, partition] = collector.getRest();
          if (rest) {
            await emit(EmitType.Next, partition!);
          }

          emit(EmitType.Complete);
        }
        break;
      case EmitType.Error:
        emit(EmitType.Error, x);
    }
  }, expose);
}

export function flatten<T>(emit: EmitForm<T>) {
  return async (xx: T[]) => {
    for (const x of xx) {
      await emit(EmitType.Next, x);
    }
  };
}

export function incubate<T>(
  emitter: Emitter<Promise<T>>,
  emit: EmitForm<T>,
  expose: Action<Cancel>
) {
  let exhausted = false,
    count = 0;

  emitter(async (t, x?) => {
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
  emitter1: Emitter<T>,
  emitter2: Emitter<T>,
  emit: EmitForm<T>,
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
    async (t, x?) => {
      switch (t) {
        case EmitType.Next:
          await emit(EmitType.Next, x as T);
          break;
        case EmitType.Complete:
          emitter2(emit as any, (c) => (cancel2 = c));
          break;
        case EmitType.Error:
          emit(EmitType.Error, x);
          break;
      }
    },
    (c) => (cancel1 = c)
  );
}

export function zip<T>(
  ee: Emitter<T>[],
  emit: EmitForm<T[]>,
  expose: Action<Cancel>
) {
  const total = ee.length;
  if (!(0 < total)) {
    expose(() => {});
    emit(EmitType.Complete);
  }

  const handler = new ZipHandler<T>(total);

  const cancel_list: Cancel[] = [];

  const cancel = function () {
    for (const c of cancel_list) {
      c();
    }
    handler.end();
  };

  expose(cancel);

  let index = 0;
  for (const emitter of ee) {
    if (handler.status !== IteratorStatus.Running) {
      break;
    }

    const _index = index;
    emitter(
      async (t, x?) => {
        switch (t) {
          case EmitType.Next:
            await handler.zip(_index, x as T);
            break;
          case EmitType.Complete:
            handler.end();
            break;
          case EmitType.Error:
            handler.crash(x);
            break;
        }
      },
      (c) => cancel_list.push(c)
    );
    index++;
  }

  (async function () {
    try {
      for await (const x of handler) {
        await emit(EmitType.Next, x);
      }
      emit(EmitType.Complete);
    } catch (e) {
      emit(EmitType.Error, e);
    }
  })();
}

export function race<T>(
  ee: Emitter<T>[],
  emit: EmitForm<T>,
  expose: Action<Cancel>
) {
  const total = ee.length;
  if (!(0 < total)) {
    expose(() => {});
    emit(EmitType.Complete);
  }

  const handler = new RaceHandler<T>(total);

  const cancel_list: Cancel[] = [];

  const cancel = function () {
    for (const c of cancel_list) {
      c();
    }
    handler.end();
  };

  expose(cancel);

  for (const emitter of ee) {
    if (handler.status !== IteratorStatus.Running) {
      break;
    }

    emitter(
      async (t, x?) => {
        switch (t) {
          case EmitType.Next:
            await handler.race(x as T);
            break;
          case EmitType.Complete:
            handler.leave();
            break;
          case EmitType.Error:
            handler.crash(x);
            break;
        }
      },
      (c) => cancel_list.push(c)
    );
  }

  (async function () {
    try {
      for await (const x of handler) {
        await emit(EmitType.Next, x);
      }
      emit(EmitType.Complete);
    } catch (e) {
      emit(EmitType.Error, e);
    }
  })();
}

export function reduce<T, K>(
  resolve: Action<K>,
  reject: Action<any>,
  f: Aggregate<T, K> | AsyncAggregate<T, K>,
  v: K
) {
  let r = v;
  return async (...[t, x]: EmitItem<T>) => {
    switch (t) {
      case EmitType.Next:
        r = await f(r, x);
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
  return async (...[t, x]: EmitItem<any>) => {
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
  return async (...[t, x]: EmitItem<T>) => {
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
  f: Predicate<T> | AsyncPredicate<T>
) {
  return async (...[t, x]: EmitItem<T>) => {
    switch (t) {
      case EmitType.Next:
        const p = await f(x);
        if (!p) {
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
  f: Predicate<T> | AsyncPredicate<T>
) {
  return async (...[t, x]: EmitItem<T>) => {
    switch (t) {
      case EmitType.Next:
        const p = await f(x);
        if (p) {
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
  return async (...[t, x]: EmitItem<T>) => {
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
  return async (...[t, x]: EmitItem<T>) => {
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
