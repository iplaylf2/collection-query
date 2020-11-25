import { Action } from "../../type";
export declare enum EmitType {
    Next = 0,
    Complete = 1,
    Error = 2
}
export declare type EmitItem<T, Te> = [EmitType.Next, T] | [EmitType.Complete] | [EmitType.Error, Te];
export interface Cancel {
    (): void;
}
export interface ReceiveForm<T, Te> {
    (...x: EmitItem<T, Te>): void;
}
export interface Emitter<T, Te = never> {
    (receiver: ReceiveForm<T, Te>, expose?: Action<Cancel>): Cancel;
}
export interface EmitForm<T, Te> {
    (...x: EmitItem<T, Te>): boolean;
}
export interface Executor<T, Te> {
    (emit: EmitForm<T, Te>): void;
}
