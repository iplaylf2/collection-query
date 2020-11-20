import { Emitter, EmitForm } from "./type";
export interface RelayNextHandler<T, K> {
    (emit: EmitForm<K, any>): (x: T) => Promise<void>;
}
export declare function relayNext<T, K = T>(handler: RelayNextHandler<T, K>): (emitter: Emitter<T, any>) => Emitter<K, any>;
