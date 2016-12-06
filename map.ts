import {Point, Hex, OffsetCoord, Orientation, Layout} from './lib';

interface Opt {
  Prop?: (col: number, row: number) => any
  mapSize?: number
  canvasWidth?: number
  drawHex?: (CanvasRenderingContext2D, Hex, any) => void
  onclick?: ({h: Hex, o: OffsetCoord}) => void
};

class HexMap {
  constructor(public options:Opt = {}) {
    options.Prop = options.Prop || (() => { return {}; });

    options.mapSize = options.mapSize || 9;
    options.canvasWidth = options.canvasWidth || 600;

    options.drawHex = options.drawHex || this.defaultDrawHex;
    options.onclick = options.onclick || this.defaultOnclick;

    this.canvasWidth = this.options.canvasWidth;

    this.calcEdgeSize();
    this.calcCanvasHeight();

    this.prepareMap();
  }

  public canvasWidth:number;
  public canvasHeight:number;
  public edgeSize:number;
  public w:number;
  public h:number;

  protected size:Point;
  protected origin:Point;
  protected layout:Layout;
  protected map:Hex[] = [];
  protected offsetMap:{ [key: string]: any; } = {};

  public canvas:HTMLCanvasElement;
  public ctx:CanvasRenderingContext2D;

  public defaultDrawHex(ctx:CanvasRenderingContext2D, h:Hex, prop:any) {
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
  }

  public defaultOnclick() {
  }

  protected calcEdgeSize() {
    this.edgeSize = this.canvasWidth / (this.options.mapSize * Math.sqrt(3) + (Math.sqrt(3) / 2));
    this.w = this.edgeSize * 2;
    this.h = this.w;
  }
  protected calcCanvasHeight() {
    var height = ((Math.floor((this.options.mapSize + 1) / 2) * 1.5) - 0.5) * this.h;
    if (this.options.mapSize % 2 === 0) {
      height = height + this.h * 3 / 4;
    }
    height = Math.ceil(height);
    this.canvasHeight = height
  }
  protected prepareMap() {
    this.size = new Point(this.edgeSize, this.edgeSize);
    this.origin = new Point(Layout.pointy.f1 * this.size.x, this.size.y);
    this.layout = new Layout(Layout.pointy, this.size, this.origin);

    for (let r = 0; r < this.options.mapSize; r++) {
      let r_offset = Math.floor(r/2);
      for (let q = -r_offset; q < this.options.mapSize - r_offset; q++) {
        let h = new Hex(q, r, -q-r);
        this.map.push(h);
      }
    }

    for (let h of this.map) {
      let offset:OffsetCoord = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
      this.offsetMap[`${offset.col}_${offset.row}`] = this.options.Prop(offset.col, offset.row);
    }
  }

  public getCanvas() {
    if (this.canvas) {
      return this.canvas;
    }
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.ctx = this.canvas.getContext("2d");

    this.redraw();

    this.canvas.onclick = (event) => {
      this.options.onclick(this.clickThrough(event));
    };

    return this.canvas;
  }

  public getProp(col, row) {
    return this.offsetMap[`${col}_${row}`];
  }

  public setProp(col, row, prop) {
    this.offsetMap[`${col}_${row}`] = prop;
  }

  public redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    for (let h of this.map) {
      let offset:OffsetCoord = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
      let prop = this.offsetMap[`${offset.col}_${offset.row}`];

      this.options.drawHex.call(this, this.ctx, h, this.layout, this.edgeSize, prop);
    }

    this.ctx.restore();
  }

  public clickThrough (event) {
    var x = event.offsetX;
    var y = event.offsetY;
    var p = new Point(x, y);
    var h = Hex.round(Layout.pixelToHex(this.layout, p));
    var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);

    return {
      h: h,
      o: offset
    };
  }
}

export default HexMap;
