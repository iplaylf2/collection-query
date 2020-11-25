import { Emitter, EmitForm } from "./type";
import { Action } from "../../../type";
import { Cancel } from "../type";
export interface RelayHandler<T> {
    (emit: EmitForm<T, any>, expose: Action<Cancel>): void;
}
export declare function relay<T>(handler: RelayHandler<T>): Emitter<T, any>;
