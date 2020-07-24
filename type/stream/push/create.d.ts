import { Action } from "../../type";
import { EmitForm } from "./type";
export declare function create<T, Te>(executor: Action<EmitForm<T, Te>>): (receiver: EmitForm<T, Te>) => () => void;
