/* eslint-env browser */

import Map, { Hex, Layout, OffsetCoord } from '../map';
import { prop as _prop } from './tool';

const MAP_SIZE = 9;
const BLOCK_VALUE = 100;

var catCol = 4;
var catRow = 4;
var offset = new OffsetCoord(catCol, catRow);
var cat = OffsetCoord.roffsetToCube(OffsetCoord.ODD, offset);
var newcat = null;

var map = new Map({
  mapSize: MAP_SIZE,
  drawHex: function (ctx, h, layout, edgeSize, prop) {
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

    if (prop.value) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(prop.value.toString(), center.x, center.y);
    }
  },

  onclick: function (data) {
    var h = data.h;
    var prop = data.prop;
    if (!Hex.equal(h, cat) && !prop.block) {
      prop.block = true;
      this.setProp(h, prop);
      catRun(this);
      this.redraw();
    }
  }
});

var catRun = function (map) {
  map.map(function (h) {
    var prop = map.getProp(h);
    prop.visited = false;
    prop.value = 0;
    if (prop.block) {
      prop.value = BLOCK_VALUE;
    }
    map.setProp(prop);
  });

  var blocks = 0;
  var minValue = BLOCK_VALUE;
  var availNeighbors = [];

  for (let i = 0; i < Hex.directions.length; i++) {
    let lv1Neighbor = Hex.neighbor(cat, i);
    let prop = map.getProp(lv1Neighbor);
    let lv1Noroute = false;

    if (prop.block) {
      blocks++;
      continue;
    }

    if (map.isBoundary(lv1Neighbor)) {
      cat = lv1Neighbor;
      alert('You Lose');
      return;
    }

    map.mapProp(_prop('visited', false));

    var going = true;
    var fringes = [];
    var step = 0;

    fringes.push([lv1Neighbor]);

    while (going) {
      step++;

      fringes.push([]);

      for (let h of fringes[step - 1]) {
        for (let i = 0; i < Hex.directions.length; i++) {
          let neighbor = Hex.neighbor(h, i);
          let prop = map.getProp(neighbor);
          if (prop && !prop.block && !prop.visited && !Hex.equal(neighbor, cat)) {
            prop.visited = true;
            map.setProp(neighbor, prop);
            fringes[step].push(neighbor);
            if (map.isBoundary(neighbor)) {
              going = false;
            }
          }
        }
      }

      if (fringes[step].length === 0) {
        lv1Noroute = true;
        going = false;
      }
    }

    if (lv1Noroute) {
      prop.value = 100;
    } else {
      prop.value = step;
    }

    map.setProp(lv1Neighbor, prop);

    if (prop.value < minValue) {
      newcat = lv1Neighbor;
      minValue = prop.value;
    } else {
      availNeighbors.push(lv1Neighbor);
    }
  }

  if (blocks === 6) {
    alert('You Win');
    return;
  }

  if (minValue === 100) {
    newcat = availNeighbors[Math.floor(Math.random() * availNeighbors.length)];
  }

  cat = newcat;
};

map.map(function (h) {
  var prop = this.getProp(h);
  if (!Hex.equal(h, cat)) {
    let ratio = 0.3;
    if (Math.abs(offset.row - catRow) < 2) {
      ratio = 0.2;
      if (Math.abs(offset.col - catCol) < 3) {
        ratio = 0.15;
      }
    }
    prop.block = Math.random() < ratio;
    this.setProp(prop);
  }
});

var c = map.getCanvas();

map.redraw();

document.getElementById('container').appendChild(c);

