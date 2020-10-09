import { PushStream } from "./stream/type";
import { Action } from "./type";
import { EmitForm } from "./stream/push/type";
import { create as _create } from "./stream/push/create";
import { createFrom as _createFrom } from "./stream/push/create-from";

export { EmitForm } from "./stream/push/type";

export const create: <T, Te = never>(
  executor: Action<EmitForm<T, Te>>
) => PushStream<T, Te> = _create;

export const createFrom: <T>(
  i: Iterable<T>
) => PushStream<T, any> = _createFrom;

export * from "./stream/push";
export * from "./stream/convert/sync-push-to-async-push";
