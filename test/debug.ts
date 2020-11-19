import { push } from "../async-pull";
import { flatten, forEach } from "../async-push";

const p = push(async function* () {
  yield [1, 5, 7];
  yield [2, 4, 5];
  yield [3, 3, 6];
});

forEach(flatten(p), (x) => {
  console.log(x);
});
