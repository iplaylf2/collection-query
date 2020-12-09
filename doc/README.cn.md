# collection-query

一个集合处理类库。

[English](https://github.com/Iplaylf2/collection-query/blob/master/README.md) | 中文
-

## 特性

- 使用简单。
- 用来表示集合的实体与原生对象相近。
- 提供的方法数量少且常见。

## 安装

``` bash
npm install collection-query
```

## 用法

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


//打印 0 1 2
```

## pull 和 push

Pull 和 push 启发自 rxjs.

他们是两种生产数据的方式。
- `pull` 数据: 被动生产，主动消费
- `push` 数据: 主动生产，被动消费

`collection-query` 用以下四种流作为 pull 和 push 的实现。

"pull", "async-pull", "push", "async-push"

### pull

流 `pull` and `async-pull` 基于 javascript 的 generator.

``` typescript
const pull_stream = function* () {
  yield 0;
};
```

Pull 流以同步的方式生产数据.

``` typescript
const async_pull_stream = async function* () {
  yield 0;
};
```

Async pull 流以异步的方式生产数据.

### push

流 `push` and `async-push` 基于 `Emitter`

``` typescript
const push_stream = create(function (emit) {
  emit(EmitType.Next, 0);
  emit(EmitType.Complete);
});
```

Push 流既能同步又能异步地生产数据。

``` typescript
const async_push_stream = create_async(function (emit) {
  emit(EmitType.Next, 0);
  emit(EmitType.Complete);
});
```

Async push 流以异步的方式生产数据.

## method

虽然 `collection-query` 用不同的方法集去操作流，但是这些方法基本上拥有同样的名字，也有同样的语义。

``` typescript
import * as pull from "collection-query/pull";
import * as asyncPull from "collection-query/async-pull";
import * as push from "collection-query/push";
import * as asyncPush from "collection-query/async-push";

//例如, 他们都有同样的“take”方法.
```

[文档](https://github.com/Iplaylf2/collection-query/blob/master/doc/document.cn.md)