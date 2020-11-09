import { Func, Selector } from "../type";
import { PullStream } from "../..";
import * as e from "./expect";

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
  f1: Selector<(...args: any[]) => void, any>,
  f2: (r1: any) => Iterable<any>,
  name = "collection each in"
) {
  test(name, () => {
    const mf = jest.fn();
    const r1 = f1(mf);

    const in_array = mf.mock.calls.map((call: any) => call);

    const expect = f2(r1);

    e.ExpectSameCollection(in_array, expect);
  });
}

export function TestCollectionEachOut(
  f1: Selector<() => any, any>,
  f2: (r1: any) => Iterable<any>,
  name = "collection each out"
) {
  test(name, () => {
    const mf = jest.fn(() => Math.random());
    const r1 = f1(mf);

    const out_array = mf.mock.results.map((result: any) => result.value);

    const expect = f2(r1);

    e.ExpectSameCollection(out_array, expect);
  });
}
