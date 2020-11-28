import { PushStream, AsyncPushStream } from "../type";
import { relay } from "../push/async/relay";

export const async: <T>(s: PushStream<T>) => AsyncPushStream<T> = relay;
