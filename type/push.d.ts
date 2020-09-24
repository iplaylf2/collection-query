import { PushStream } from "./stream/type";
import { Action } from "./type";
import { EmitForm } from "./stream/push/type";
export { EmitForm } from "./stream/push/type";
export declare const create: <T, Te = never>(executor: Action<EmitForm<T, Te>>) => PushStream<T, Te>;
export * from "./stream/push";
export * from "./stream/convert/sync-push-to-async-push";
