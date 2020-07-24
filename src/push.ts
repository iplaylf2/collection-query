import { PushStream } from "./stream/type";
import { Action } from "./type";
import { EmitForm } from "./stream/push/type";
import { create as _create } from "./stream/push/create";

export const create: <T, Te = never>(
  executor: Action<EmitForm<T, Te>>
) => PushStream<T, Te> = _create;

export * from "./stream/push";
