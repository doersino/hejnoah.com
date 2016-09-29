// get body background color
var bg = window.getComputedStyle(document.body, null).getPropertyValue("background-color");

// based on http://stackoverflow.com/a/4090628
function rgb2hex(rgb) {
     if (rgb.search("rgb") == -1) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
     }
}

bg = rgb2hex(bg)

// set canvas dimensions
poly = document.getElementById("poly")
c = poly.getContext("2d")

w = window.innerWidth
h = window.innerHeight

if (window.devicePixelRatio) {
    r = window.devicePixelRatio
    poly.style.width = w + "px"
    poly.style.height = h + "px"
    poly.setAttribute("width", w * r)
    poly.setAttribute("height", h * r)
    w = w * r
    h = h * r
} else {
    poly.setAttribute("width", w)
    poly.setAttribute("height", h)
}

// randomness
r = function() { return Math.random() }
rr = function() { return 2 * r() - r() }
rsq = function() { return r() * r() }

// euclidean distance
function eucl(p, q) {
    return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2))
}

// rotation of p around o, based on http://stackoverflow.com/a/2259502
function rotate(o, p, angle) {
    var s = Math.sin(angle);
    var c = Math.cos(angle);

    // translate point back to origin
    p[0] -= o[0];
    p[1] -= o[1];

    // rotate point
    xnew = p[0] * c - p[1] * s;
    ynew = p[0] * s + p[1] * c;

    // translate point back:
    p[0] = xnew + o[0];
    p[1] = ynew + o[1];

    return p;
}

// change color brightness, via http://stackoverflow.com/a/13542669
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// -----------------------------------------------------------------------------

art = Math.floor(r() * 2)

switch(art) {

    // draw a random number of triangles with their vertices at random
    // coordinates and a random stroke width and opacity, simulating depth
    case 0:
        for (i = 0; i < 400 + r() * 2000; i++) {
            c.globalAlpha = r()
            c.beginPath()
            c.moveTo(rr() * w, rr() * h)
            c.lineTo(rr() * w, rr() * h)
            c.lineTo(rr() * w, rr() * h)
            c.closePath()
            c.lineWidth = rsq() * 20
            c.stroke()
        }
    break

    // https://en.wikipedia.org/wiki/Supersampling#Poisson_disc
    case 1:

        // generate points
        points = []
        i = 0
        grace = 0
        while (true) {
            x = r() * w
            y = r() * h
            p = [x,y]

            okay = true
            for (j = 0; j < points.length; j++) {
                if (eucl(points[j], p) < 100) {
                    okay = false
                    break
                }
            }
            if (!okay && j == points.length - 1) {
                grace++
                if (grace > 3) {
                    break
                }
            }
            if (okay) {
                points.push(p)
                i++
            }
        }

        // generate initial rotation angles
        angles = []
        for (i = 0; i < points.length; i++) {
            angles.push(r() * 2 * Math.PI)
        }

        // generate rotational speed
        speed = []
        for (i = 0; i < points.length; i++) {
            speed.push(r() - 0.5)
        }

        // main loop
        n = 0
        setInterval(function() {
            c.clearRect(0, 0, w, h)
            for (i = 0; i < points.length; i++) {
                p = points[i]

                // generate vertices and jitter
                p1 = [p[0]-23+rr()*3, p[1]-26]
                p2 = [p[0]+28,        p[1]+23+rr()*3]
                p3 = [p[0]-22+rr()*2, p[1]+25]

                // rotate based on speed
                speed[i] = 0
                p1 = rotate(p, p1, angles[i] + n * 0.2 * speed[i])
                p2 = rotate(p, p2, angles[i] + n * 0.2 * speed[i])
                p3 = rotate(p, p3, angles[i] + n * 0.2 * speed[i])

                // draw triangles
                c.beginPath()
                c.moveTo(p1[0], p1[1])
                c.lineTo(p2[0], p2[1])
                c.lineTo(p3[0], p3[1])
                c.closePath()
                c.lineWidth = 5
                c.strokeStyle = shadeColor2(bg, (r() - 0.5) * 0.05 + 0.1);
                c.stroke()
            }
            n++
        }, 100)
    break
}

/*
// via http://stackoverflow.com/a/13542669
function shadeColor2(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

// flicker url bar on android
metaArray = document.getElementsByName("theme-color")
setInterval(function() {
    metaArray[0].content = shadeColor2(bg, (r() - 0.5) * 0.1)
}, 200)
*/
