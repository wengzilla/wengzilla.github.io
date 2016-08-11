var points = [];
var curvePoints, counter, peakLambda;
const RADIUS = 10;
const CURVE_COLOR = [3, 101, 140];
const COUNTER_SPEED = 150;
var POINT_COLOR;
var drawMode = false;

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.mousePressed(addPoint);
    frameRate(60);
    initialize();
}

function draw() {
    if (!drawMode) {
        background(0); // clears background every refresh
    }

    // draw points and line segments
    var lambda = getLambda(counter)
    var positions = generatePositions(points, lambda, []);

    console.log(positions)

    if (!drawMode || loopCount() < 2) {
        counter++;
    }

    positions.forEach(function(levels) {
        levels.forEach(function(currPoint) {
            if (!drawMode) {
                drawPoints(levels);
            }

            drawLines(levels);

            if (levels.length == 1) {
                // if there is only one point in levels, then it acts
                // as the curve point.
                if (loopCount() < 1) {
                    addPointToCurve(levels);
                }
            }
        })
    })

    // draw curve
    if (!drawMode) {
        drawCurve(curvePoints);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    initialize();
}

function drawPoints(points) {
    setPointStyle();
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
    return (-1 * Math.cos(Math.PI * (counter / COUNTER_SPEED)) + 1) / 2;
}

function addPointToCurve(levels) {
    curvePoints.push(levels[0]);
}

function addPoint(e) {
    initialize();
    points.push(new Point(e.x, e.y));
}

function setLineStyle() {
    noFill();
    stroke(LINE_COLOR);
    strokeWeight(1);
}

function setCurveStyle() {
    noFill();
    stroke(CURVE_COLOR);
    strokeWeight(5);
}

function setPointStyle() {
    noStroke();
    fill(POINT_COLOR);
}

function initialize() {
    curvePoints = [];
    counter = 0;
    peakLambda = 0;
    background(0);

    if (drawMode) {
        LINE_COLOR = [255, 255, 255, 1]; // low opacity
        POINT_COLOR = [0, 0, 0, 1];
    } else {
        LINE_COLOR = [255, 255, 255];
        POINT_COLOR = [255, 255, 255];
    }
}

function keyPressed() {
    if (keyCode == ENTER) {
        drawMode = !drawMode
        initialize();
    } else if (keyCode == ESCAPE) {
        points = [];
        initialize();
    }
}

function loopCount() {
    return Math.floor(counter / COUNTER_SPEED);
}