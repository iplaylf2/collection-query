import { Func } from "../type";
import { PullStream } from "../..";
import * as e from "./expect";
import { Action } from "../../type/type";

export function TestBase(f: Func<PullStream<any>>, name = "base") {
  test(name, () => {
    const s = f();

    e.ExpectIterable(s());
  });
}

export function TestTwoCollectionEqual(
  f: Func<PullStream<any>>,
  source: Iterable<any>,
  name = "two collection equal"
) {
  test(name, () => {
    const s = f();

    e.ExpectSameCollection(s(), source);
  });
}

export function TestIdempotent(f: Func<PullStream<any>>, name = "idempotent") {
  test(name, () => {
    const s = f();

    e.ExpectSameCollection(s(), s());
  });
}

export function TestCollectionEachIn(
  f: Action<Action<any>>,
  source: Iterable<any>,
  name = "collection each in"
) {
  test(name, () => {
    const mf = jest.fn();
    f(mf);

    const args = mf.mock.calls.map((call: any) => call[0]);
    e.ExpectSameCollection(args, source);
  });
}
