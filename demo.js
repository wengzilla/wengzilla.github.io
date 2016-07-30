(function() {
  var canvas = document.getElementById('canvas'), context = canvas.getContext('2d');

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  var points = [], edges = [], polygon = null, polygonClosed = false;
  const GRID_SIZE = 10000;

  canvas.addEventListener("click", clickListener);

  function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          draw(); 
  }
  resizeCanvas();

  function clickListener(e) {
    var x = e.x, y = e.y;

    if (points.length > 0 && points[0].detectClick(x, y)) {
      points.push(points[0]);
      polygon = new Polygon(edges);
      canvas.addEventListener("mousemove", mouseMoveListener);
      canvas.removeEventListener("click", clickListener)
    } else {
      points.push(new Point(x, y));
    }

    if (points.length > 1) {
      edges.push(new Edge(points[points.length - 2], points[points.length - 1]));
    }

    draw();
  }

  function mouseMoveListener(e) {
    var x = e.x, y = e.y;
    var cursorPosition = new Point(x, y);

    draw();
    if (polygon.contains(cursorPosition)) {
      context.fillStyle = "#FF0000";
    } else {
      context.fillStyle = "#0000FF";
    }
    cursorPosition.draw(context);
  }

  function Point(x, y) {
    return {
      x: x,
      y: y,
      radius: 8,
      detectClick: function(x, y) {
        return (y > this.y - 2 * this.radius && y < this.y + 2 * this.radius 
        && x > this.x - 2 * this.radius && x < this.x + 2 * this.radius);
      },
      draw: function(context) {
        context.beginPath();   
        context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        context.linewidth = 15;
        context.fill();
      }
    };
  }

  function Edge(p, q) {
    return {
      p: p,
      q: q,
      midpoint: function() {
        return Point((p.x + q.x) / 2, (p.y + q.y) / 2);
      },
      contains: function(point) {
        point.x <= Math.max(p.x, q.x) && point.x >= Math.min(p.x, q.x) &&
            point.y <= Math.max(p.y, q.y) && point.y >= Math.min(p.y, q.y) &&
            this._orientation(p, q, point) == 0
      },
      draw: function(context) {
        context.beginPath();
        context.moveTo(this.p.x, this.p.y);
        context.lineTo(this.q.x, this.q.y);
        context.lineWidth = 2;
        context.stroke();
      },
      _orientation: function(p1, p2, p3) {
        var diff = (p2.y - p1.y) * (p3.x - p2.x) - (p3.y - p2.y) * (p2.x - p1.x);
        if (diff < 0) {
          return -1; //counterclockwise
        } else if (diff == 0) {
          return 0; // collinear
        } else {
          return 1; // clockwise
        }
      },
      intersects: function(edge) {
        var o1 = this._orientation(this.p, this.q, edge.p)
        var o2 = this._orientation(this.p, this.q, edge.q)
        var o3 = this._orientation(edge.p, edge.q, this.p)
        var o4 = this._orientation(edge.p, edge.q, this.q)

        return o1 != o2 && o3 != o4
      }
    }
  }

  function Polygon(edges) {
    return {
      edges: edges,
      isInside: function(point) {
        var sum = 0;
        var ray = new Edge(point, new Point(GRID_SIZE, GRID_SIZE));
        
        edges.forEach(function(edge) {
          if (edge.intersects(ray)) {
            sum = sum + 1;
          }
        })

        return (sum % 2 == 1) // if odd, then point is inside of polygon
      },
      isOnEdge: function(point) {
        edges.forEach(function(edge) {
          if (edge.contains(point)) {
            return true;
          }
        })
      },
      contains: function(point) {
        return this.isInside(point) || this.isOnEdge(point);
      }
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(function(point) {
      context.fillStyle = "#000"
      point.draw(context);
    })

    edges.forEach(function(edge) {
      edge.draw(context);
    })
  }
})();