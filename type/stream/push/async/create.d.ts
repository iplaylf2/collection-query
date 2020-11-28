import { Emitter, Executor } from "./type";
export declare function create<T>(executor: Executor<T>): Emitter<T>;
