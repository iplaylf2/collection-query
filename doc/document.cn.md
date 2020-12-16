# 文档

- [transfer](#transfer)
- [通用的方法](#通用的方法)
  - [从 iterable 创建流](#从-iterable-创建流)
    - [createFrom](#createfrom)
  - [遍历流](#遍历流)
    - [forEach](#foreach)
  - [stream -> stream](#stream---stream)
    - [map](#map)
    - [filter](#filter)
    - [remove](#remove)
    - [take](#take)
    - [takeWhile](#takewhile)
    - [skip](#skip)
    - [skipWhile](#skipwhile)
    - [partition](#partition)
    - [flatten](#flatten)
  - [stream[] -> stream](#stream---stream-1)
    - [concat](#concat)
    - [concatAll](#concatall)
  - [stream -> value](#stream---value)
    - [reduce](#reduce)
    - [count](#count)
    - [include](#include)
    - [every](#every)
    - [some](#some)
    - [first](#first)
    - [last](#last)
- [其他方法](#其他方法)
  - [创建 push 流](#创建-push-流)
    - [create](#create)
  - [stream -> stream](#stream---stream-2)
    - [groupBy](#groupby)
    - [incubate](#incubate)
  - [stream[] -> stream](#stream---stream-3)
    - [race](#race)
- [流之间的转化](#流之间的转化)
  - [`async-pull` -> `async-push`](#async-pull---async-push)
  - [`async-push` -> `async-pull`](#async-push---async-pull)
  - [`async-push` -> `push`](#async-push---push)
  - [`push` -> `async-push`](#push---async-push)

## transfer

``` typescript
function transfer(s: stream, list: []): stream
```

`transfer` 方法使流s遍历list中的方法，得到一个新的流。

**例子**

``` typescript
import { transfer } from "collection-query";
import { map, filter, take } from "collection-query/pull";

const s = function* () {
  while (true) {
    yield;
  }
};

const new_s = transfer(s, [
  map((_) => Math.random()),
  filter((x: number) => x < 0.5),
  take<number>(10),
]);

for (const x of new_s()) {
  console.log(x);
}

```


## 通用的方法


### 从 iterable 创建流

#### createFrom

``` typescript
function createFrom<T>(i: Iterable<T>): Stream<T>
```

### 遍历流

#### forEach

``` typescript
function forEach<T>(s: Stream<T>, f: Action<T>): void
```

### stream -> stream

#### map

``` typescript
function map<T,K>(f: Selector<T, K>): (s: Stream<T>) => stream<K>
```

#### filter

``` typescript
function filter<T>(f: Predicate<T>): (s: Stream<T>) => Stream<T>
stream<K>
```

#### remove

``` typescript
function remove<T>(f: Predicate<T>): (s: Stream<T>) => Stream<T>
stream<K>
```

#### take

``` typescript
function take<T>(n: number): (s: Stream<T>) => Stream<T>
```

#### takeWhile

``` typescript
function takeWhile<T>(f: Predicate<T>): (s: Stream<T>) => Stream<T>
```

#### skip

``` typescript
function skip<T>(n: number): (s: Stream<T>) => Stream<T>
```

#### skipWhile

``` typescript
function skipWhile<T>(f: Predicate<T>): (s: Stream<T>) => Stream<T>
```

#### partition

``` typescript
function partition<T>(n: number): (s: Stream<T>) => Stream<T[]>
```

#### flatten

``` typescript
function flatten<T>(s: Stream<T[]>): Stream<T>
```

### stream[] -> stream

#### concat

``` typescript
function concat<T>(s1: Stream<T>, s2: Stream<T>): Stream<T>
```

#### concatAll

``` typescript
function concatAll<T>([s, ...ss]: Stream<T>[]): Stream<T>
```

### stream -> value

以下的方法如果不是作用在 pull 流上，都会返回 `promise<X>` 。

#### reduce

``` typescript
function reduce<T, K>(s: Stream<T>, f: Aggregate<T, K>, v: K): K
```

#### count

``` typescript
function count(s: Stream<any>): number
```

#### include

``` typescript
function include<T>(s: Stream<T>, x: T): boolean
```

#### every

``` typescript
function every<T>(s: Stream<T>, f: Predicate<T>): boolean
```

#### some

``` typescript
function some<T>(s: Stream<T>, f: Predicate<T>): boolean
```

#### first

``` typescript
function first<T>(s: Stream<T>): T | void
```

#### last

``` typescript
function last<T>(s: Stream<T>): T | void
```

## 其他方法

### 创建 push 流

#### create

用于 `push` and `async-push` 。

``` typescript
function create<T>(executor: Executor<T>): Stream<T>
```

### stream -> stream

#### groupBy

只能用于 `push` 。

``` typescript
function groupBy<T, K>(f: Selector<T, K>): (s: PushStream<T>) => PushStream<[K, PushStream<T>]>
```

#### incubate

用于 `push` 和 `async-push` 。

``` typescript
function incubate<T>(s: Stream<Promise<T>>): Stream<T>
```

### stream[] -> stream

#### race

用于 `async-pull`, `push` 和 `async-push`.

``` typescript
function race<T>(ss: Stream<T>[]): Stream<T>
```

## 流之间的转化

### `async-pull` -> `async-push`

**push**
 
``` typescript
function push<T>(s: AsyncPullStream<T>): AsyncPushStream<T>
```

### `async-push` -> `async-pull`

**pull**

``` typescript
function pull<T>(s: AsyncPushStream<T>): AsyncPullStream<T>
```

### `async-push` -> `push`

**sync**

``` typescript
function sync<T>(s: AsyncPushStream<T>): PushStream<T>
```

### `push` -> `async-push`

**async**

``` typescript
function async<T>(s: PushStream<T>): AsyncPushStream<T>
```