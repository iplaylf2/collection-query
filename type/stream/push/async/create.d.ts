import { Action } from "../../../type";
import { EmitForm } from "./type";
export declare function create<T, Te = never>(executor: Action<EmitForm<T, Te>>): (receiver: EmitForm<T, Te>) => () => void;
