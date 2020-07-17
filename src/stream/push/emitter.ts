import { EmitForm, EmitItem, EmitType } from "./type";
import { Action } from "../../type";

interface EmitterContext<T, Te> {
  open: boolean;
  emit: EmitForm<T, Te>;
}

export class Emitter<T, Te = any> {
  static receive<T, Te>(
    context: EmitterContext<T, Te>,
    ...[t, v]: EmitItem<T, Te>
  ) {
    if (context.open) {
      switch (t) {
        case EmitType.Next:
          Emitter.next(context, v as T);
          break;
        case EmitType.Complete:
          Emitter.complete(context);
          break;
        case EmitType.Error:
          Emitter.error(context, v as Te);
          break;
      }
    }
  }

  static next<T>(context: EmitterContext<T, never>, v: T) {
    try {
      context.emit(EmitType.Next, v);
    } catch (e) {
      Emitter.cancel(context);
      throw e;
    }
  }

  static complete(context: EmitterContext<never, never>) {
    const { emit } = context;
    Emitter.cancel(context);
    emit(EmitType.Complete);
  }

  static error<T>(context: EmitterContext<never, T>, e: T) {
    const { emit } = context;
    Emitter.cancel(context);
    emit(EmitType.Error, e);
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

    const receiver2 = (Emitter.receive as any).bind(null, context);
    const cancel = Emitter.cancel.bind(null, context);

    (async () => {
      await Promise.resolve();

      try {
        this.executor(receiver2);
      } catch {
        if (context.open) {
          cancel();
        }
      }
    })();

    return cancel;
  }

  private executor: Action<EmitForm<T, Te>>;
}
