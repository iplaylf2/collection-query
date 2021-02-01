import { Cancel, EmitItem } from "../type";
import { Action } from "../../../type";

export interface ReceiveForm<T> {
  (...x: EmitItem<T>): Promise<void>;
}
export interface Emitter<T> {
  (receiver: ReceiveForm<T>, expose?: Action<Cancel>): Cancel;
}

export interface EmitForm<T> {
  (...x: EmitItem<T>): Promise<boolean>;
}

export interface Executor<T> {
  (emit: EmitForm<T>): void | Cancel;
}
