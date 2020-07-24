import { Action } from "../../type";
export declare enum EmitType {
    Next = 0,
    Complete = 1,
    Error = 2
}
export declare type EmitItem<T, Te> = [EmitType.Next, T] | [EmitType.Complete] | [EmitType.Error, Te];
export interface EmitForm<T, Te> {
    (...x: EmitItem<T, Te>): void;
}
export interface Emitter<T, Te = never> {
    (emit: EmitForm<T, Te>): Action<void>;
}
