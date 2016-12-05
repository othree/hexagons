import {Point, Hex, OffsetCoord, Orientation, Layout} from './lib';

const MAP_SIZE = 9;

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

var size:Point = new Point(singleSideSize, singleSideSize);
var origin:Point = new Point(Layout.pointy.f1 * size.x, size.y);

var layout:Layout = new Layout(Layout.pointy, size, origin);

var map:Hex[] = [];

for (let r = 0; r < MAP_SIZE; r++) {
    let r_offset = Math.floor(r/2);
    for (let q = -r_offset; q < MAP_SIZE - r_offset; q++) {
      // console.log(q,r)
      let h = new Hex(q, r, -q-r);
      map.push(h);
    }
}

var offsetMap = {};

for (let h of map) {
  let offset:OffsetCoord = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
  let key = `${offset.col}_${offset.row}`;

  offsetMap[key] = {
    // 'clicked': true
  };
}

var ctx = canvas.getContext("2d");

var updateMap = () => {

ctx.save();
// ctx.translate(mapOffset.x, mapOffset.y);

for (let h of map) {
  let offset:OffsetCoord = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
  let key = `${offset.col}_${offset.row}`;
  let prop = offsetMap[key];

  let center = Layout.hexToPixel(layout, h);
  ctx.beginPath();
  ctx.arc(center.x, center.y, 0.5 * singleSideSize * layout.orientation.f3, 0, Math.PI*2, true);
  if (prop.clicked) {
    ctx.fillStyle = '#ff9966';
  } else {
    ctx.fillStyle = '#6699ff';
  }
  ctx.fill();
  ctx.closePath();

  let corners = Layout.polygonCorners(layout, h);
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

}

updateMap();

canvas.onclick = event => {
  var x = event.offsetX;
  var y = event.offsetY;
  var p = new Point(x, y);
  var h = Hex.round(Layout.pixelToHex(layout, p));
  var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
  console.log(h);
  console.log(offset);
  let key = `${offset.col}_${offset.row}`;
  let prop = offsetMap[key];
  prop.clicked = !prop.clicked;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateMap();
};
