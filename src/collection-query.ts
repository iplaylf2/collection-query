export function pipe(list: any[]) {
  return (s: any) => list.reduce((r, f) => f(r), s);
}
