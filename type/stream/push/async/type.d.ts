import { Cancel, EmitItem } from "../type";
import { Action } from "../../../type";
export interface ReceiveForm<T, Te> {
    (...x: EmitItem<T, Te>): Promise<void>;
}
export interface Emitter<T, Te = never> {
    (emit: ReceiveForm<T, Te>, expose?: Action<Cancel>): Cancel;
}
export interface EmitForm<T, Te> {
    (...x: EmitItem<T, Te>): Promise<boolean>;
}
export interface Executor<T, Te> {
    (emit: EmitForm<T, Te>): void;
}
