import { AsyncPushStream, PushStream } from "../type";
import { relay } from "../push/relay";

export const sync: <T>(s: AsyncPushStream<T>) => PushStream<T> = relay as any;
