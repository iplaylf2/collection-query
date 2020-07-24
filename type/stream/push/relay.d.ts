import { EmitForm, Emitter } from "./type";
import { Action } from "../../type";
interface RelayHandler<T, Te> {
    (emit: EmitForm<T, Te>): Action<void>;
}
export declare function relay<T, Te>(handler: RelayHandler<T, Te>): Emitter<T, Te>;
export {};
