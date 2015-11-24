# promise-stack
Stack of function that returns promise instance.

## Usage
```sh
$ npm i promise-stack
```
```js
import PS from 'promise-stack';
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
### set(function or object)
Register argument function to stack.  
return promise instance.
```js
const promise = instance.set(function);
```
#### option
```js
instance.set({
	callback: function,
	priority: number //0...limit of Array
})
```
### size()
Return count queue.
### clear()
Reject() all of queue.
### start(), stop()
Switch of stack.

## Properties
### priority
Priority of queue, first from lesser.  
default 5.

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