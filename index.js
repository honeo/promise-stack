// Modules
const EventEmitter = require('eventemitter3');
const MultipleArray = require('./multiple-array');

/*
	本体
*/
class PromiseStack extends EventEmitter {
	constructor(){
		super();
		this.stack = new MultipleArray();
		this.enable = true;
		this.priority = 5;
		this.running = false;
	}

	/*
		スタック空にするやつ
			積んである全インスタンスをrejectする
			終了時にイベント発行
	*/
	clear(){
		while( this.size() ){
			const target = this.stack.shift();
			target.reject( Error('promsie-stack: clear') );
		}
		emit.call(this, 'clear');
	}

	/*
		Que登録
			引数が不正ならreject
	*/
	set(callback, option={}){
		if(typeof callback==='function' && option instanceof Object){
			return new Promise( (resolve, reject)=>{
				const obj = {
					callback,
					priority: option.priority || this.priority,
					resolve,
					reject,
				}
				this.stack.push(obj, obj.priority);
				emit.call(this, 'set', obj);
				exec.call(this);
			});
		}else{
			return Promise.reject(Error('invalid argument'));
		}
	};

	/*
		Queカウント
	*/
	size(){
		//console.log('size', this.stack.length);
		return this.stack.length;
	}

	/*
		一時停止 & 再開
			再開後にキュー実行
	*/
	start(){
		this.enable = true;
		emit.call(this, 'start');
		exec.call(this);
	}
	stop(){
		this.enable = false;
		emit.call(this, 'stop');
	}

}

/*
	Que実行
		thisをインスタンスに拘束して実行する
		無効中・実行中・スカったら中止、スカはイベントも
		実行終了時にintervalが設定されていれば遅延して、なければすぐに再実行する
*/
async function exec(){
	//console.log('exec', `running: ${this.running}`, `enable: ${this.enable}`, `size: ${this.size()}`);
	// 既に動いていればスカ
	if( this.running ){
		//console.log('skip');
		return;
	}
	this.running = true;

	while(this.enable && this.size()){
		//console.log('exec-while', `size: ${this.size()}`);
		const target = this.stack.shift();
		await toPromise(target.callback).then( (arg)=>{
			//console.log('exec-then');
			target.resolve(arg);
		}).catch( (error)=>{
			//console.log('exec-catch');
			target.reject(error);
		});
		emit.call(this, 'exec', target);
	}
	// finally
	this.running = false;
	emit.call(this, 'empty');
}

/*
	共通で使うEventEmitter#emitラッパー
		this = instance
*/
function emit(type, target){
	this.emit(type, {
		priority: target && target.priority,
		timeStamp: Date.now(),
		type
	});
}

/*
	通常関数もpromise対応関数も実行後Promiseインスタンスを返す
*/
function toPromise(func){
    return new Promise( (resolve, reject)=>{
        const result = func();
        isPromise(result) ?
            result.then( (arg)=>{
                resolve(arg);
            }).catch( (error)=>{
                reject(error);
            }):
        resolve(result);
    });
}

/*
	引数がPromiseインスタンスかどうか
*/
function isPromise(promise){
	return promise instanceof Promise;
}



module.exports = PromiseStack;
