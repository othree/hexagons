import { Point, Hex, OffsetCoord, Layout } from './lib';
var MAP_SIZE = 9;
var width = 600;
var singleSideSize = width / (MAP_SIZE * Math.sqrt(3) + (Math.sqrt(3) / 2));
var w = singleSideSize * 2;
var h = w;
var height = ((Math.floor((MAP_SIZE + 1) / 2) * 1.5) - 0.5) * h;
if (MAP_SIZE % 2 === 0) {
    height = height + h * 3 / 4;
}
height = Math.ceil(height);
var canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.getElementById('container').appendChild(canvas);
var size = new Point(singleSideSize, singleSideSize);
var origin = new Point(Layout.pointy.f1 * size.x, size.y);
var layout = new Layout(Layout.pointy, size, origin);
var map = [];
for (var r = 0; r < MAP_SIZE; r++) {
    var r_offset = Math.floor(r / 2);
    for (var q = -r_offset; q < MAP_SIZE - r_offset; q++) {
        // console.log(q,r)
        var h_1 = new Hex(q, r, -q - r);
        map.push(h_1);
    }
}
var offsetMap = {};
for (var _i = 0, map_1 = map; _i < map_1.length; _i++) {
    var h_2 = map_1[_i];
    var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h_2);
    var key = offset.col + "_" + offset.row;
    offsetMap[key] = {};
}
var ctx = canvas.getContext("2d");
var updateMap = function () {
    ctx.save();
    // ctx.translate(mapOffset.x, mapOffset.y);
    for (var _i = 0, map_2 = map; _i < map_2.length; _i++) {
        var h_3 = map_2[_i];
        var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h_3);
        var key = offset.col + "_" + offset.row;
        var prop = offsetMap[key];
        var center = Layout.hexToPixel(layout, h_3);
        ctx.beginPath();
        ctx.arc(center.x, center.y, 0.5 * singleSideSize * layout.orientation.f3, 0, Math.PI * 2, true);
        if (prop.clicked) {
            ctx.fillStyle = '#ff9966';
        }
        else {
            ctx.fillStyle = '#6699ff';
        }
        ctx.fill();
        ctx.closePath();
        var corners = Layout.polygonCorners(layout, h_3);
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.lineTo(corners[4].x, corners[4].y);
        ctx.lineTo(corners[5].x, corners[5].y);
        ctx.lineTo(corners[0].x, corners[0].y);
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
    // ctx.restore();
};
updateMap();
canvas.onclick = function (event) {
    var x = event.offsetX;
    var y = event.offsetY;
    var p = new Point(x, y);
    var h = Hex.round(Layout.pixelToHex(layout, p));
    var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
    console.log(h);
    console.log(offset);
    var key = offset.col + "_" + offset.row;
    var prop = offsetMap[key];
    prop.clicked = !prop.clicked;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateMap();
};
