import { Action } from "../../type";

export enum EmitType {
  Next,
  Complete,
  Error,
}

export type EmitItem<T, Te> =
  | [EmitType.Next, T]
  | [EmitType.Complete]
  | [EmitType.Error, Te];

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
