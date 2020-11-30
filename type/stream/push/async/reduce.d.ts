import { Action } from "../../../type";
import { Emitter, ReceiveForm } from "./type";
export interface ReduceHandler<T, K> {
    (resolve: Action<K>, reject: Action<any>): ReceiveForm<T>;
}
export declare function reduce<T, K = T>(handler: ReduceHandler<T, K>): (emitter: Emitter<T>) => Promise<K>;
