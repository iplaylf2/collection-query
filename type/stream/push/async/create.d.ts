import { Emitter, Executor } from "./type";
export declare function create<T, Te = never>(executor: Executor<T, Te>): Emitter<T, Te>;
