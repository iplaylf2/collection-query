# collection-query

A collection processing library.

English | [中文](https://github.com/Iplaylf2/collection-query/blob/master/doc/README.cn.md)
-

## Feature

- Simple to use.
- The entity which represent the collection is close to the native object.
- Methods are few and common.

## Install

``` bash
npm install collection-query
```

## Usage

``` typescript
import { take } from "collection-query/pull";

// Create a pull stream
const s = function* () {
  let count = 0;
  while (true) {
    yield count++;
  }
};

// Convert the stream to another
const new_s = take(3)(s);

// Each the pull stream
for (const x of new_s()) {
  console.log(x);
}


// Print 0 1 2
```

## Pull and push

Pull and push are inspired by rxjs.

There are 2 ways to generate data.
- `pull` data: Produced passively, consumed actively
- `push` data: Produced actively, consumed passively

`collection-query` provides 4 streams to implement the pull and push respectively.

"pull", "async-pull", "push", "async-push"

### Pull

The streams `pull` and `async-pull` base on javascript generator.

``` typescript
const pull_stream = function* () {
  yield 0;
};
```

Pull stream always generates data synchronously.

``` typescript
const async_pull_stream = async function* () {
  yield 0;
};
```

Async pull stream always generates data asynchronously.

### Push

The streams `push` and `async-push` base on `Emitter`

``` typescript
const push_stream = create(function (emit) {
  emit(EmitType.Next, 0);
  emit(EmitType.Complete);
});
```

Push stream can generate data synchronously or asynchronously.

``` typescript
const async_push_stream = create_async(function (emit) {
  emit(EmitType.Next, 0);
  emit(EmitType.Complete);
});
```

Async push stream always generates data asynchronously.

## Method

`collection-query` provides different set of methods to access the stream, but they almost always have the same name and the same semantics.

``` typescript
import * as pull from "collection-query/pull";
import * as asyncPull from "collection-query/async-pull";
import * as push from "collection-query/push";
import * as asyncPush from "collection-query/async-push";

// For example, they all have a "take" method.
```

[Document](https://github.com/Iplaylf2/collection-query/blob/master/doc/document.md)