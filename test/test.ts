import { push } from "../async-pull";
import { EmitType } from "..";

push(async function* () {
  yield 1;
  yield 2;
  yield 3;
})(async (t, x?) => {
  switch (t) {
    case EmitType.Next:
      await new Promise((r) => setTimeout(r, 1000));
      console.log(x);
      break;
    case EmitType.Complete:
      console.log("Complete");
      break;
    case EmitType.Error:
      console.log(x);
      break;
  }
});
