import { EmitForm } from "./emitter";
import { Selector, Predicate } from "../../util";
import { PushType } from "./push-type";

export function map<T, K>(emit: EmitForm<K, never>, f: Selector<T, K>, x: T) {
  emit(PushType.Next, f(x));
}

export function filter<T>(emit: EmitForm<T, never>, f: Predicate<T>, x: T) {
  if (f(x)) {
    emit(PushType.Next, x);
  }
}

export function remove<T>(emit: EmitForm<T, never>, f: Predicate<T>, x: T) {
  if (!f(x)) {
    emit(PushType.Next, x);
  }
}

export function take<T>(emit: EmitForm<T, never>, o: { n: number }, x: T) {
  if (o.n > 0) {
    o.n--;
    emit(PushType.Next, x);
  } else {
    emit(PushType.Complete);
  }
}

export function takeWhile<T>(emit: EmitForm<T, never>, f: Predicate<T>, x: T) {
  if (f(x)) {
    emit(PushType.Next, x);
  } else {
    emit(PushType.Complete);
  }
}

export function skip<T>(
  emit: EmitForm<T, never>,
  o: { n: number; skip: boolean },
  x: T
) {
  if (o.skip) {
    if (o.n > 0) {
      o.n--;
    } else {
      o.skip = false;
      emit(PushType.Next, x);
    }
  } else {
    emit(PushType.Next, x);
  }
}

export function skipWhile<T>(
  emit: EmitForm<T, never>,
  o: { f: Predicate<T>; skip: boolean },
  x: T
) {
  if (o.skip) {
    if (!o.f(x)) {
      o.skip = false;
      emit(PushType.Next, x);
    }
  } else {
    emit(PushType.Next, x);
  }
}
