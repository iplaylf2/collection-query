import { AsyncPullStream, AsyncPushStream } from "../type";
import { create } from "../push/async/create";
import { EmitType } from "../push/type";

export function push<T>(s: AsyncPullStream<T>): AsyncPushStream<T, any> {
  return create(async (emit) => {
    const i = s();
    while (true) {
      try {
        var { done, value } = await i.next();
      } catch (e) {
        emit(EmitType.Error, e);
      }

      if (done) {
        break;
      }

      await emit(EmitType.Next, value);
    }

    emit(EmitType.Complete);
  });
}
