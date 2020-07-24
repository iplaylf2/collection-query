import { Emitter, EmitForm } from "./type";
interface RelayNextHandler<T, Te, K> {
    (emit: EmitForm<K, Te>): (x: T) => Promise<void>;
}
export declare function relayNext<T, Te, K = T>(handler: RelayNextHandler<T, Te, K>): (emitter: Emitter<T, Te>) => Emitter<K, Te>;
export {};
