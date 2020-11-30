import { Action } from "../../type";
export declare enum EmitType {
    Next = 0,
    Complete = 1,
    Error = 2
}
export declare type EmitItem<T> = [EmitType.Next, T] | [EmitType.Complete] | [EmitType.Error, any];
export interface Cancel {
    (): void;
}
export interface ReceiveForm<T> {
    (...x: EmitItem<T>): void;
}
export interface Emitter<T> {
    (receiver: ReceiveForm<T>, expose?: Action<Cancel>): Cancel;
}
export interface EmitForm<T> {
    (...x: EmitItem<T>): boolean;
}
export interface Executor<T> {
    (emit: EmitForm<T>): void;
}
