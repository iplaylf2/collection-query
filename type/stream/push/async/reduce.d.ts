import { Action } from "../../../type";
import { EmitForm, Emitter } from "./type";
export interface ReduceHandler<T, K> {
    (resolve: Action<K>, reject: Action<any>): EmitForm<T, any>;
}
export declare function reduce<T, K = T>(handler: ReduceHandler<T, K>): (emitter: Emitter<T>) => Promise<K>;
