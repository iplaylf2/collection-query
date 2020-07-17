import { EmitForm, EmitType } from "./type";
import { Selector, Predicate } from "../../type";
import { Emitter } from "./emitter";

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

export function concat<T, Te>(
  emitter1: Emitter<T, Te>,
  emitter2: Emitter<T, Te>,
  emit: EmitForm<T, Te>
) {
  let cancel2 = function () {};

  const cancel1 = emitter1.emit((t, x?) => {
    switch (t) {
      case EmitType.Next:
        emit(EmitType.Next, x as T);
        break;
      case EmitType.Complete:
        cancel2 = emitter2.emit(emit);
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
