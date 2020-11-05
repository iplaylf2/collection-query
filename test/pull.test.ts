import { createFrom, forEach, map, filter } from "../pull";
import { PullStream } from "..";
import "./jest";
import * as t from "./pull/test";

describe("pull", () => {
  describe("create", () => {
    t.TestBase(() => function* () {});
  });

  describe("createFrom", () => {
    const data = "collection-query";

    t.TestTwoCollectionEqual(() => createFrom(data), data, "same collection");
    t.TestIdempotent(() => createFrom(data));
  });

  describe("foreach", () => {
    const s = createFrom("collection-query");

    t.TestCollectionEachIn((f) => forEach(s, f), s());
  });

  describe("map", () => {
    const data = "collection-query";
    const s = createFrom(data);

    t.TestCollectionEachIn((f) => pullAll(map(f)(s)), data);

    const f = (x: any) => x.length;
    const expect = function* () {
      for (const x of data) {
        yield f(x);
      }
    };

    t.TestTwoCollectionEqual(() => map(f)(s), expect(), "map<A[],f> == f<A>[]");
  });

  describe("filter", () => {
    const data = "collection-query";
    const s = createFrom(data);

    t.TestCollectionEachIn((f) => pullAll(filter((x) => (f(x), true))(s)), data);
  });
});

function pullAll(s: PullStream<any>) {
  for (const _ of s());
}
