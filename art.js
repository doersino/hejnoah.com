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
rs = function() { return r() - 0.5 }
rsq = function() { return r() * r() }
rssq = function() { return rs() * rs() }

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
    var xnew = p[0] * c - p[1] * s;
    var ynew = p[0] * s + p[1] * c;

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

// clamp
function clamp(n, min, max) {
    if (n < min) {
        return min
    } else if (n > max) {
        return max
    }
    return n;
}

function negate(n) {
    return -n;
}

function argmin(arr) {
    var min = arr[0]
    var arg = 0

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i]
            arg = i
        }
    }

    return arg
}

function argmax(arr) {
    var max = arr[0]
    var arg = 0

    for (var i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i]
            arg = i
        }
    }

    return arg
}

// -----------------------------------------------------------------------------

art = Math.floor(r() * 6)

switch(art) {

    // draw a random number of triangles with their vertices at random
    // coordinates and a random stroke width and opacity, simulating depth
    case 0:
        for (i = 0; i < 300 + r() * 1500; i++) {
            c.globalAlpha = r()
            c.beginPath()
            c.moveTo(rr() * w, rr() * h)
            c.lineTo(rr() * w, rr() * h)
            c.lineTo(rr() * w, rr() * h)
            c.closePath()
            c.lineWidth = rsq() * 20
            c.strokeStyle = shadeColor2(bg, -0.7);
            c.stroke()
        }
    break

    // https://en.wikipedia.org/wiki/Supersampling#Poisson_disc
    // jittery triangles
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
        speeds = []
        for (i = 0; i < points.length; i++) {
            speeds.push(rs())
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
                speeds[i] = 0
                p1 = rotate(p, p1, angles[i] + n * 0.2 * speeds[i])
                p2 = rotate(p, p2, angles[i] + n * 0.2 * speeds[i])
                p3 = rotate(p, p3, angles[i] + n * 0.2 * speeds[i])

                // draw triangle
                c.beginPath()
                c.moveTo(p1[0], p1[1])
                c.lineTo(p2[0], p2[1])
                c.lineTo(p3[0], p3[1])
                c.closePath()
                c.lineWidth = 5
                c.strokeStyle = shadeColor2(bg, (rs()) * 0.05 + 0.1);
                c.stroke()
            }
            n++
        }, 100)
    break

    // brownian motion
    case 2:

        // generate points
        points = []
        for (i = 0; i < r() * 2000; i++) {
            x = r() * w
            y = r() * h
            p = [x,y]
            points.push(p)
        }

        // generate initial distances
        dists = []
        for (i = 0; i < points.length; i++) {
            dists.push(r())
        }

        // generate initial speed in x and y
        speeds = []
        for (i = 0; i < points.length; i++) {
            speeds.push([rs(), rs()])
        }

        // main loop
        setInterval(function() {
            c.clearRect(0, 0, w, h)
            for (i = 0; i < points.length; i++) {
                p = points[i]

                // move particle
                dists[i] = clamp(dists[i] + (rs()) * 0.1, 0.2, 1)
                speeds[i] = [clamp(speeds[i][0] + (rs()) * 0.2, -1, 1), clamp(speeds[i][1] + (rs()) * 0.2, -1, 1)]
                x = p[0] + speeds[i][0] * 5
                y = p[1] + speeds[i][1] * 5
                if (x < -50 || x > w + 50 || y < 50 || y > h + 50) {
                    speeds[i] = speeds[i].map(negate)
                }
                points[i] = [x,y]

                // draw particle
                c.beginPath()
                c.arc(x, y, dists[i] * 10, 0, 2 * Math.PI, false);
                c.closePath()
                c.lineWidth = 20 * dists[i]
                c.strokeStyle = shadeColor2(bg, -0.7);
                //c.strokeStyle = shadeColor2(bg, (rs()) * 0.02 + 0.1);
                c.stroke()
            }
        }, 50)

    break

    // rain drops on water
    case 3:

        // generate points
        points = []
        for (i = 0; i < (w * h) / 100000; i++) {
            x = r() * w
            y = r() * h
            p = [x,y]
            points.push(p)
        }

        // generate initial age
        age = []
        for (i = 0; i < points.length; i++) {
            age[i] = r() * 120 + 1
        }

        // main loop
        setInterval(function() {
            c.clearRect(0, 0, w, h)
            for (i = 0; i < points.length; i++) {
                p = points[i]
                x = p[0]
                y = p[1]
                a = age[i] + 1

                // reset droplet
                if (a > 100 + r() * 100) {
                    a = 1;
                    x = r() * w
                    y = r() * h
                    points[i] = [x,y]
                }
                age[i] = a

                if (a <= 100) {
                    //c.globalAlpha = clamp(20 / a, 0, 1)
                    prev = 0
                    len = clamp(1/20 * 2 * Math.PI * (1 - (clamp(a-20, 0, 100))/(100-20)), 0, 1)
                    for (j = 0; j < 20; j++) {
                        c.beginPath()
                        c.arc(x, y, 4 * a, prev, prev + len, false);
                        c.lineWidth = 1.5
                        c.strokeStyle = shadeColor2(bg, 0.15);
                        c.stroke()

                        prev += 1/20 * 2 * Math.PI
                    }
                }
            }
        }, 50)

    break

    // https://en.wikipedia.org/wiki/Supersampling#Poisson_disc
    // each point is connected with its closest two neighbors
    case 4:

        // generate points
        points = []
        i = 0
        grace = 0
        while (true) {
            x = r() * (w + 100) - 50
            y = r() * (h + 100) - 50
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
                if (grace > 4) {
                    break
                }
            }
            if (okay) {
                points.push(p)
                i++
            }
        }

        triangles = []
        for (i = 0; i < points.length; i++) {

            // compute distances to all other points
            dists = []
            for (j = 0; j < points.length; j++) {
                dists[j] = eucl(points[i], points[j])
            }

            // get closest and second closest neighbor, excluding itself
            dists[i] = 99999
            closest = argmin(dists)
            dists[closest] = 99999
            secondClosest = argmin(dists)

            // push array of all three onto triangles
            triangles.push([points[i], points[closest], points[secondClosest]])
        }

        // draw triangles
        for (i = 0; i < triangles.length; i++) {
            c.globalAlpha = 1 - rsq()
            c.beginPath()
            c.moveTo(triangles[i][0][0], triangles[i][0][1])
            c.lineTo(triangles[i][1][0], triangles[i][1][1])
            c.lineTo(triangles[i][2][0], triangles[i][2][1])
            c.closePath()
            c.lineWidth = 3
            c.strokeStyle = shadeColor2(bg, 0.1);
            c.stroke()
        }
    break

    // starfield
    case 5:

        // generate points
        points = []
        for (i = 0; i < 100 + rs() * 30; i++) {
            px = w/2 + rssq() * w/2
            py = h/2 + rssq() * h/2
            points.push([px,py])
        }

        mid = [w/2, h/2]
        mx = mid[0]
        my = mid[1]

        // main loop
        setInterval(function() {
            c.clearRect(0, 0, w, h)
            for (i = 0; i < points.length; i++) {
                p = points[i]
                px = p[0]
                py = p[1]

                // reset star
                while (px < -25 || px > w + 25 || py < -25 || py > h + 25 || (px == w/2 && py == h/2)) {
                    px = w/2 + rs() * w/10
                    py = h/2 + rs() * h/10
                    points[i] = [px,py]
                }

                // draw star
                c.beginPath()
                c.arc(px, py, 50 * (Math.abs(px-mx) + Math.abs(py-my)) / (w + h), 0, 2 * Math.PI, false);
                c.fillStyle = shadeColor2(bg, 0.1);
                c.fill()

                // update star
                nx = px + (px - mx) * 0.05
                ny = py + (py - my) * 0.05
                points[i] = [nx,ny]
            }
        }, 40)

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
    metaArray[0].content = shadeColor2(bg, (rs()) * 0.1)
}, 200)
*/
