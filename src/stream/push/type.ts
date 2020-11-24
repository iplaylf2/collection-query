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

export interface EmitForm<T, Te> {
  (...x: EmitItem<T, Te>): void;
}

export interface Cancel {
  (): void;
}

export interface Emitter<T, Te = never> {
  (emit: EmitForm<T, Te>, expose?: Action<Cancel>): Cancel;
}
