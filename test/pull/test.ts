import { Func } from "../type";
import { PullStream } from "../..";
import * as e from "./expect";

export function TestBase(f: Func<PullStream<any>>) {
  test("base", () => {
    const s = f();

    e.ExpectIterable(s());
  });
}
