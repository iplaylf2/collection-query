import { Emitter, EmitForm, Cancel } from "../type";
import { Action } from "../../../type";
export declare function zip<T>(ee: Emitter<T, any>[], emit: EmitForm<T[], any>, expose: Action<Cancel>): void;
