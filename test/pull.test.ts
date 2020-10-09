import "./jest"
import { forEach } from "../pull";

describe("pull", () => {
  const data = Array.from("collect query");

  // todo; add by method
  const stream_source = data[Symbol.iterator].bind(data);

  describe("forEach", () => {
    test("run times", () => {
      const mockFn = jest.fn();
      forEach(stream_source, mockFn);

      expect(mockFn.mock.calls.length).toBe(data.length);
    });
    
    test("run order", () => {
      const mockFn = jest.fn();
      forEach(stream_source, mockFn);

      let i = 0;
      for (const x of data) {
        expect(mockFn.mock.calls[i]?.[0]).toBe(x);
        i++;
      }
    });
  });
});
