import { EmitItem } from "../type";
import { Action } from "../../../type";

export interface EmitForm<T, Te> {
  (...x: EmitItem<T, Te>): Promise<void>;
}

export interface Emitter<T, Te = never> {
  (emit: EmitForm<T, Te>): Action<void>;
}
