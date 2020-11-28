import { EmitType, transfer } from "..";
import {
  create,
  createFrom,
  forEach,
  map,
  filter,
  remove,
  take,
  takeWhile,
  skip,
  skipWhile,
  partition,
  partitionBy,
  _flatten,
  _incubate,
  concat,
  concatAll,
  zip,
  race,
  reduce,
  count,
  include,
  every,
  some,
  first,
  last,
} from "../async-push";

{
  //create

  create<number>(async (emit) => {
    for (let count = 0; count < 10; count++) {
      await emit(EmitType.Next, count);
    }

    if (Math.random() < 0.5) {
      await emit(EmitType.Complete);
    } else {
      await emit(EmitType.Error, "error");
    }
  });
}

{
  //createFrom

  const list = new Array(10).fill(0).map((_, i) => i);
  createFrom(list);
}

{
  //receive

  const s = createFrom([0, 1, 2, 3]);
  s(async (t, x?) => {
    switch (t) {
      case EmitType.Next:
        console.log(x);
        break;
      case EmitType.Complete:
        console.log("complete");
        break;
      case EmitType.Error:
        console.log("error", x);
        break;
    }
  });

  //print: 0 1 2 3 complete
}

{
  //forEach

  const s = createFrom([0, 1, 2, 3]);
  forEach(s, (x) => {
    console.log(x);
  });

  //print:0 1 2 3 complete
}

{
  //map

  transfer(createFrom([0, 1, 2, 3]), [map((x: number) => x * 10)]);

  //s: 0 10 20 30
}

{
  //filter

  transfer(createFrom([0, 1, 2, 3]), [filter((x: number) => x % 2 === 0)]);

  //s: 0 2
}

{
  //remove

  transfer(createFrom([0, 1, 2, 3]), [remove((x: number) => x % 2 === 0)]);

  //s: 0 2
}

{
  //take

  transfer(createFrom([0, 1, 2, 3]), [take<number>(2)]);

  //s: 0 1
}

{
  //takeWhile

  transfer(createFrom([0, 1, 2, 3]), [takeWhile((x: number) => x < 2)]);

  //s: 0 1
}

{
  //skip

  transfer(createFrom([0, 1, 2, 3]), [skip<number>(2)]);

  //s: 2 3
}

{
  //skipWhile

  transfer(createFrom([0, 1, 2, 3]), [skipWhile((x: number) => x < 2)]);

  //s: 2 3
}

{
  //partition

  transfer(createFrom([0, 1, 2, 3]), [partition<number>(2)]);

  //s: [0,1] [2,3]
}

{
  //partitionBy

  transfer(createFrom([0, 1, 2, 3]), [partitionBy((x: number) => x % 3 !== 0)]);

  //s: [0] [1,2] [3]
}

{
  //_flatten

  transfer(
    createFrom([
      [0, 1],
      [2, 3],
    ]),
    [_flatten<number>()]
  );

  //s: 0 1 2 3
}

{
  //_incubate

  transfer(createFrom([0, 1, 2, 3].map((x) => Promise.resolve(x))), [
    _incubate<number>(),
  ]);

  //no order s: 0 1 2 3
}

/* - - - */

{
  //concat

  concat(createFrom([0, 1]), createFrom([2, 3]));

  //s: 0 1 2 3
}

{
  //concatAll

  concatAll([createFrom([0]), createFrom([1]), createFrom([2, 3])]);

  //s: 0 1 2 3
}

{
  //zip

  zip([createFrom([0]), createFrom([1]), createFrom([2, 3])]);

  //s: [0 1 2]
}

{
  //race

  race([createFrom([0]), createFrom([1]), createFrom([2, 3])]);

  //no order s: 0 1 2 3
}

/* - - - */

{
  //reduce

  reduce(createFrom([0, 1, 2, 3]), (r, c) => r + c, 0);

  //p: 6
}

{
  //count

  count(createFrom([0, 1, 2, 3]));

  //p: 4
}

{
  //include

  include(createFrom([0, 1, 2, 3]), 2);

  //p: true
}

{
  //every

  every(createFrom([0, 1, 2, 3]), (x) => x > 2);

  //p: false
}

{
  //some

  some(createFrom([0, 1, 2, 3]), (x) => x > 2);

  //p: true
}

{
  //first

  first(createFrom([0, 1, 2, 3]));

  //p: 0
}

{
  //last

  last(createFrom([0, 1, 2, 3]));

  //p: 3
}
