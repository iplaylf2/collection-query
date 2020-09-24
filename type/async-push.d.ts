import { AsyncPushStream } from "./stream/type";
import { Action } from "./type";
import { EmitForm } from "./stream/push/async/type";
export { EmitForm } from "./stream/push/async/type";
export declare const create: <T, Te = never>(executor: Action<EmitForm<T, Te>>) => AsyncPushStream<T, Te>;
export * from "./stream/async-push";
export * from "./stream/convert/async-push-to-sync-push";
export * from "./stream/convert/async-push-to-async-pull";
