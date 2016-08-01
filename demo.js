(function() {
  var canvas = document.getElementById('canvas')
  var context = canvas.getContext('2d');
  var clickedElement = null;
  var mouseDown = false;
  var ray = null;

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

  function addText() {
    context.font = "30px Arial";
    if (polygon == null) {
      context.fillText("Click to draw a polygon!",100,100);
    }
  }
  addText();

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
      var ray = new Edge(new Point(e.x, e.y), new Point(GRID_SIZE, e.y));
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
    draw();

    if (polygon.contains(cursorPosition)) {
      context.fillStyle = "#FF0000";
      context.fillText("You are in!",100,100);
    } else {
      context.fillStyle = "#0000FF";
      context.fillText("You are out!",100,100);
    }

    if (!mouseDown) {
      cursorPosition.draw(context);
    } else if (mouseDown && clickedElement) {
      clickedElement.onDrag(cursorPosition.x, cursorPosition.y);
      clickedElement.draw(context);
    }
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

  function Edge(p, q) {
    return {
      p: p,
      q: q,
      strokeStyle: "#000000",
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
        this.strokeStyle = "#0000FF"
      },
      decolor: function() {
        this.strokeStyle = "#000000"
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
        var ray = new Edge(point, new Point(GRID_SIZE, point.y));
        
        for (i in edges) {
          edge = edges[i];
          if (edge.intersects(ray) && this.shouldCount(edge, ray)) {
            edge.color();
            sum += 1;
          } else {
            edge.decolor()
          }
        }

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
      },
      shouldCount: function(edge, ray) {
        return !(edge.intersectsVertex(ray) && edge.isBelow(ray));
      }
    }
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    addText();

    points.forEach(function(point) {
      context.fillStyle = "#000"
      point.draw(context);
    })

    edges.forEach(function(edge) {
      edge.draw(context);
    })
  }
})();