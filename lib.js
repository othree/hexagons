// Generated code -- http://www.redblobgames.com/grids/hexagons/
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Hex = (function () {
    function Hex(q, r, s) {
        this.q = q;
        this.r = r;
        this.s = s;
    }
    Hex.add = function (a, b) {
        return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    };
    Hex.subtract = function (a, b) {
        return new Hex(a.q - b.q, a.r - b.r, a.s - b.s);
    };
    Hex.scale = function (a, k) {
        return new Hex(a.q * k, a.r * k, a.s * k);
    };
    Hex.direction = function (direction) {
        return Hex.directions[direction];
    };
    Hex.neighbor = function (hex, direction) {
        return Hex.add(hex, Hex.direction(direction));
    };
    Hex.diagonalNeighbor = function (hex, direction) {
        return Hex.add(hex, Hex.diagonals[direction]);
    };
    Hex.len = function (hex) {
        return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2;
    };
    Hex.distance = function (a, b) {
        return Hex.len(Hex.subtract(a, b));
    };
    Hex.round = function (h) {
        var q = Math.round(h.q);
        var r = Math.round(h.r);
        var s = Math.round(h.s);
        var q_diff = Math.abs(q - h.q);
        var r_diff = Math.abs(r - h.r);
        var s_diff = Math.abs(s - h.s);
        if (q_diff > r_diff && q_diff > s_diff) {
            q = -r - s;
        }
        else if (r_diff > s_diff) {
            r = -q - s;
        }
        else {
            s = -q - r;
        }
        return new Hex(q, r, s);
    };
    Hex.lerp = function (a, b, t) {
        return new Hex(a.q * (1 - t) + b.q * t, a.r * (1 - t) + b.r * t, a.s * (1 - t) + b.s * t);
    };
    Hex.linedraw = function (a, b) {
        var N = Hex.distance(a, b);
        var a_nudge = new Hex(a.q + 0.000001, a.r + 0.000001, a.s - 0.000002);
        var b_nudge = new Hex(b.q + 0.000001, b.r + 0.000001, b.s - 0.000002);
        var results = [];
        var step = 1.0 / Math.max(N, 1);
        for (var i = 0; i <= N; i++) {
            results.push(Hex.round(Hex.lerp(a_nudge, b_nudge, step * i)));
        }
        return results;
    };
    Hex.equal = function (h1, h2) {
        return (h1.q === h2.q && h1.r === h2.r && h1.s === h2.s);
    };
    return Hex;
}());
Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
Hex.diagonals = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];
var OffsetCoord = (function () {
    function OffsetCoord(col, row) {
        this.col = col;
        this.row = row;
    }
    OffsetCoord.qoffsetFromCube = function (offset, h) {
        var col = h.q;
        var row = h.r + (h.q + offset * (h.q & 1)) / 2;
        return new OffsetCoord(col, row);
    };
    OffsetCoord.qoffsetToCube = function (offset, h) {
        var q = h.col;
        var r = h.row - (h.col + offset * (h.col & 1)) / 2;
        var s = -q - r;
        return new Hex(q, r, s);
    };
    OffsetCoord.roffsetFromCube = function (offset, h) {
        var col = h.q + (h.r + offset * (h.r & 1)) / 2;
        var row = h.r;
        return new OffsetCoord(col, row);
    };
    OffsetCoord.roffsetToCube = function (offset, h) {
        var q = h.col - (h.row + offset * (h.row & 1)) / 2;
        var r = h.row;
        var s = -q - r;
        return new Hex(q, r, s);
    };
    return OffsetCoord;
}());
OffsetCoord.EVEN = 1;
OffsetCoord.ODD = -1;
var Orientation = (function () {
    function Orientation(f0, f1, f2, f3, b0, b1, b2, b3, start_angle) {
        this.f0 = f0;
        this.f1 = f1;
        this.f2 = f2;
        this.f3 = f3;
        this.b0 = b0;
        this.b1 = b1;
        this.b2 = b2;
        this.b3 = b3;
        this.start_angle = start_angle;
    }
    return Orientation;
}());
var Layout = (function () {
    function Layout(orientation, size, origin) {
        this.orientation = orientation;
        this.size = size;
        this.origin = origin;
    }
    Layout.hexToPixel = function (layout, h) {
        var M = layout.orientation;
        var size = layout.size;
        var origin = layout.origin;
        var x = (M.f0 * h.q + M.f1 * h.r) * size.x;
        var y = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    };
    Layout.pixelToHex = function (layout, p) {
        var M = layout.orientation;
        var size = layout.size;
        var origin = layout.origin;
        var pt = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q = M.b0 * pt.x + M.b1 * pt.y;
        var r = M.b2 * pt.x + M.b3 * pt.y;
        return new Hex(q, r, -q - r);
    };
    Layout.hexCornerOffset = function (layout, corner) {
        var M = layout.orientation;
        var size = layout.size;
        var angle = 2.0 * Math.PI * (M.start_angle - corner) / 6;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    };
    Layout.polygonCorners = function (layout, h) {
        var corners = [];
        var center = Layout.hexToPixel(layout, h);
        for (var i = 0; i < 6; i++) {
            var offset = Layout.hexCornerOffset(layout, i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    };
    return Layout;
}());
Layout.pointy = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
Layout.flat = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);
export { Point, Hex, OffsetCoord, Orientation, Layout };
