import { AsyncPushStream, AsyncPullStream } from "../type";
import { Cancel, EmitType } from "../push/type";
import { RaceHandler } from "../common/async/race-handler";

export function pull<T>(s: AsyncPushStream<T>): AsyncPullStream<T> {
  return async function* () {
    const handler = new RaceHandler<T>(1);

    let cancel!: Cancel;
    s(
      async (t, x?) => {
        switch (t) {
          case EmitType.Next:
            (await handler.race(x)) || cancel();
            break;
          case EmitType.Complete:
            handler.end();
            break;
          case EmitType.Error:
            handler.crash(x);
            break;
        }
      },
      (c) => (cancel = c)
    );

    yield* handler;
  };
}
