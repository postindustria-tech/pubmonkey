String.prototype.hexDecode = function () {
    var j;
    var hexes = this.split("\\x");
    var back = "";
    for (j = 1; j < hexes.length; j++) {
        var xhex = hexes[j];
        var hex = xhex.slice(0, 2);
        var value = xhex.slice(2).replace(/\\\\/g, '\\');
        back += String.fromCharCode(parseInt(hex, 16)) + value;
    }
    return back;
};