import { Emitter, EmitForm } from "../type";
export declare function zip<T>(ee: Emitter<T, any>[], emit: EmitForm<T[], any>): () => void;
