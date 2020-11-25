import { Cancel, EmitForm, Emitter } from "../type";
import { Action, Selector } from "../../../type";
export declare function groupBy<T, K>(emitter: Emitter<T, any>, emit: EmitForm<[K, Emitter<T, any>], any>, expose: Action<Cancel>, f: Selector<T, K>): void;
