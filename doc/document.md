# Document

- [transfer](#transfer)
- [common method](#common-method)
  - [create from iterable](#create-from-iterable)
    - [createFrom](#createfrom)
  - [each stream](#each-stream)
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
- [other method](#other-method)
  - [push stream create](#push-stream-create)
    - [create](#create)
  - [stream -> stream](#stream---stream-2)
    - [groupBy](#groupby)
    - [incubate](#incubate)
  - [stream[] -> stream](#stream---stream-3)
    - [race](#race)
- [stream convert](#stream-convert)
  - [`async-pull` -> `async-push`](#async-pull---async-push)
  - [`async-push` -> `async-pull`](#async-push---async-pull)
  - [`async-push` -> `push`](#async-push---push)
  - [`push` -> `async-push`](#push---async-push)

## transfer

``` typescript
function transfer(s: stream, list: []): stream
```

`transfer` is a method that threads the stream through the list.

**example**

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


## common method


### create from iterable

#### createFrom

``` typescript
function createFrom<T>(i: Iterable<T>): Stream<T>
```

### each stream

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

If the stream is not a "pull" stream, the following methods always return `promise<X>`.

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

## other method

### push stream create

#### create

Support for `push` and `async-push`.

``` typescript
function create<T>(executor: Executor<T>): Stream<T>
```

### stream -> stream

#### groupBy

Only support for `push`.

``` typescript
function groupBy<T, K>(f: Selector<T, K>): (s: PushStream<T>) => PushStream<[K, PushStream<T>]>
```

#### incubate

Support for `push` and `async-push`.

``` typescript
function incubate<T>(s: Stream<Promise<T>>): Stream<T>
```

### stream[] -> stream

#### race

Support for `async-pull`, `push` and `async-push`.

``` typescript
function race<T>(ss: Stream<T>[]): Stream<T>
```

## stream convert

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