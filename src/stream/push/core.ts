import { EmitForm, Emitter } from "./emitter";
import { Selector, Predicate, Action } from "../../util";
import { PushType } from "./push-type";
import Push from "./push";

export function map<T, K>(emit: EmitForm<K, never>, f: Selector<T, K>) {
  return (x: T) => {
    emit(PushType.Next, f(x));
  };
}

export function filter<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return (x: T) => {
    if (f(x)) {
      emit(PushType.Next, x);
    }
  };
}

export function remove<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return (x: T) => {
    if (!f(x)) {
      emit(PushType.Next, x);
    }
  };
}

export function take<T>(emit: EmitForm<T, never>, n: number) {
  return (x: T) => {
    if (n > 0) {
      n--;
      emit(PushType.Next, x);
    } else {
      emit(PushType.Complete);
    }
  };
}

export function takeWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return (x: T) => {
    if (f(x)) {
      emit(PushType.Next, x);
    } else {
      emit(PushType.Complete);
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
        emit(PushType.Next, x);
      }
    } else {
      emit(PushType.Next, x);
    }
  };
}

export function skipWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  let skip = true;
  return (x: T) => {
    if (skip) {
      if (!f(x)) {
        skip = false;
        emit(PushType.Next, x);
      }
    } else {
      emit(PushType.Next, x);
    }
  };
}

export function concat<T, Te>(
  emitter1: Emitter<T, Te>,
  emitter2: Emitter<T, Te>,
  emit: EmitForm<T, Te>
) {
  let cancel2 = function () {};

  const cancel1 = emitter1.emit((t, x?) => {
    switch (t) {
      case PushType.Next:
        emit(PushType.Next, x as T);
        break;
      case PushType.Complete:
        cancel2 = emitter2.emit(emit);
        break;
      case PushType.Error:
        emit(PushType.Error, x as Te);
        break;
    }
  });

  const cancel = function () {
    cancel1();
    cancel2();
  };

  return cancel;
}

interface ZipEmitter {
  isCancel: boolean;
  cancel(): void;
  count: number;
  index: number;
}

export function zip<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T[], Te>) {
  const total = ee.length;

  if (total === 0) {
    emit(PushType.Complete);
    return () => {};
  }

  let zipCacheBenchmark = 1,
    zipCacheTop = 0;
  const zipCacheList: { zip: T[]; count: number }[] = [];

  let limit = Infinity;

  const zipEmitterList: ZipEmitter[] = [];

  const cancel = function () {
    for (const emitter of zipEmitterList) {
      if (!emitter.isCancel) {
        emitter.isCancel = true;
        emitter.cancel();
      }
    }
  };

  let isCancel = false;

  let i = 0;
  for (const emitter of ee) {
    if (isCancel) {
      break;
    }

    const zipEmitter = {
      isCancel: false,
      cancel() {},
      count: 0,
      index: i++,
    };

    zipEmitter.cancel = emitter.emit((t, x?) => {
      switch (t) {
        case PushType.Next:
          zipEmitter.count++;

          if (zipEmitter.count > zipCacheTop) {
            zipCacheTop++;

            const zip: T[] = new Array(total).fill(null);

            zip[zipEmitter.index] = x as T;

            const cache = {
              zip,
              count: 1,
            };

            zipCacheList.push(cache);
          } else {
            const cache = zipCacheList[zipEmitter.count - zipCacheBenchmark];

            cache.zip[zipEmitter.index] = x as T;
            cache.count++;

            if (cache.count === total) {
              zipCacheBenchmark++;
              zipCacheList.shift();
              emit(PushType.Next, cache.zip);

              if (zipCacheBenchmark - 1 === limit) {
                isCancel = true;
                emit(PushType.Complete);
              }
            }

            if (zipEmitter.count === limit) {
              zipEmitter.isCancel = true;
              zipEmitter.cancel();
            }
          }

          break;
        case PushType.Complete:
          limit = zipEmitter.count;

          var allComplete = true;
          for (const producer of zipEmitterList) {
            if (producer.count < limit) {
              allComplete = false;
            } else {
              if (!producer.isCancel) {
                producer.isCancel = true;
                producer.cancel();
              }
            }
          }

          if (allComplete) {
            isCancel = true;
            emit(PushType.Complete);
          } else {
            zipCacheList.splice(limit - zipCacheBenchmark + 1);
          }

          break;
        case PushType.Error:
          isCancel = true;
          cancel();
          emit(PushType.Error, x as Te);

          break;
      }
    });

    zipEmitterList.push(zipEmitter);
  }

  return cancel;
}
