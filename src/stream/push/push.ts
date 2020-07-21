import { Emitter } from "./type";

export default class Push<T, Te = any> {
  constructor(emitter: Emitter<T, Te>) {
    this.emitter = emitter;
  }

  emitter: Emitter<T, Te>;
}
