import { Cancel, EmitForm, Emitter } from "./type";
import { Action } from "../../type";
export interface RelayHandler<T> {
    (emit: EmitForm<T, any>, expose: Action<Cancel>): void;
}
export declare function relay<T>(handler: RelayHandler<T>): Emitter<T, any>;
