import { EmitType, transfer } from "..";
import { create, createFrom, map, filter, forEach } from "../async-push";

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
