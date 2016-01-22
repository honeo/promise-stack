/*
	任意の数の配列をラップしたオブジェクトを返す
		Methodはpush,shiftのみ
			pushは独自仕様
		Propはlengthのみ
			高速化のため手動で±する
*/
function MultipleArray(){
	const arrArr = [];
	let _length = 0;
	this.__defineGetter__('length', function(){
		return _length;
	});
	// 本家と違って引数2は追加する配列番号
	this.push = function(value, length=5){
		if( !arrArr[length] ){
			arrArr[length] = [];
		}
		arrArr[length].push(value);
		return _length++;
	}
	// 本家と同じ
	this.shift = function(){
		const result = arrArr.find( (arr)=>{
			return arr && arr.length;
		});
		if(result){
			_length--;
			return result.shift();
		}
	}
}

module.exports = MultipleArray;
