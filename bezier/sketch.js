var points = [];
var curvePoints = [];
var counter = 0;
const RADIUS = 10;

function setup() { // **change** void setup() to function setup()
    var canvas = createCanvas(640, 640); // **change** size() to createCanvas()
    canvas.mousePressed(addPoint);

    stroke(0); // stroke() is the same
}

function draw() {
    background(255); // clears background every refresh

    // draw points and line segments
    var positions = generatePositions(points, getLambda(counter++), []);

    positions.forEach(function(levels) {
        levels.forEach(function(currPoint) {
            drawPoints(levels);
            drawLines(levels);
            addPointToCurve(levels);
        })
    })

    // draw curve
    drawCurve(curvePoints);
}

function drawPoints(points) {
    fill(0);
    points.forEach(function(point) {
        ellipse(point.x, point.y, RADIUS)
    })
}

function drawLines(points) {
    noFill();
    beginShape();
    points.forEach(function(point) {
        vertex(point.x, point.y)
    })
    endShape();
}

function drawCurve(points) {
    noFill();
    beginShape();
    points.forEach(function(curve_point) {
        curveVertex(curve_point.x, curve_point.y, 10)
    })
    endShape();
}

/*
Recursive function to generate all of the point positions
given a lambda and the set of parent points. Results accumulate
in the results array.
*/

function generatePositions(points, lambda, results) {
    results.push(points);

    if (points.length <= 1) {
        return results;
    }

    var new_points = calculatePositions(points, lambda);
    return generatePositions(new_points, lambda, results);
}

function calculatePositions(points, lambda) { // this function interpolates
    var positions = []
    for (var i = 0; i < (points.length - 1); i++) {
        var p1 = points[i],
            p2 = points[i + 1]

        positions.push(new Point(p1.x + lambda * (p2.x - p1.x), p1.y + lambda * (p2.y - p1.y)))
    }
    return positions;
}

function Point(x, y, z) {
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
}

function getLambda(counter) {
    return (Math.sin(counter / 100) + 1) / 2;
}

function addPointToCurve(levels) {
    // if there is only one point in levels, then it acts
    // as the curve point.
    if (levels.length == 1) {
        if (curvePoints.length < 1000) {
            curvePoints.push(levels[0]);
        }
    }
}

function addPoint(e) {
    curvePoints = []
    points.push(new Point(e.x, e.y));
}