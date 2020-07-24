import { Emitter, EmitForm } from "../type";
export declare function zip<T, Te>(ee: Emitter<T, Te>[], emit: EmitForm<T[], Te>): () => void;
