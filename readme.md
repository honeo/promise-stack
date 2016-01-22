# promise-stack
[honeo/promise-stack](https://github.com/honeo/promise-stack)  
[promise-stack](https://www.npmjs.com/package/promise-stack)

## なにこれ
Promiseインスタンスを返す関数スタック。  
setした関数を順に実行する。  
実行した関数がPromiseインスタンスを返せばそのresolveまで待ち、違えば即座に次の関数を実行する。

## 使い方
```sh
$ npm i promise-stack
```
```js
const PS = require('promise-stack');
const ps = new PS();

// example: normal function
ps.set(function(){
	return 'hoge';
}).then( (arg)=>{
	console.log(arg); //"hoge"
});

// example: promise function
function setTimeoutPromise(){
	return new Promise( (resolve, reject)=>{
	    setTimeout(resolve, 1000);
	});
}
for(let i=0; i<60; i++){
	ps.set(setTimeoutPromise).then( (arg)=>{
		console.log(i); //0...59, lastly after one minute
	});
}
```

## Method
### set(function [, {...}])
引数の関数をスタックに積んで対になるPromiseインスタンスを返す。
```js
const promise = instance.set(function);
```
#### option
```js
instance.set(function, {
	priority: number //0...
})
```
### size()
Return number of queue.
### clear()
Reject() all of queue.
### start(), stop()
Switch of stack.

## Properties

### priority
指定のない場合のスタックの優先度、標準は5。

### interval
スタックの実行間隔ms、標準は0。

## Event
[primus/eventemitter3](https://github.com/primus/eventemitter3) is base.
```js
instance.on('type', (e)=>{
	console.log(e); //Object{...}
});
```
### type : timing
**set** : #set() execution after.  
**clear** : #clear() execution after.  
**empty** : when stack of empty.  
**exec** : queue(function) execution after.  
**start** : #start() execution after.  
**stop** : #stop() execution after.  
