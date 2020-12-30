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
    - [scan](#scan)
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
- [回调签名](#回调签名)
- [PullStream](#pullstream)
- [AsyncPullStream](#asyncpullstream)
- [PushStream](#pushstream)
  - [receiver](#receiver)
    - [从 receiver 中抛出异常](#从-receiver-中抛出异常)
  - [cancel](#cancel)
  - [expose](#expose)
  - [executor](#executor)
    - [从 executor 中抛出异常](#从-executor-中抛出异常)
    - [emit 的返回值](#emit-的返回值)
  - [单播](#单播)
- [AsyncPushStream](#asyncpushstream)
  - [receiver](#receiver-1)
  - [emit](#emit)

## transfer

``` typescript
function transfer(s: stream, list: []): stream
```

`transfer` 方法使流s遍历list中的方法，得到一个新的流。

**例子**

``` typescript
import { transfer } from "collection-query";
import { map, filter, take } from "collection-query/pull";

// 创建一个 pull 流
const s = function* () {
  while (true) {
    yield;
  }
};

// 将流转化成另一个流
const new_s = transfer(s, [
  map((_) => Math.random()),
  filter((x: number) => x < 0.5),
  take<number>(10),
]);

// 遍历 pull 流里的数据
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

#### scan

``` typescript
function scan<T, K>(f: Aggregate<T, K>, v: K): (s: Stream<T>) => Stream<K>>
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

以下的方法如果不是作用在 PullStream 上，都会返回 `promise<X>` 。

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

## 回调签名

[定义文件](https://github.com/Iplaylf2/collection-query/blob/master/src/type.ts)

## PullStream

PullStream 实际上是 javascript 标准内置对象 generator function 的别名。

*generator 详情见 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)*

`collection-query` 提供一系列方法操作 PullStream。它们都在`collection-query/pull`之中。

## AsyncPullStream

AsyncPullStream 实际上是 javascript 标准内置对象 async generator function 的别名。

*async generator 详情见 [ES9](https://www.ecma-international.org/ecma-262/9.0/#sec-asyncgenerator-objects)*

`collection-query` 提供一系列方法操作 AsyncPullStream。它们都在 `collection-query/async-pull`之中。

## PushStream

**PushStream 的声明：**

``` typescript
function PushStream<T>(receiver: ReceiveForm<T>, expose?: Action<Cancel>): Cancel
```

**用例：**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { createFrom } from "collection-query/push";

// 通过 [1, 2, 3, 4] 创建 PushStream
const s: PushStream<number> = createFrom([1, 2, 3, 4]);

// 消费 PushStream
s((t: EmitType, x?: number) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 打印：

// next 1
// next 2
// next 3
// next 4
// completed
```

### receiver

`receiver` 是 PushStream 的一个参数，用来消费数据。

当流发射数据时，`receiver` 会被反复地调用直到流被关闭。

`receiver` 接受两个参数，emit type 和 x 。

有3种 emit 枚举有表示3种状况。
- `EmitType.Next`: 从流接收数据，此时 x 代表数据。
- `EmitType.Complete`: 从关闭的流接收完成的信号，此时 x 是空当。
- `EmitType.Error`:  从关闭的流接收出错的信号，此时 x 代表错误。

#### 从 receiver 中抛出异常

如果有一个异常从 receiver 中抛出，流会被关闭，并接着往外抛出异常。但是流不会发射`EmitType.Error`的信号。

**用例**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { createFrom } from "collection-query/push";

// 通过 [1, 2, 3, 4] 创建 PushStream
const s: PushStream<number> = createFrom([1, 2, 3, 4]);

// 消费 PushStream
s((t: EmitType, x?: number) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      if (x! > 2) {
        // 从 receiver 中抛出异常
        throw "x > 2";
      }
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 不会被打印
console.log("after consume"); 

// 打印：

// next 1
// next 2
// next 3

// ------
// Process exited because uncaught exception

```

### cancel

PushStream 在执行的时候接收`receiver`参数并返回一个`cancel`函数。调用`cancel`会把流给关闭。

**用例**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// 创建一个 PushStream
const s: PushStream<number> = create((emit) => {
  emit(EmitType.Next, 1);
  emit(EmitType.Next, 2);
  emit(EmitType.Next, 3);

  setTimeout(() => {
    // PushStream 已经关闭了

    console.log("after 10 ms");
    // 执行这条语句，但什么都不会发生
    emit(EmitType.Next, 4); 
    // 执行这条语句，但什么都不会发生
    emit(EmitType.Next, 5);
  }, 10);
});

// 消费 PushStream
const cancel = s((t: EmitType, x?: number) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 关闭流
cancel();

// 打印：

// next 1
// next 2
// next 3
// after 10 ms

```

### expose

`expose` 是 PullStream 的可选参数，它可以在流被消费前把`cancel`暴露出来。

**用例**

``` typescript
import { PushStream, EmitType, Cancel } from "collection-query";
import { createFrom } from "collection-query/push";

// 通过 [1, 2, 3, 4] 创建 PushStream
const s: PushStream<number> = createFrom([1, 2, 3, 4]);

let cancel: Cancel;

// 消费 PushStream
s(
  (t: EmitType, x?: number) => {
    switch (t) {
      case EmitType.Next:
        console.log("next", x);
        if (x! > 2) {
          // 关闭流
          cancel(); 
        }
        break;
      case EmitType.Complete:
        console.log("completed");
        break;
      case EmitType.Error:
        console.log("error", x);
        break;
    }
  },
  // 暴露 cancel
  (c) => (cancel = c)
);

// 打印：

// next 1
// next 2
// next 3

```

### executor

**create 的声明：**

``` typescript
function create<T>(executor: Executor<T>): PushStream<T>
```

`executor` 是一个函数，会在流开始消费时执行。

**executor 的声明：**

``` typescript
function executor<T>(emit: EmitForm<T>): void
```

当流开始消费时，会把它的`emit`传入 executor 并执行。流通过`emit`生成数据。

**用例**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// 创建一个 PushStream
const s: PushStream<number> = create((emit) => {
  // 不会马上执行
  console.log("executor is executed");
  emit(EmitType.Next, 1);
  emit(EmitType.Next, 2);
  emit(EmitType.Next, 3);
  emit(EmitType.Next, 4);
  emit(EmitType.Complete);
});

console.log("after creating stream");

console.log("start to consume");

// 消费 PushStream
s((t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 打印：

// after creating stream
// start to consume
// executor is executed
// next 1
// next 2
// next 3
// next 4
// completed

```

#### 从 executor 中抛出异常

当一个异常从 executor 中抛出，流会发射 error 信号及其异常信息。

**用例**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// 创建一个 PushStream
const s: PushStream<number> = create((emit) => {
  emit(EmitType.Next, 1);
  emit(EmitType.Next, 2);
  // 从 executor 中抛出异常
  throw "some errors";
  emit(EmitType.Next, 3);
  emit(EmitType.Next, 4);
  emit(EmitType.Complete);
});

// 消费 PushStream
s((t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 打印：

// next 1
// next 2
// error some errors

```

#### emit 的返回值

`emit` 会返回一个布尔值表示流是否处于打开的状态。

**用例**

``` typescript
import { PushStream, EmitType, Cancel } from "collection-query";
import { create } from "collection-query/push";

// 创建一个 PushStream
const s: PushStream<number> = create((emit) => {
  let count = 0;
  while (true) {
    const open = emit(EmitType.Next, count++);
    if (!open) {
      return;
    }
  }
});

let cancel!: Cancel;
// 消费 PushStream
s(
  (t, x?) => {
    switch (t) {
      case EmitType.Next:
        console.log("next", x);
        if (x > 2) {
          // 关闭流
          cancel();
        }
        break;
      case EmitType.Complete:
        console.log("completed");
        break;
      case EmitType.Error:
        console.log("error", x);
        break;
    }
  },
  //  暴露cancel
  (c) => (cancel = c)
);

// 打印：

// next 0
// next 1
// next 2
// next 3

```

### 单播

PushStream 是单播的。意味着每个消费中的 receiver 都有单独的 PushStream 执行环境。

**示例**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// 创建一个 PushStream
const s: PushStream<number> = create(async (emit) => {
  let count = 3;
  while (0 < count--) {
    emit(EmitType.Next, count);
    // 延迟 100ms
    await new Promise((r) => setTimeout(r, 100));
  }
  emit(EmitType.Complete);
});

console.log("consume A");

// 消费 PushStream
s((t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("receiverA", "next", x);
      break;
    case EmitType.Complete:
      console.log("receiverA", "completed");
      break;
    case EmitType.Error:
      console.log("receiverA", "error", x);
      break;
  }
});

console.log("consume B");

// 消费 PushStream
s((t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("receiverB", "next", x);
      break;
    case EmitType.Complete:
      console.log("receiverB", "completed");
      break;
    case EmitType.Error:
      console.log("receiverB", "error", x);
      break;
  }
});

// 打印：

// consume A
// receiverA next 2
// consume B
// receiverB next 2
// receiverA next 1
// receiverB next 1
// receiverA next 0
// receiverB next 0
// receiverA completed
// receiverB completed

```

## AsyncPushStream

AsyncPushStream 和 PushStream 类似。 以下会展示它们不同的地方。

### receiver

AsyncPushStream 的 receiver 返回一个 promise，可以用来阻塞流的下一次数据。

**用例**

``` typescript
import { AsyncPushStream, EmitType } from "collection-query";
import { createFrom } from "collection-query/async-push";

// 通过 [1, 2, 3, 4] 创建 AsyncPushStream
const s: AsyncPushStream<number> = createFrom([1, 2, 3, 4]);

// 消费 AsyncPushStream
s(async (t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      // 延迟 100ms
      await new Promise((r) => setTimeout(r, 100));
      console.log("100ms later", x);
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 打印：

// next 1
// 100ms later 1
// next 2
// 100ms later 2
// next 3
// 100ms later 3
// next 4
// 100ms later 4
// completed

```

### emit

emit 的返回值是一个 promise，可以用来 await 该次消费。

**用例**

``` typescript
import { AsyncPushStream, EmitType } from "collection-query";
import { create } from "collection-query/async-push";

// 创建一个 AsyncPushStream
const s: AsyncPushStream<number> = create(async (emit) => {
  let count = 3;
  while (0 < count--) {
    // await 直到该次消费完成
    await emit(EmitType.Next, count);
    console.log("after emit", count);
  }
  emit(EmitType.Complete);
});

// 消费 AsyncPushStream
s(async (t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      // 延迟 100ms
      await new Promise((r) => setTimeout(r, 100));
      console.log("100ms later", x);
      break;
    case EmitType.Complete:
      console.log("completed");
      break;
    case EmitType.Error:
      console.log("error", x);
      break;
  }
});

// 打印：

// next 2
// 100ms later 2
// after emit 2
// next 1
// 100ms later 1
// after emit 1
// next 0
// 100ms later 0
// after emit 0
// completed

```
