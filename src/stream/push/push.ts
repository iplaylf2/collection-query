import { Action } from "../../type";
import { EmitForm, Emitter } from "./type";
import { createEmitter } from "./create-emitter";

const emitterSymbol = Symbol("emitter");

export default class Push<T, Te = any> {
  static create<T, Te>(executor: Action<EmitForm<T, Te>>) {
    const emitter = createEmitter(executor);
    return new Push(emitter);
  }

  static emitter: typeof emitterSymbol = emitterSymbol;

  constructor(emitter: Emitter<T, Te>) {
    this[emitterSymbol] = emitter;
  }

  [emitterSymbol]: Emitter<T, Te>;
}
