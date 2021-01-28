# Document

- [transfer](#transfer)
- [Common method](#common-method)
  - [Create from iterable](#create-from-iterable)
    - [createFrom](#createfrom)
  - [Each stream](#each-stream)
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
- [Other method](#other-method)
  - [Push stream create](#push-stream-create)
    - [create](#create)
  - [stream -> stream](#stream---stream-2)
    - [groupBy](#groupby)
    - [incubate](#incubate)
  - [stream[] -> stream](#stream---stream-3)
    - [race](#race)
- [Stream convert](#stream-convert)
  - [`async-pull` -> `async-push`](#async-pull---async-push)
  - [`async-push` -> `async-pull`](#async-push---async-pull)
  - [`async-push` -> `push`](#async-push---push)
  - [`push` -> `async-push`](#push---async-push)
- [Callback signature](#callback-signature)
- [PullStream](#pullstream)
- [AsyncPullStream](#asyncpullstream)
- [PushStream](#pushstream)
  - [receiver](#receiver)
    - [Throw exception in receiver](#throw-exception-in-receiver)
  - [cancel](#cancel)
  - [expose](#expose)
  - [executor](#executor)
    - [Throw exception in executor](#throw-exception-in-executor)
    - [Return of emit](#return-of-emit)
  - [Unicast](#unicast)
- [AsyncPushStream](#asyncpushstream)
  - [receiver](#receiver-1)
  - [emit](#emit)

## transfer

``` typescript
function transfer(s: stream, list: []): stream
```

`transfer` is a method that threads the stream through the list.

**example**

``` typescript
import { transfer } from "collection-query";
import { map, filter, take } from "collection-query/pull";

// Create a pull stream
const s = function* () {
  while (true) {
    yield;
  }
};

// Convert the stream to another
const new_s = transfer(s, [
  map((_) => Math.random()),
  filter((x: number) => x < 0.5),
  take<number>(10),
]);

// Each the pull stream
for (const x of new_s()) {
  console.log(x);
}

```


## Common method


### Create from iterable

#### createFrom

``` typescript
function createFrom<T>(i: Iterable<T>): Stream<T>
```

### Each stream

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

If the stream is not a PullStream, the following methods always return `promise<X>`.

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

## Other method

### Push stream create

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

## Stream convert

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

## Callback signature

[definition file](https://github.com/Iplaylf2/collection-query/blob/master/src/type.ts)

## PullStream

PullStream is an alias for generator function, which is a standard built-in object in javascript.

*Find more details about generator in [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)*

`collection-query` provides a series of methods to assess PullStream. They all in `collection-query/pull`.

## AsyncPullStream

AsyncPullStream is an alias for async generator function, which is a standard built-in object in javascript.

*Find more details about async generator in [ES9](https://www.ecma-international.org/ecma-262/9.0/#sec-asyncgenerator-objects)*

`collection-query` provides a series of methods to assess AsyncPullStream. They all in `collection-query/async-pull`.

## PushStream

**Type of PushStream:**

``` typescript
function PushStream<T>(receiver: ReceiveForm<T>, expose?: Action<Cancel>): Cancel
```

**Usage:**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { createFrom } from "collection-query/push";

// Create a PushStream from [1, 2, 3, 4]
const s: PushStream<number> = createFrom([1, 2, 3, 4]);

// Consume the PushStream
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

// Print:

// next 1
// next 2
// next 3
// next 4
// completed
```

### receiver

The parameter `receiver` in PushStream is a function for consuming data.

When the stream emits data, `receiver` will be called repeatedly until it is closed.

`receiver` accepts two arguments, emit type and x.

There are three emit enums that represents three states.
- `EmitType.Next`: Received data from the stream, and x is the data.
- `EmitType.Complete`: Received completed sign from the stream, and x is void.
- `EmitType.Error`: Received error from the stream, and x is the error.

After receive `EmitType.Complete` or `EmitType.Error` , the stream will be closed.

#### Throw exception in receiver

When a exception thrown in receiver, the stream will be closed and throw it out again. But stream does not emit `EmitType.Error`.

**example**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { createFrom } from "collection-query/push";

// Create a PushStream from [1, 2, 3, 4]
const s: PushStream<number> = createFrom([1, 2, 3, 4]);

// Consume the PushStream
s((t: EmitType, x?: number) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      if (x! > 2) {
        // Throw exception in receiver
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

// No print
console.log("after consume");

// Print:

// next 1
// next 2
// next 3

// ------
// Process exited because uncaught exception

```

### cancel

PushStream accepts `receiver` and return the `cancel` function. Call the `cancel` will close the stream.

**usage**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// Create a PushStream
const s: PushStream<number> = create((emit) => {
  emit(EmitType.Next, 1);
  emit(EmitType.Next, 2);
  emit(EmitType.Next, 3);

  setTimeout(() => {
    // Stream is already closed

    console.log("after 10 ms");
    // Execute the statement, but do nothing
    emit(EmitType.Next, 4);
    // Execute the statement, but do nothing
    emit(EmitType.Next, 5);
  }, 10);
});

// Consume the PushStream
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

// Close the stream
cancel();

// Print:

// next 1
// next 2
// next 3
// after 10 ms

```

### expose

`expose` is an optional parameter of PullStream, which will expose the `cancel` before consuming.

**usage**

``` typescript
import { PushStream, EmitType, Cancel } from "collection-query";
import { createFrom } from "collection-query/push";

// Create a PushStream from [1, 2, 3, 4]
const s: PushStream<number> = createFrom([1, 2, 3, 4]);

let cancel: Cancel;

// Consume the PushStream
s(
  (t: EmitType, x?: number) => {
    switch (t) {
      case EmitType.Next:
        console.log("next", x);
        if (x! > 2) {
          // Close the stream
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
  // Expose the cancel
  (c) => (cancel = c)
);

// Print:

// next 1
// next 2
// next 3

```

### executor

**Type of create:**

``` typescript
function create<T>(executor: Executor<T>): PushStream<T>
```

`executor` is a function to be executed when stream starts to consume.

**Type of executor:**

``` typescript
function executor<T>(emit: EmitForm<T>): void
```

At the time when the stream starts to consume, it will pass its `emit` to executor and execute. Stream generates data by its `emit`.

**usage**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// Create a PushStream
const s: PushStream<number> = create((emit) => {
  // Do not execute immediately.
  console.log("executor is executed");
  emit(EmitType.Next, 1);
  emit(EmitType.Next, 2);
  emit(EmitType.Next, 3);
  emit(EmitType.Next, 4);
  emit(EmitType.Complete);
});

console.log("after creating stream");

console.log("start to consume");

// Consume the PushStream
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

// Print:

// after creating stream
// start to consume
// executor is executed
// next 1
// next 2
// next 3
// next 4
// completed

```

#### Throw exception in executor

When a exception thrown in executor, the stream will emit error sign with exception.

**usage**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// Create a PushStream
const s: PushStream<number> = create((emit) => {
  emit(EmitType.Next, 1);
  emit(EmitType.Next, 2);
  // Throw exception in executor
  throw "some errors";
  emit(EmitType.Next, 3);
  emit(EmitType.Next, 4);
  emit(EmitType.Complete);
});

// Consume the PushStream
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

// Print:

// next 1
// next 2
// error some errors

```

#### Return of emit

`emit` return a boolean value to show whether the stream is open.

**usage**

``` typescript
import { PushStream, EmitType, Cancel } from "collection-query";
import { create } from "collection-query/push";

// Create a PushStream
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
// Consume the PushStream
s(
  (t, x?) => {
    switch (t) {
      case EmitType.Next:
        console.log("next", x);
        if (x > 2) {
          // Close the stream
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
  // Expose the cancel
  (c) => (cancel = c)
);

// Print:

// next 0
// next 1
// next 2
// next 3

```

### Unicast

PushStream is unicast that each consumed receiver owns an independent execution of the PushStream.

**example**

``` typescript
import { PushStream, EmitType } from "collection-query";
import { create } from "collection-query/push";

// Create a PushStream
const s: PushStream<number> = create(async (emit) => {
  let count = 3;
  while (0 < count--) {
    emit(EmitType.Next, count);
    // Delay 100ms
    await new Promise((r) => setTimeout(r, 100));
  }
  emit(EmitType.Complete);
});

console.log("consume A");

// Consume the PushStream
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

// Consume the PushStream
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

// Print:

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

AsyncPushStream is similar to PushStream. There will show difference following.

### receiver

AsyncPushStream's receiver return a promise that will block next data of the stream.

**usage**

``` typescript
import { AsyncPushStream, EmitType } from "collection-query";
import { createFrom } from "collection-query/async-push";

// Create a AsyncPushStream from [1, 2, 3, 4]
const s: AsyncPushStream<number> = createFrom([1, 2, 3, 4]);

// Consume the AsyncPushStream
s(async (t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      // Delay 100ms
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

// Print:

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

The return of emit is a promise that can be await for consuming.

**usage**

``` typescript
import { AsyncPushStream, EmitType } from "collection-query";
import { create } from "collection-query/async-push";

// Create a AsyncPushStream
const s: AsyncPushStream<number> = create(async (emit) => {
  let count = 3;
  while (0 < count--) {
    // await util this consumption is over
    await emit(EmitType.Next, count);
    console.log("after emit", count);
  }
  emit(EmitType.Complete);
});

// Consume the AsyncPushStream
s(async (t, x?) => {
  switch (t) {
    case EmitType.Next:
      console.log("next", x);
      // Delay 100ms
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

// Print:

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