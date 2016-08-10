function generatePositions(points, lambda, results) {
    if (points.length <= 1) {
        return results;
    }

    var new_points = calculatePositions(points, lambda);
    return generatePositions(new_points, lambda, results.concat(new_points));
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

x = generatePositions([{
    x: 1,
    y: 1
}, {
    x: 2,
    y: 2
}, {
    x: 3,
    y: 3
}], .5, [])

console.log(x)

function Point(x, y) {
    this.x = x
    this.y = y
}