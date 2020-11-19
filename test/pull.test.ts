import { createFrom, forEach, map, filter, remove } from "../pull";
import { PullStream } from "..";
import "./jest";
import * as t from "./pull/test";
import * as e from "./pull/expect";

describe("pull", () => {
  describe("create", () => {
    t.TestBase(() => function* () {});
  });

  describe("createFrom", () => {
    t.TestEmptyCollection((f) => {
      const empty = createFrom(new Array(0));
      for (const _ of empty()) {
        f();
      }
    });

    const data = randomData();

    t.TestTwoCollectionEqual(() => createFrom(data), data, "same collection");
    t.TestIdempotent(() => createFrom(data));
  });

  describe("foreach", () => {
    t.TestEmptyCollection((f) => forEach(EMPTY, f));

    const data = randomData();
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => forEach(s, f),
      () => data.map((x) => [x])
    );
  });

  describe("map", () => {
    t.TestEmptyCollection((f) => pullAll(map(f)(EMPTY)));

    const data = randomData();
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => pullAll(map(f)(s)),
      () => data.map((x) => [x])
    );

    t.TestCollectionEachOut(
      () => Math.random(),
      (f) => toArray(map(f)(s)),
      (r1) => r1,
      "map<f,a[]> == f<a>[]"
    );
  });

  describe("filter", () => {
    t.TestEmptyCollection((f) => {
      const p = () => (f(), true);
      pullAll(filter(p)(EMPTY));
    });

    const data = randomData();
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => {
        const p = (x: any) => (f(x), true);
        return pullAll(filter(p)(s));
      },
      () => data.map((x) => [x])
    );

    test("two way", () => {
      const mf = jest.fn(() => Math.random() < 0.5);
      const r1 = toArray(filter(mf)(s));

      const out_array = mf.mock.results.map((result: any) => result.value);
      const r2 = data.filter((_, i) => out_array[i]);

      e.ExpectSameCollection(r1, r2);
    });
  });

  describe("remove", () => {
    t.TestEmptyCollection((f) => {
      const p = () => (f(), true);
      pullAll(remove(p)(EMPTY));
    });

    const data = randomData();
    const s = createFrom(data);

    t.TestCollectionEachIn(
      (f) => {
        const p = (x: any) => (f(x), true);
        return pullAll(remove(p)(s));
      },
      () => data.map((x) => [x])
    );

    test("two way", () => {
      const mf = jest.fn(() => Math.random() < 0.5);
      const r1 = toArray(remove(mf)(s));

      const out_array = mf.mock.results.map((result: any) => result.value);
      const r2 = data.filter((_, i) => !out_array[i]);

      e.ExpectSameCollection(r1, r2);
    });
  });
});

const EMPTY: PullStream<never> = function* () {};

function randomData(length = 10) {
  return new Array(length).fill(0).map(() => Math.random());
}

function pullAll(s: PullStream<any>) {
  for (const _ of s());
}

function toArray(s: PullStream<any>) {
  return Array.from(s());
}
