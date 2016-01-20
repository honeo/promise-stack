// Modules
const EventEmitter = require('eventemitter3');

/*
	本体
*/
class PromiseStack extends EventEmitter {
	constructor(){
		super();
		this.stack = createMultiArray();
		this.enable = true;
		this.priority = 5;
		this.running = false;
		this.interval = 0;
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
		Que実行
			無効中・実行中・スカったら中止、スカはイベントも
			実行終了時にintervalが設定されていれば遅延して、なければすぐに再実行する
	*/
	exec(){
		if( this.running || !this.enable ){
			return;
		}else if( !this.size() ){
			emit.call(this, 'empty');
			return;
		}
		this.running = true;

		const target = this.stack.shift();
		toPromise(
			target.callback
		).then( (arg)=>{
			target.resolve(arg);
		}).catch( (error)=>{
			target.reject(error);
		}).then( ()=>{
		// finally
			emit.call(this, 'exec', target);
			this.running = false;
			typeof this.interval ?
				this.setTimeout(this.exec.bind(this), interval):
				this.exec();
		});
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
				this.exec();
			});
		}else{
			return Promise.reject(Error('invalid argument'));
		}
	};

	/*
		Queカウント
	*/
	size(){
		return this.stack.length;
	}

	/*
		一時停止 & 再開
			再開後にキュー実行
	*/
	start(){
		this.enable = true;
		emit.call(this, 'start');
		this.exec();
	}
	stop(){
		this.enable = false;
		emit.call(this, 'stop');
	}

}

/*
	共通で使うemitラッパー
		this = instance
*/
function emit(type, target){
	const obj = {
		priority: target && target.priority,
		size: this.size(),
		target: this,
		timestamp: Date.now(),
		type
	}
	this.emit(type, obj);
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
function isPromise(arg){
	return typeof arg==='object' && arg.constructor===Promise;
}

/*
	任意の数の配列をラップしたオブジェクトを返す
		Methodはpush,shiftのみ
			pushは独自仕様
		Propはlengthのみ
			高速化のため手動で±する
*/
function createMultiArray(){
	const arrArr = [];
	const obj = {
		length: 0
	}
	// 本家と違って引数2は追加する配列番号
	obj.push = function(value, length=5){
		if( !arrArr[length] ){
			arrArr[length] = [];
		}
		arrArr[length].push(value);
		return obj.length++;
	}
	// 本家と同じ
	obj.shift = function(){
		const result = arrArr.find( (arr)=>{
			return arr && arr.length;
		});
		if(result){
			obj.length--;
			return result.shift();
		}
	}
	return obj;
}

module.exports = PromiseStack;
