# collection-query

A collection processing library.

## feature

- Simple to use.
- The entity which represent the collection is close to the native object.
- Methods are few and common.

## install

``` bash
npm install collection-query
```

## usage

``` typescript
import { take } from "collection-query/pull";

const s = function* () {
  let count = 0;
  while (true) {
    yield count++;
  }
};

const new_s = take(3)(s);

for (const x of new_s()) {
  console.log(x);
}


//print 0 1 2
```

## pull and push

Pull and push are inspired by rxjs.

There are 2 ways to generate data.
- `pull` data: produced passively, consumed actively
- `push` data: produced actively, consumed passively

`collection-query` provides 4 streams to implement the pull and push respectively.

"pull", "async-pull", "push", "async-push"

### pull

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

### push

The streams `push` and `async-push` base on `Emitter`

``` typescript
const push_stream = create(function (emit) {
  emit(EmitType.Next, 0);
  emit(EmitType.Complete);
});
```

``` typescript
const async_push_stream = create_async(function (emit) {
  emit(EmitType.Next, 0);
  emit(EmitType.Complete);
});
```

Push stream and async push stream can generate data synchronously or asynchronously.

## method

`collection-query` provides different set of methods to access the stream, but they almost always have the same name and the same semantics.

``` typescript
import * as pull from "collection-query/pull";
import * as asyncPull from "collection-query/async-pull";
import * as push from "collection-query/push";
import * as asyncPush from "collection-query/async-push";

// they all have a "take" method
```
