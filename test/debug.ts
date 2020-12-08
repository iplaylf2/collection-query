import { transfer, PushStream, EmitType } from "collection-query";
import {
  create,
  take,
  groupBy,
  map,
  filter,
  count,
  _incubate,
  forEach,
} from "collection-query/push";

const s = create<number>((emit) => {
  let count = 0;
  while (true) {
    console.log("at create " + count);
    const open = emit(EmitType.Next, count++);
    if (!open) {
      break;
    }
  }
});

void s;

const new_s = transfer(s, [
  take(100),
  groupBy((x: number) => x % 10),
  map(async ([k, s]: [number, PushStream<number>]) => {
    s = transfer(s, [
      map((x) => {
        console.log("at group", x);
        return x;
      }),
      filter((x: number) => x % 3 === 0),
    ]);

    const r = await count(s);

    await new Promise((r) => setTimeout(r, Math.random() * 10));

    return [k, r];
  }),
  _incubate<[number, number]>(),
]);

void new_s;

forEach(new_s, (x) => {
  console.log(x);
});

((second: number) =>
  new Promise((r) => setTimeout(r, 1000 * second)).then(() =>
    console.log(`${second}s`)
  ))(10);
