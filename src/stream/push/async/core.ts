import { EmitForm, Emitter } from "./type";
import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Action,
} from "../../../type";
import { EmitType } from "../type";

export function map<T, K>(emit: EmitForm<K, never>, f: Selector<T, K>) {
  return async (x: T) => {
    await emit(EmitType.Next, f(x));
  };
}

export function mapAsync<T, K>(
  emit: EmitForm<K, never>,
  f: AsyncSelector<T, K>
) {
  return async (x: T) => {
    const r = await f(x);
    await emit(EmitType.Next, r);
  };
}

export function filter<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return async (x: T) => {
    if (f(x)) {
      await emit(EmitType.Next, x);
    }
  };
}

export function filterAsync<T>(emit: EmitForm<T, never>, f: AsyncPredicate<T>) {
  return async (x: T) => {
    const p = await f(x);
    if (p) {
      await emit(EmitType.Next, x);
    }
  };
}

export function remove<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return async (x: T) => {
    if (!f(x)) {
      await emit(EmitType.Next, x);
    }
  };
}

export function removeAsync<T>(emit: EmitForm<T, never>, f: AsyncPredicate<T>) {
  return async (x: T) => {
    const p = await f(x);
    if (!p) {
      await emit(EmitType.Next, x);
    }
  };
}

export function take<T>(emit: EmitForm<T, never>, n: number) {
  return async (x: T) => {
    if (n > 0) {
      n--;
      await emit(EmitType.Next, x);
    } else {
      await emit(EmitType.Complete);
    }
  };
}

export function takeWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  return async (x: T) => {
    if (f(x)) {
      await emit(EmitType.Next, x);
    } else {
      await emit(EmitType.Complete);
    }
  };
}

export function takeWhileAsync<T>(
  emit: EmitForm<T, never>,
  f: AsyncPredicate<T>
) {
  return async (x: T) => {
    const p = await f(x);
    if (p) {
      await emit(EmitType.Next, x);
    } else {
      await emit(EmitType.Complete);
    }
  };
}

export function skip<T>(emit: EmitForm<T, never>, n: number) {
  let skip = true;
  return async (x: T) => {
    if (skip) {
      if (n > 0) {
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

export function skipWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>) {
  let skip = true;
  return async (x: T) => {
    if (skip) {
      if (!f(x)) {
        skip = false;
        await emit(EmitType.Next, x);
      }
    } else {
      await emit(EmitType.Next, x);
    }
  };
}

export function skipWhileAsync<T>(
  emit: EmitForm<T, never>,
  f: AsyncPredicate<T>
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

export function concat<T, Te>(
  emitter1: Emitter<T, Te>,
  emitter2: Emitter<T, Te>,
  emit: EmitForm<T, Te>
) {
  let cancel2: Action<void> = function () {};

  const cancel1 = emitter1(async (t, x?) => {
    switch (t) {
      case EmitType.Next:
        await emit(EmitType.Next, x as T);
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