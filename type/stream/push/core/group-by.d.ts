import { Cancel, EmitForm, Emitter } from "../type";
import { Action, Selector } from "../../../type";
export declare function groupBy<T, K>(emitter: Emitter<T>, emit: EmitForm<[K, Emitter<T>]>, expose: Action<Cancel>, f: Selector<T, K>): void;
