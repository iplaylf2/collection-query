export class PartitionCollector<T> {
  constructor(n: number, step: number) {
    this.n = n;
    this.step = step;
    this.partition = new Array(n);
    this.magic = Math.min(this.n - this.step, 0);
    this.n_count = 0;
    this.step_count = 0;
    this.p_count = 1;
  }

  collect(x: T): [true, T[]] | [false] {
    this.step_count++;
    if (this.step_count > this.step) {
      this.step_count = 1;

      this.p_count++;
    }

    if (this.p_count > 0) {
      this.partition[this.n_count] = x;

      this.n_count++;
      if (this.n_count === this.n) {
        const result = this.partition.slice();

        this.partition.splice(0, this.step);
        this.n_count = this.magic;

        this.p_count--;

        return [true, result];
      }
    }

    return [false];
  }

  getRest() {
    return this.partition;
  }

  private readonly n: number;
  private readonly step: number;
  private readonly partition: T[];
  private readonly magic: number;
  private n_count: number;
  private step_count: number;
  private p_count: number;
}
