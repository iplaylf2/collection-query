export function pipe<T = any, K = T>(list: any[]): (x: T) => K {
  return (s) => list.reduce((r, f) => f(r), s);
}
