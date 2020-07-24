import { Emitter, EmitForm } from "./type";
import { Action } from "../../type";
interface RelayNextHandler<T, Te, K> {
    (emit: EmitForm<K, Te>): Action<T>;
}
export declare function relayNext<T, Te, K = T>(handler: RelayNextHandler<T, Te, K>): (emitter: Emitter<T, Te>) => Emitter<K, Te>;
export {};
