import { forEach } from "../pull";

forEach(
  function* () {
    yield 1;
    yield 2;
    yield 3;
  },
  (x) => {
    console.log(x);
  }
);