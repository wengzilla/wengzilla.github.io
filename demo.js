(function() {
  var canvas = document.getElementById('canvas')
  var context = canvas.getContext('2d');
  var clickedElement = null;
  var mouseDown = false;

  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);

  var points = [], edges = [], texts = [], polygon = null, polygonClosed = false;
  var ray = new Ray();

  const GRID_SIZE = 2000, IN_COLOR = "#83AA30", OUT_COLOR = "#E04500", HIGHLIGHT_COLOR = "#1499D3";

  canvas.addEventListener("click", clickListener);
  canvas.addEventListener("mousemove", mouseMoveListener);

  function initialize() {
    texts[0] = new Text("PLEASE DRAW SHAPE", 100, 100);
    draw();
  }
  initialize();

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
      canvas.addEventListener("mousedown", mouseDownListener);
      canvas.addEventListener("mousemove", mouseMoveListener);
      canvas.addEventListener("mouseup", mouseUpListener);
      canvas.removeEventListener("click", clickListener);

      str = ""
      edges.forEach(function(edge) {
        str += edge.toString() + " "
      })
      console.log(str)
    } else {
      points.push(new Point(x, y));
    }

    if (points.length > 1) {
      edges.push(new Edge(points[points.length - 2], points[points.length - 1]));
    }

    draw();
  }

  function mouseDownListener(e) {
    mouseDown = true;
    
    points.forEach(function(point){
      if (point.detectClick(e.x, e.y)) {
        clickedElement = point;
      }
    });

    if (clickedElement == null) {
      clickedElement = ray;
    }
  }

  function mouseUpListener(e) {
    clickedElement = null;
    mouseDown = false;
  }

  function mouseMoveListener(e) {
    var x = e.x, y = e.y;
    var cursorPosition = new Point(x, y);
    ray.onDrag(e.x, e.y)

    if (polygon) {
      if (polygon.contains(cursorPosition)) {
        texts[0] = new Text("IN", 100, 100);
        cursorPosition.fillStyle = IN_COLOR;
      } else {
        texts[0] = new Text("OUT", 100, 100);
        cursorPosition.fillStyle = OUT_COLOR;
      }
    }

    draw();
    cursorPosition.draw(context);

    if (mouseDown && clickedElement) {
      clickedElement.onDrag(cursorPosition.x, cursorPosition.y);
      clickedElement.draw(context);
    }
  }

  function Text(string, x, y) {
    return {
      string: string,
      x: x,
      y: y,
      fillStyle: "#FFFFFF",
      fontStyle: "50px Roboto Slab",
      draw: function(context) {
        context.font = this.fontStyle
        context.fillStyle = this.fillStyle;
        context.fillText(this.string, this.x, this.y);
      }
    }
  }

  function Point(x, y) {
    return {
      x: x,
      y: y,
      radius: 8,
      fillStyle: "#FFFFFF",
      detectClick: function(x, y) {
        return (y > this.y - 2 * this.radius && y < this.y + 2 * this.radius 
        && x > this.x - 2 * this.radius && x < this.x + 2 * this.radius);
      },
      draw: function(context) {
        context.beginPath();   
        context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        context.linewidth = 15;
        context.fillStyle = this.fillStyle;
        context.fill();
      },
      onDrag: function(x, y) {
        this.x = x;
        this.y = y;
      },
      toString: function() {
        return "(" + x + ", " + y + ")";
      }
    };
  }

  function Ray() {
    return {
      p: null,
      q: null,
      strokeStyle: "#FFFFFF",
      draw: function(context) {
        context.beginPath();
        context.strokeStyle = this.strokeStyle;
        context.moveTo(this.p.x, this.p.y);
        context.lineTo(this.q.x, this.q.y);
        context.lineWidth = 4;
        context.stroke();
      },
      onDrag: function(x, y) {
        this.p = new Point(x, y)
        this.q = new Point(GRID_SIZE, y)
        this.draw(context)
      },
      toString: function() {
        return p.toString() + " -> " + q.toString();
      }
    }
  }

  function Edge(p, q) {
    return {
      p: p,
      q: q,
      strokeStyle: "#FFF",
      midpoint: function() {
        return Point((p.x + q.x) / 2, (p.y + q.y) / 2);
      },
      contains: function(point) {
        point.x < Math.max(p.x, q.x) && point.x > Math.min(p.x, q.x) &&
          point.y < Math.max(p.y, q.y) && point.y > Math.min(p.y, q.y) &&
          this._orientation(p, q, point) == 0
      },
      draw: function(context) {
        context.beginPath();
        context.strokeStyle = this.strokeStyle;
        context.moveTo(this.p.x, this.p.y);
        context.lineTo(this.q.x, this.q.y);
        context.lineWidth = 4;
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
      },
      intersectsVertex: function(ray) {
        if (ray.p.y !== ray.q.y) {
          throw "Ray is not a horizontal line"
        }

        return (this.p.y == ray.p.y || this.q.y == ray.p.y)
      },
      isBelow: function(ray) {
        if (ray.p.y !== ray.q.y) {
          throw "Ray is not a horizontal line"
        }

        return ray.p.y >= this.p.y && ray.p.y >= this.q.y
      },
      onDrag: function(x, y) {
        this.p = new Point(x, y)
        this.draw(context)
      },
      color: function() {
        this.strokeStyle = HIGHLIGHT_COLOR;
      },
      decolor: function() {
        this.strokeStyle = "#FFFFFF"
      },
      toString: function() {
        return p.toString() + " -> " + q.toString();
      }
    }
  }

  function Polygon(edges) {
    return {
      edges: edges,
      isInside: function(point) {
        var sum = 0;
        for (i in edges) {
          edge = edges[i];
          if (edge.intersects(ray) && this.shouldCount(edge, ray)) {
            edge.color();
            sum += 1;
          } else {
            edge.decolor()
          }
        }

        if (sum % 2 == 1) {
          ray.strokeStyle = IN_COLOR
          return true
        } else {
          ray.strokeStyle = OUT_COLOR
          return false
        }
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
      },
      shouldCount: function(edge, ray) {
        return !(edge.intersectsVertex(ray) && edge.isBelow(ray));
      }
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    texts.forEach(function(text) {
      text.draw(context)
    })

    points.forEach(function(point) {
      point.draw(context);
    })

    edges.forEach(function(edge) {
      edge.draw(context);
    })
  }
})();