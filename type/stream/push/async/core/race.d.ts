import { Emitter, EmitForm } from "../type";
export declare function race<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T, Te>): () => void;
