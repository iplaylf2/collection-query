import { EmitForm } from "./emitter";
import { Selector, Predicate } from "../../util";
import { PushType } from "./push-type";

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
