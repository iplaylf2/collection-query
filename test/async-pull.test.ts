import "./jest";
import { createFrom, forEach } from "../async-pull";

describe("async pull", () => {
  const data = "collect query";

  describe("createFrom", () => {
    test("same collection", async () => {
      const source = createFrom(data);

      let i = 0;
      for await (const x of source()) {
        expect(x).toBe(data.charAt(i));
        i++;
      }
    });

    test("immutable", async () => {
      const source = createFrom(data);

      for (let count = 2; 0 < count; count--) {
        let i = 0;
        for await (const x of source()) {
          expect(x).toBe(data.charAt(i));
          i++;
        }
      }
    });
  });

  describe("forEach", () => {
    const source = createFrom(data);

    test("run times", async () => {
      const mock_fn = jest.fn();
      await forEach(source, mock_fn);

      expect(mock_fn).toHaveBeenCalledTimes(data.length);
    });

    test("run order", async () => {
      const mock_fn = jest.fn();
      await forEach(source, mock_fn);

      let i = 0;
      for (const x of data) {
        expect(mock_fn.mock.calls[i]?.[0]).toBe(x);
        i++;
      }
    });

    test("run async", async () => {
      const data = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
      const source = createFrom(data);

      const test: number[] = [];
      await forEach(source, async (x) => {
        await new Promise((r) => setTimeout(r, x * 10));
        test.push(x);
      });

      expect(test).toEqual(data);
    });
  });
});
