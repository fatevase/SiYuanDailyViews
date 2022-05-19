let randTools = {}

randTools.stringHashNumber = stringHashNumber
randTools.randomColors = randomColors
randTools.randomColor = randomColor
randTools.colorReverse = colorReverse

export default randTools


function stringHashNumber(str){
	let arr = str.split('');
	return arr.reduce(
	  (hashCode, currentVal) =>
		(hashCode = currentVal.charCodeAt(0) + (hashCode << 6) + (hashCode << 16) - hashCode),
	  0
	);
  };

function randomColor(seed) {
	const max = 14;
	const min = 8;
	let color = '#'
	for(var i = 0; i < 6; i++) {
		let r = Math.floor(fakeRandom(seed+i)*(max-min)+min);
		color += r.toString(16);

	}

	return color;
}

function randomColors(num, seed=null) {
	if(seed == null) {
		seed = Math.random()
	}

	let colors = []
	for (let i = 0; i < num; i++) {
		colors.push(randomColor(seed + i))
	}
	return colors;
}

/**
 *  fake random color generator
 * @param {Any} seed 
 * @returns 
 */
function fakeRandom(seed=null){
	if(seed==null){
		seed = Math.random()
	}
	seed = stringHashNumber(seed+"0")
	return Math.abs(Math.sin(seed));
}





/**
 * 16进制色值获取反色设置方法
 * @param  {String} oldColor 为16进制色值的字符串（例：'#000000'）
 * @return {String} 返回反色的色值（例：'#ffffff'）
 * 不一定要完全的反色，可以加点偏移量使得两色看起来舒服
 */
 function colorReverse(oldColor){
	let color_offest = 0x999999;
	oldColor = '0x' + oldColor.replace(/#/g, '');
	let str = '000000' + (0xFFFFFF - oldColor + color_offest).toString(16);
	console.log(str.substring(str.length - 6, str.length));
	return '#'+ str.substring(str.length - 6, str.length);
 }
 