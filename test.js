// modules
import PS from './index';

// var
const ps = new PS();
let count = 0;

/// Events
// キュー登録イベント
ps.on('set', (e)=>{
	count++;
	console.log('set', e);
});
// スタック空イベント、これが最後
ps.on('empty', (e)=>{
	count++;
	console.log('empty', e);
	console.log(`count:${count}`, count===30);
});
// タスク実行後イベント
ps.on('exec', (e)=>{
	count++;
	console.log('exec', e);
});
// スタック初期化イベント
ps.on('clear', (e)=>{
	count++;
	console.log('clear', e);
});
// 開始・停止イベント
ps.on('stop', (e)=>{
	count++;
	console.log('stop', e);
});
ps.on('start', (e)=>{
	count++;
	console.log('start', e);
});

/// Method
// set(function)
ps.set(function(){}).then( ()=>{
	count++;
	console.log('set() normal');
});
// set(function-promise)
ps.set(function(){
	return new Promise( (resolve, reject)=>{
    	resolve();
	});
}).then( ()=>{
	count++;
	console.log('set() promise');
});
// set(object)
ps.set({
	callback(){}
}).then( ()=>{
	count++;
	console.log('set(object)');
});
// stop() => 1sec => start()
ps.set(function(){}).then( ()=>{
	ps.stop();
	count++;
	setTimeout(ps.start.bind(ps), 1000);
	console.log('stop() => 1sec => start()');
});
// size()
ps.set(function(){
	return ps.size();
}).then( (arg)=>{
	count++;
	console.log('size()', arg);
});
// clear()
ps.set({
	callback(){},
	priority: 1000
}).then( ()=>{
	ps.clear();
	count++;
	console.log('clear()');
});

/// catch
// function
ps.set(function(){
	return hoge;
}).catch( (error)=>{
	count++;
    console.log('catch-function', error);
});
// function-promise
ps.set(function(){
	return new Promise( (resolve, reject)=>{
		return hoge;
	});
}).catch( (error)=>{
	count++;
    console.log('catch-function-promise', error);
});
// after clear()
ps.set({
	callback(){},
	priority: 10000
}).catch( (error)=>{
	count++;
	console.log('after clear()', error);
});
