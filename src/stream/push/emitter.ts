import { PushItem, PushType } from "./push-type";
import { Action } from "../../util";

export interface EmitForm<T, Te> {
  (...x: PushItem<T, Te>): void;
}

interface EmitterContext<T, Te> {
  open: boolean;
  emit: EmitForm<T, Te>;
}

export class Emitter<T, Te = any> {
  static receive<T, Te>(
    context: EmitterContext<T, Te>,
    ...[t, v]: PushItem<T, Te>
  ) {
    if (context.open) {
      switch (t) {
        case PushType.Next:
          Emitter.next(context, v as T);
          break;
        case PushType.Complete:
          break;
        case PushType.Error:
          break;
      }
    }
  }

  static next<T>(context: EmitterContext<T, never>, v: T) {
    try {
      context.emit(PushType.Next, v);
    } catch (e) {
      Emitter.cancel(context);
      throw e;
    }
  }

  static complete(context: EmitterContext<never, never>) {
    const { emit } = context;
    Emitter.cancel(context);
    emit(PushType.Complete);
  }

  static error<T>(context: EmitterContext<never, T>, e: T) {
    const { emit } = context;
    Emitter.cancel(context);
    emit(PushType.Error, e);
  }

  static cancel(context: EmitterContext<never, never>) {
    Object.assign(context, { open: false, emit: null });
  }

  constructor(executor: Action<EmitForm<T, Te>>) {
    this.executor = executor;
  }

  emit(receiver: EmitForm<T, Te>) {
    const context = {
      open: true,
      emit: receiver,
    };

    const receive = (Emitter.receive as any).bind(null, context);
    const cancel = Emitter.cancel.bind(null, context);

    try {
      this.executor(receive);
    } catch (e) {
      if (context.open) {
        Emitter.error(context, e);
      }
    }

    return cancel;
  }

  private executor: Action<EmitForm<T, Te>>;
}
