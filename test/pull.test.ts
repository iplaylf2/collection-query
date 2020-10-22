import { createFrom } from "../pull";
import "./jest";
import * as t from "./pull/test";

describe("pull", () => {
  describe("create", () => {
    t.TestBase(() => function* () {});
  });

  describe("createFrom", () => {
    const data = "collection-query";

    t.TestSameCollection(() => createFrom(data), data);
    t.TestIdempotent(() => createFrom(data));
  });
});
