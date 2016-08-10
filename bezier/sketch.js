var points = [];
var curvePoints = [];
var counter = 0;
var peakLambda = 0;
const RADIUS = 10;
const POINT_COLOR = 255;
const CURVE_COLOR = [10, 100, 100];
const LINE_COLOR = [255, 255, 255]

function setup() { // **change** void setup() to function setup()
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.mousePressed(addPoint);

    stroke(255); // stroke() is the same
}

function draw() {
    background(0); // clears background every refresh

    // draw points and line segments
    var lambda = getLambda(counter++)
    var positions = generatePositions(points, lambda, []);

    positions.forEach(function(levels) {
        levels.forEach(function(currPoint) {
            drawPoints(levels);
            drawLines(levels);
            if (levels.length == 1 && peakLambda < lambda) {
                // if there is only one point in levels, then it acts
                // as the curve point.

                addPointToCurve(levels);
                peakLambda = lambda;
            }
        })
    })

    // draw curve
    drawCurve(curvePoints);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function drawPoints(points) {
    fill(POINT_COLOR);
    points.forEach(function(point) {
        ellipse(point.x, point.y, RADIUS)
    })
}

function drawLines(points) {
    setLineStyle();
    beginShape();
    points.forEach(function(point) {
        vertex(point.x, point.y)
    })
    endShape();
}

function drawCurve(points) {
    setCurveStyle();
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
    return (-1 * Math.cos(counter / 100) + 1) / 2;
}

function addPointToCurve(levels) {
    curvePoints.push(levels[0]);
}

function addPoint(e) {
    curvePoints = [];
    counter = 0;
    peakLambda = 0;
    points.push(new Point(e.x, e.y));
}

function setLineStyle() {
    noFill();
    stroke(LINE_COLOR);
    strokeWeight(2);
}

function setCurveStyle() {
    noFill();
    stroke(CURVE_COLOR);
    strokeWeight(5);
}