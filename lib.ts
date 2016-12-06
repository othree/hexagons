// Generated code -- http://www.redblobgames.com/grids/hexagons/

class Point
{
    constructor (public x:number, public y:number) {}
}

class Hex
{
    constructor (public q:number, public r:number, public s:number) {}

    public static add(a:Hex, b:Hex):Hex
    {
        return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }


    public static subtract(a:Hex, b:Hex):Hex
    {
        return new Hex(a.q - b.q, a.r - b.r, a.s - b.s);
    }


    public static scale(a:Hex, k:number):Hex
    {
        return new Hex(a.q * k, a.r * k, a.s * k);
    }

    public static directions:Hex[] = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];

    public static direction(direction:number):Hex
    {
        return Hex.directions[direction];
    }


    public static neighbor(hex:Hex, direction:number):Hex
    {
        return Hex.add(hex, Hex.direction(direction));
    }

    public static diagonals:Hex[] = [new Hex(2, -1, -1), new Hex(1, -2, 1), new Hex(-1, -1, 2), new Hex(-2, 1, 1), new Hex(-1, 2, -1), new Hex(1, 1, -2)];

    public static diagonalNeighbor(hex:Hex, direction:number):Hex
    {
        return Hex.add(hex, Hex.diagonals[direction]);
    }


    public static len(hex:Hex):number
    {
        return (Math.abs(hex.q) + Math.abs(hex.r) + Math.abs(hex.s)) / 2;
    }


    public static distance(a:Hex, b:Hex):number
    {
        return Hex.len(Hex.subtract(a, b));
    }


    public static round(h:Hex):Hex
    {
        var q:number = Math.round(h.q);
        var r:number = Math.round(h.r);
        var s:number = Math.round(h.s);
        var q_diff:number = Math.abs(q - h.q);
        var r_diff:number = Math.abs(r - h.r);
        var s_diff:number = Math.abs(s - h.s);
        if (q_diff > r_diff && q_diff > s_diff)
        {
            q = -r - s;
        }
        else
            if (r_diff > s_diff)
            {
                r = -q - s;
            }
            else
            {
                s = -q - r;
            }
        return new Hex(q, r, s);
    }


    public static lerp(a:Hex, b:Hex, t:number):Hex
    {
        return new Hex(a.q * (1 - t) + b.q * t, a.r * (1 - t) + b.r * t, a.s * (1 - t) + b.s * t);
    }


    public static linedraw(a:Hex, b:Hex):Hex[]
    {
        var N:number = Hex.distance(a, b);
        var a_nudge:Hex = new Hex(a.q + 0.000001, a.r + 0.000001, a.s - 0.000002);
        var b_nudge:Hex = new Hex(b.q + 0.000001, b.r + 0.000001, b.s - 0.000002);
        var results:Hex[] = [];
        var step:number = 1.0 / Math.max(N, 1);
        for (var i = 0; i <= N; i++)
        {
            results.push(Hex.round(Hex.lerp(a_nudge, b_nudge, step * i)));
        }
        return results;
    }

    public static equal(h1:Hex, h2:Hex) {
      return (h1.q === h2.q && h1.r === h2.r && h1.s === h2.s);
    }

}

class OffsetCoord
{
    constructor (public col:number, public row:number) {}
    public static EVEN:number = 1;
    public static ODD:number = -1;

    public static qoffsetFromCube(offset:number, h:Hex):OffsetCoord
    {
        var col:number = h.q;
        var row:number = h.r + (h.q + offset * (h.q & 1)) / 2;
        return new OffsetCoord(col, row);
    }


    public static qoffsetToCube(offset:number, h:OffsetCoord):Hex
    {
        var q:number = h.col;
        var r:number = h.row - (h.col + offset * (h.col & 1)) / 2;
        var s:number = -q - r;
        return new Hex(q, r, s);
    }


    public static roffsetFromCube(offset:number, h:Hex):OffsetCoord
    {
        var col:number = h.q + (h.r + offset * (h.r & 1)) / 2;
        var row:number = h.r;
        return new OffsetCoord(col, row);
    }


    public static roffsetToCube(offset:number, h:OffsetCoord):Hex
    {
        var q:number = h.col - (h.row + offset * (h.row & 1)) / 2;
        var r:number = h.row;
        var s:number = -q - r;
        return new Hex(q, r, s);
    }

}

class Orientation
{
    constructor (public f0:number, public f1:number, public f2:number, public f3:number, public b0:number, public b1:number, public b2:number, public b3:number, public start_angle:number) {}
}

class Layout
{
    constructor (public orientation:Orientation, public size:Point, public origin:Point) {}
    public static pointy:Orientation = new Orientation(Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0, Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0, 0.5);
    public static flat:Orientation = new Orientation(3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0), 2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0, 0.0);

    public static hexToPixel(layout:Layout, h:Hex):Point
    {
        var M:Orientation = layout.orientation;
        var size:Point = layout.size;
        var origin:Point = layout.origin;
        var x:number = (M.f0 * h.q + M.f1 * h.r) * size.x;
        var y:number = (M.f2 * h.q + M.f3 * h.r) * size.y;
        return new Point(x + origin.x, y + origin.y);
    }


    public static pixelToHex(layout:Layout, p:Point):Hex
    {
        var M:Orientation = layout.orientation;
        var size:Point = layout.size;
        var origin:Point = layout.origin;
        var pt:Point = new Point((p.x - origin.x) / size.x, (p.y - origin.y) / size.y);
        var q:number = M.b0 * pt.x + M.b1 * pt.y;
        var r:number = M.b2 * pt.x + M.b3 * pt.y;
        return new Hex(q, r, -q - r);
    }


    public static hexCornerOffset(layout:Layout, corner:number):Point
    {
        var M:Orientation = layout.orientation;
        var size:Point = layout.size;
        var angle:number = 2.0 * Math.PI * (M.start_angle - corner) / 6;
        return new Point(size.x * Math.cos(angle), size.y * Math.sin(angle));
    }


    public static polygonCorners(layout:Layout, h:Hex):Point[]
    {
        var corners:Point[] = [];
        var center:Point = Layout.hexToPixel(layout, h);
        for (var i = 0; i < 6; i++)
        {
            var offset:Point = Layout.hexCornerOffset(layout, i);
            corners.push(new Point(center.x + offset.x, center.y + offset.y));
        }
        return corners;
    }

}

export {Point, Hex, OffsetCoord, Orientation, Layout}
