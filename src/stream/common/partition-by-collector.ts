import { Selector } from "../../type";

export class PartitionByCollector<T> {
  constructor(f: Selector<T, any>, sf: Selector<T, any>) {
    this.f = f;
    this.sf = sf;
    this.partition = [];
    this.step = [];
    this.step_count = 0;
    this.p_count = 1;
    this.start = false;
  }

  collect(x: T) {
    const s_key = this.sf(x);

    if (!this.start) {
      this.start = true;

      this.s_key = s_key;
    }

    if (s_key === this.s_key) {
      this.step_count++;
    } else {
      this.step.push(this.step_count);
      this.step_count = 1;

      this.p_count++;
    }

    if (this.p_count > 0) {
      const p_key = this.f(x);

      if (!this.start) {
        this.p_key = p_key;
      }

      if (p_key === this.p_key) {
        this.partition.push(x);
      } else {
        const result = this.partition.slice();

        if (this.step.length === 0) {
          this.partition.splice(0);
        } else {
          const step = this.step.shift();
          this.partition.splice(0, step!);
        }

        this.partition.push(x);

        this.p_count--;

        return [true, result];
      }
    }

    return [false];
  }

  getRest() {
    return this.partition;
  }

  private readonly f: Selector<T, any>;
  private readonly sf: Selector<T, any>;
  private readonly partition: T[];
  private readonly step: number[];
  private step_count: number;
  private p_count: number;
  private start: boolean;
  private p_key: any;
  private s_key: any;
}
