import { pipe, EmitType } from "..";
import {
  create,
  take,
  groupBy,
  map,
  filter,
  count,
  incubate,
  forEach,
} from "../push";

const s = create(async (emit) => {
  let count = 200;
  while (0 < count) {
    emit(EmitType.Next, count--);
  }
});

void s;

const new_s = pipe([
  take(100),
  groupBy((x: number) => x % 10),
  map(async ([k, s]: [any, any]) => {
    s = filter((x: number) => x % 3 === 0)(s);
    const r = await count(s);
    return [k, r];
  }),
  incubate,
])(s);

forEach(new_s, (x) => {
  console.log(x);
});

(async () => {
  await new Promise((r) => setTimeout(r, 10000));
})();
