import { AsyncPushStream } from "./stream/type";
import { Action } from "./type";
import { EmitForm } from "./stream/push/async/type";
import { create as _create } from "./stream/push/async/create";

export { EmitForm } from "./stream/push/async/type";

export const create: <T, Te = never>(
  executor: Action<EmitForm<T, Te>>
) => AsyncPushStream<T, Te> = _create;

export * from "./stream/async-push";
export * from "./stream/convert/async-push-to-sync-push";
