import { Hex, Layout, OffsetCoord } from '../lib';
import Map from '../map';

var catCol = 4;
var catRow = 4;
var offset = new OffsetCoord(catCol, catRow);
var cat = OffsetCoord.roffsetToCube(OffsetCoord.ODD, offset);

var map = new Map({
  drawHex: function (ctx, h, prop) {
    let corners = Layout.polygonCorners(this.layout, h);

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

    let center = Layout.hexToPixel(this.layout, h);

    ctx.beginPath();
    ctx.arc(center.x, center.y, 0.5 * this.edgeSize * this.layout.orientation.f3, 0, Math.PI * 2, true);
    if (Hex.equal(h, cat)) {
      ctx.fillStyle = '#99ff66';
    } else if (prop.block) {
      ctx.fillStyle = '#ff9966';
    } else {
      ctx.fillStyle = '#6699ff';
    }
    ctx.fill();
    ctx.closePath();
  },

  onclick: function (data) {
    console.log(data);
  }
});

var c = map.getCanvas();

document.getElementById('container').appendChild(c);

/*
const MAP_SIZE = 9;

var width = 800;

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

  offsetMap[key] = {};
}

var catCol:number = 4;
var catRow:number = 4;
var offset:OffsetCoord = new OffsetCoord(catCol, catRow);
var cat = OffsetCoord.roffsetToCube(OffsetCoord.ODD, offset);

var getRoute = () => {

  for (let col = 0; col < MAP_SIZE; col++) {
    for (let row = 0; row < MAP_SIZE; row++) {
      let offset = new OffsetCoord(col, row)
      let key = `${offset.col}_${offset.row}`;
      offsetMap[key].visited = false;
      offsetMap[key].value = 0;
      if (offsetMap[key].block) {
        offsetMap[key].value = 100;
      }
    }
  }

  let blocks:number = 0;
  let minValue:number = 100;

  let availNeighbors:Hex[] = [];

  let h = cat;
  let offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
  let key = `${offset.col}_${offset.row}`;
  let targetProp = offsetMap[key];
  targetProp.cat = true;

  for (let i = 0; i < 6; i++) {
    let lv1_neighbor = Hex.neighbor(h, i);
    let offset:OffsetCoord = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, lv1_neighbor);
    let key = `${offset.col}_${offset.row}`;
    let targetProp = offsetMap[key];
    let lv1_noroute = false;

    if (targetProp.block) {
      blocks++;
      continue;
    }

    if (offset.col === 0 || offset.row === 0 || offset.col === MAP_SIZE - 1 || offset.row === MAP_SIZE - 1) {
      cat = lv1_neighbor;
      alert('You Lose');
      return;
    }

    for (let col = 0; col < MAP_SIZE; col++) {
      for (let row = 0; row < MAP_SIZE; row++) {
        let offset = new OffsetCoord(col, row)
        let key = `${offset.col}_${offset.row}`;
        offsetMap[key].visited = false;
      }
    }

    let going = true;
    let fringes = [];
    fringes.push([lv1_neighbor]);
    let step:number = 0;

    while (going) {
      step++;

      fringes.push([]);

      for (let h of fringes[step-1]) {
        for (let i = 0; i < 6; i++) {
          let neighbor = Hex.neighbor(h, i);
          let offset:OffsetCoord = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, neighbor);
          let key = `${offset.col}_${offset.row}`;
          let targetProp = offsetMap[key];
          if (targetProp && !targetProp.block && !targetProp.visited && !Hex.equal(neighbor, cat)) {
            targetProp.visited = true;
            fringes[step].push(neighbor);
            if (offset.col === 0 || offset.row === 0 || offset.col === MAP_SIZE - 1 || offset.row === MAP_SIZE - 1) {
              going = false;
            }
          }
        }
      }
      if (fringes[step].length === 0) {
        lv1_noroute = true;
        going = false;
      }
    }

    if (lv1_noroute) {
      targetProp.value = 100;
    } else {
      targetProp.value = step;
    }

    if (targetProp.value < minValue) {
      cat = lv1_neighbor;
      minValue = targetProp.value;
    } else {
      availNeighbors.push(lv1_neighbor);
    }

  }

  if (blocks === 6) {
    alert('You Win');
    return;
  }

  if (minValue === 100) {
    cat = availNeighbors[Math.floor(Math.random() * availNeighbors.length)];
  }

};

var ctx = canvas.getContext("2d");

ctx.font="20px Georgia";

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
    if (Hex.equal(h, cat)) {
      ctx.fillStyle = '#99ff66';
    } else if (prop.block) {
      ctx.fillStyle = '#ff9966';
    } else {
      ctx.fillStyle = '#6699ff';
    }
    ctx.fill();
    // if (prop.value) {
      // ctx.fillStyle = '#ffffff';
      // ctx.fillText(prop.value.toString(), center.x, center.y);
    // }
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

  ctx.restore();

}

for (let col = 0; col < MAP_SIZE; col++) {
  for (let row = 0; row < MAP_SIZE; row++) {
    let offset = new OffsetCoord(col, row)
    let key = `${offset.col}_${offset.row}`;
    let h = OffsetCoord.roffsetToCube(OffsetCoord.ODD, offset);
    if (Hex.equal(h, cat)) {
    } else {
      let ratio = 0.2;
      if (Math.abs(offset.row - catRow) < 2) {
        ratio = 0.15;
        if (Math.abs(offset.col - catCol) < 3) {
          ratio = 0.1;
        }
      }
      offsetMap[key].block = (Math.random() < ratio) ? true : false;
    }
  }
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
  if (!prop.block) {
    prop.block = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    getRoute();
    updateMap();
  }
};

*/
