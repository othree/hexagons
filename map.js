import { Point, Hex, OffsetCoord, Layout } from './lib';
;
var HexMap = (function () {
    function HexMap(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this._map = [];
        this.propMap = {};
        options.Prop = options.Prop || (function () { return {}; });
        options.mapSize = options.mapSize || 9;
        options.canvasWidth = options.canvasWidth || 600;
        options.drawHex = options.drawHex || this.defaultDrawHex;
        options.onclick = options.onclick || this.defaultOnclick;
        this.mapSize = this.options.mapSize;
        this.canvasWidth = this.options.canvasWidth;
        this.calcEdgeSize();
        this.calcCanvasHeight();
        this.prepareMap();
    }
    HexMap.prototype.defaultDrawHex = function (ctx, h, prop) {
        var corners = Layout.polygonCorners(this.layout, h);
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
    };
    HexMap.prototype.defaultOnclick = function () {
    };
    HexMap.prototype.calcEdgeSize = function () {
        this.edgeSize = this.canvasWidth / (this.mapSize * Math.sqrt(3) + (Math.sqrt(3) / 2));
        this.w = this.edgeSize * 2;
        this.h = this.w;
    };
    HexMap.prototype.calcCanvasHeight = function () {
        var height = ((Math.floor((this.mapSize + 1) / 2) * 1.5) - 0.5) * this.h;
        if (this.mapSize % 2 === 0) {
            height = height + this.h * 3 / 4;
        }
        height = Math.ceil(height);
        this.canvasHeight = height;
    };
    HexMap.prototype.prepareMap = function () {
        this.size = new Point(this.edgeSize, this.edgeSize);
        this.origin = new Point(Layout.pointy.f1 * this.size.x, this.size.y);
        this.layout = new Layout(Layout.pointy, this.size, this.origin);
        for (var r = 0; r < this.mapSize; r++) {
            var r_offset = Math.floor(r / 2);
            for (var q = -r_offset; q < this.mapSize - r_offset; q++) {
                var h = new Hex(q, r, -q - r);
                this._map.push(h);
            }
        }
        for (var _i = 0, _a = this._map; _i < _a.length; _i++) {
            var h = _a[_i];
            var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
            this.propMap[h.q + "_" + h.r + "_" + h.s] = this.options.Prop(h, offset);
        }
    };
    HexMap.prototype.getCanvas = function () {
        var _this = this;
        if (this.canvas) {
            return this.canvas;
        }
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.ctx = this.canvas.getContext("2d");
        this.redraw();
        this.canvas.onclick = function (event) {
            _this.options.onclick.call(_this, _this.clickThrough(event));
        };
        return this.canvas;
    };
    HexMap.prototype.getProp = function (h) {
        return this.propMap[h.q + "_" + h.r + "_" + h.s];
    };
    HexMap.prototype.setProp = function (h, prop) {
        this.propMap[h.q + "_" + h.r + "_" + h.s] = prop;
    };
    HexMap.prototype.map = function (f) {
        for (var _i = 0, _a = this._map; _i < _a.length; _i++) {
            var h = _a[_i];
            f.call(this, h);
        }
    };
    HexMap.prototype.mapProp = function (f) {
        this.map(function (h) {
            var prop = this.getProp(h);
            prop = f.call(this, prop);
            this.setProp(h, prop);
        });
    };
    HexMap.prototype.isBoundary = function (h) {
        var offset = OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h);
        return (offset.col === 0 || offset.row === 0 || offset.col === this.mapSize - 1 || offset.row === this.mapSize - 1);
    };
    ;
    HexMap.prototype.redraw = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        for (var _i = 0, _a = this._map; _i < _a.length; _i++) {
            var h = _a[_i];
            var prop = this.propMap[h.q + "_" + h.r + "_" + h.s];
            this.options.drawHex.call(this, this.ctx, h, this.layout, this.edgeSize, prop);
        }
        this.ctx.restore();
    };
    HexMap.prototype.clickThrough = function (event) {
        var x = event.offsetX;
        var y = event.offsetY;
        var p = new Point(x, y);
        var h = Hex.round(Layout.pixelToHex(this.layout, p));
        return {
            h: h,
            o: OffsetCoord.roffsetFromCube(OffsetCoord.ODD, h),
            prop: this.getProp(h)
        };
    };
    return HexMap;
}());
export default HexMap;
export { Point, Hex, OffsetCoord, Orientation, Layout } from './lib';
