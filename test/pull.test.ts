import "./jest";
import { createFrom, forEach } from "../pull";

describe("pull", () => {
  const data = "collect query";

  describe("createFrom", () => {
    test("same collection", () => {
      const source = createFrom(data);

      let i = 0;
      for (const x of source()) {
        expect(x).toBe(data.charAt(i));
        i++;
      }
    });

    test("immutable", () => {
      const source = createFrom(data);

      for (let count = 2; 0 < count; count--) {
        let i = 0;
        for (const x of source()) {
          expect(x).toBe(data.charAt(i));
          i++;
        }
      }
    });
  });

  describe("forEach", () => {
    const source = createFrom(data);

    test("run times", () => {
      const mock_fn = jest.fn();
      forEach(source, mock_fn);

      expect(mock_fn).toHaveBeenCalledTimes(data.length);
    });

    test("run order", () => {
      const mock_fn = jest.fn();
      forEach(source, mock_fn);

      let i = 0;
      for (const x of data) {
        expect(mock_fn.mock.calls[i]?.[0]).toBe(x);
        i++;
      }
    });
  });
});
