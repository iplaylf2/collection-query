import { Emitter, EmitForm, Cancel } from "../type";
import { Action } from "../../../type";
export declare function zip<T>(ee: Emitter<T>[], emit: EmitForm<T[]>, expose: Action<Cancel>): void;
