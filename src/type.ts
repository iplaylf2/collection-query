export interface Selector<T, K> {
  (x: T): K;
}

export interface AsyncSelector<T, K> {
  (x: T): Promise<K>;
}

export interface Predicate<T> {
  (x: T): boolean;
}

export interface AsyncPredicate<T> {
  (x: T): Promise<boolean>;
}

export interface Action<T> {
  (x: T): void;
}

export interface AsyncAction<T> {
  (x: T): Promise<void>;
}

export interface Aggregate<T, K> {
  (r: K, x: T): K;
}

export interface AsyncAggregate<T, K> {
  (r: K, x: T): Promise<K>;
}
