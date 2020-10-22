import { Func } from "../type";
import { PullStream } from "../..";
import * as e from "./expect";

export function TestBase(f: Func<PullStream<any>>) {
  test("base", () => {
    const s = f();

    e.ExpectIterable(s());
  });
}

export function TestSameCollection(
  f: Func<PullStream<any>>,
  source: Iterable<any>
) {
  test("same collection", () => {
    const s = f();

    e.ExpectSameCollection(s(), source);
  });
}

export function TestIdempotent(f: Func<PullStream<any>>) {
  test("idempotent", () => {
    const s = f();

    e.ExpectSameCollection(s(), s());
  });
}
