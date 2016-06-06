var randomShot = {};

randomShot.random = Math.random;//defualt randomizer

randomShot.next = function() {
	var possible = "abcdefghij";
	var y = Math.round(this.random() * 9) + 1;
	var x = possible.charAt(Math.round(this.random() * 9));
	return { x: x, y: y };
}

module.exports = randomShot;