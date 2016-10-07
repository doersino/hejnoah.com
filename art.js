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
    devPxRatio = window.devicePixelRatio
    poly.style.width = w + "px"
    poly.style.height = h + "px"
    w = w * devPxRatio
    h = h * devPxRatio
} else {
    devPxRatio = 1
}
poly.setAttribute("width", w)
poly.setAttribute("height", h)

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

function rotateMany(o, ps, angle) {
    var ret = []
    for (var i = 0; i < ps.length; i++) {
        ret.push(rotate(o, ps[i], angle))
    }
    return ret
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

function pMinus(p, q) {
    return [p[0]-q[0], p[1]-q[1]]
}

// -----------------------------------------------------------------------------

// via http://stackoverflow.com/a/11381730
function mobile() {
    return (navigator.userAgent.match(/Android/i)
         || navigator.userAgent.match(/webOS/i)
         || navigator.userAgent.match(/iPhone/i)
         || navigator.userAgent.match(/iPad/i)
         || navigator.userAgent.match(/iPod/i)
         || navigator.userAgent.match(/BlackBerry/i)
         || navigator.userAgent.match(/Windows Phone/i))
}

mobileArts  = [0,1,2,3,4,5]
desktopArts = [0,1,2,3,4,5,6]

if (mobile()) {
    arts = mobileArts
} else {
    arts = desktopArts
}
art = arts[Math.floor(Math.random()*arts.length)]

switch(art) {

    // https://en.wikipedia.org/wiki/Supersampling#Poisson_disc
    // jittery triangles
    case 0:

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
            if (!okay) {
                grace++
                if (grace > 250) {
                    break
                }
            } else {
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
    case 1:

        // generate points
        points = []
        for (i = 0; i < r() * 2000; i++) {
            x = r() * w
            y = r() * h
            p = [x,y]
            points.push(p)
        }

        // generate initial sizes
        sizes = []
        for (i = 0; i < points.length; i++) {
            sizes.push(r())
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
                sizes[i] = clamp(sizes[i] + (rs()) * 0.1, 0.2, 1.5)
                speeds[i] = [clamp(speeds[i][0] + (rs()) * 0.2, -1, 1), clamp(speeds[i][1] + (rs()) * 0.2, -1, 1)]
                x = p[0] + speeds[i][0] * 5
                y = p[1] + speeds[i][1] * 5
                if (x < -50 || x > w + 50 || y < -50 || y > h + 50) {
                    speeds[i] = speeds[i].map(negate)
                }
                points[i] = [x,y]

                // draw particle
                c.beginPath()
                c.arc(x, y, sizes[i] * 10, 0, 2 * Math.PI, false);
                c.closePath()
                c.lineWidth = 20 * sizes[i]
                c.strokeStyle = shadeColor2(bg, 0.1);
                //c.strokeStyle = shadeColor2(bg, (rs()) * 0.02 + 0.1);
                c.stroke()
            }
        }, 50)

    break

    // rain drops on water
    case 2:

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
        }, 35)

    break

    // https://en.wikipedia.org/wiki/Supersampling#Poisson_disc
    // each point is connected with its closest two neighbors
    case 3:

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
            if (!okay) {
                grace++
                if (grace > 100) {
                    break
                }
            } else {
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
    case 4:

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
                nx = px + (px - mx) * 0.03
                ny = py + (py - my) * 0.03
                points[i] = [nx,ny]
            }
        }, 25)

    break

    // cogs
    case 5:

        // generate radiuses
        radiuses = []
        for (i = 0; i < 5000; i++) {
            radiuses[i] = 50 + r() * 60
        }

        // generate center points
        points = []
        i = 0
        grace = 0
        while (true) {
            x = r() * w
            y = r() * h
            p = [x,y]

            okay = true
            for (j = 0; j < points.length; j++) {
                if (eucl(points[j], p) < radiuses[i] + radiuses[j] + 10) {
                    okay = false
                    break
                }
            }
            if (!okay) {
                grace++
                if (grace > 100) {
                    break
                }
            } else {
                points.push(p)
                i++
            }
        }

        // generate rotational speed
        speeds = []
        for (i = 0; i < points.length; i++) {
            speeds.push(rs() / 10)
        }

        // generate initial rotation angles
        angles = []
        for (i = 0; i < points.length; i++) {
            angles.push(r() * 2 * Math.PI)
        }

        // generate number of teeth per cog
        teeth = []
        for (i = 0; i < points.length; i++) {
            teeth.push(parseInt(radiuses[i] * 0.21))
        }

        // main loop
        setInterval(function() {
            c.clearRect(0, 0, w, h)
            for (i = 0; i < points.length; i++) {
                p = points[i]
                x = p[0]
                y = p[1]
                r = radiuses[i]
                s = speeds[i]
                t = teeth[i]

                a = angles[i]
                angles[i] = a + s

                prev = a
                len = 1/t * 2 * Math.PI * 0.5
                for (j = 0; j < t; j++) {
                    c.beginPath()
                    c.arc(x, y, r, prev, prev + len, false);
                    c.arc(x, y, r - 10, prev + len, prev + 2 * len, false);
                    //c.arc(x, y, r - r/7, prev + len, prev + 2 * len, false);
                    c.arc(x, y, r, prev + 2 * len, prev + 3 * len, false);
                    c.lineWidth = 2
                    c.strokeStyle = shadeColor2(bg, 0.12);
                    c.stroke()

                    prev += 1/t * 2 * Math.PI
                }
                c.beginPath()
                //c.arc(x, y, r / 10, 0, 2 * Math.PI, false);
                c.arc(x, y, 8, 0, 2 * Math.PI, false);
                c.lineWidth = 2
                c.strokeStyle = shadeColor2(bg, 0.1);
                c.stroke()
            }
        }, 50)

    break

    // compass needles
    case 6:

        // generate points
        points = []
        for (x = 40; x < w + 100; x += 120) {
            for (y = 40; y < h + 100; y += 120) {
                points.push([x,y])
            }
        }

        draw = function(mouseX, mouseY) {
            for (i = 0; i < points.length; i++) {
                p = points[i]
                m = [w/2, h/2]
                m = [mouseX, mouseY]

                // generate needle
                p1 = [p[0]-35, p[1]-35]
                p2 = [p[0]+10, p[1]-10]
                p3 = [p[0]+35, p[1]+35]
                p4 = [p[0]-10, p[1]+10]
                ps = [p1, p2, p3, p4]

                // rotate
                mi = pMinus(p, m)
                mix = mi[0]
                miy = mi[1]
                ps = rotateMany(p, ps, 2 * Math.PI * (-0.125) + Math.atan(miy / mix))

                // draw needle
                c.beginPath()
                c.moveTo(ps[0][0], ps[0][1])
                c.lineTo(ps[1][0], ps[1][1])
                c.lineTo(ps[2][0], ps[2][1])
                c.lineTo(ps[3][0], ps[3][1])
                c.closePath()
                c.fillStyle = shadeColor2(bg, 0.1);
                c.fill()
            }
        }

        draw(w/2, h/2)

        document.onmousemove = function(e) {
            mouseX = e.clientX * devPxRatio
            mouseY = e.clientY * devPxRatio

            c.clearRect(0, 0, w, h)
            draw(mouseX, mouseY)
        }
    break

    /*
    // draw a random number of triangles with their vertices at random
    // coordinates and a random stroke width and opacity, simulating depth
    case 6:
        for (i = 0; i < 300 + r() * 1500; i++) {
            c.globalAlpha = 0.33 * (2 * rsq() + r())
            c.beginPath()
            c.moveTo(rr() * w, rr() * h)
            c.lineTo(rr() * w, rr() * h)
            c.lineTo(rr() * w, rr() * h)
            c.closePath()
            c.lineWidth = rsq() * 20
            c.strokeStyle = shadeColor2(bg, 0.1);
            c.stroke()
        }
    break

    // lattice
    case 7:

        // generate points
        points = []
        sidelen = Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
        for (i = 0; i < 50; i++) {
            //px = -sidelen/25 + i * sidelen/50
            px = w/2 - sidelen/2 + i * sidelen/50
            points.push([px,h/2+sidelen/2])
            points.push([px,h/2+sidelen/2])
            points.push([px+1,h/2-sidelen/2])
            points.push([px+1,h/2+sidelen/2])
        }
        points2 = points.slice()

        // define middle
        mid = [w/2, h/2]

        // set initial angle
        angle = 0
        angle2 = 1

        // main loop
        setInterval(function() {
            c.clearRect(0, 0, w, h)
            c.beginPath()
            for (i = 0; i < points.length; i++) {
                p = points[i].slice()
                p = rotate(mid, p, angle)

                if (i == 0) {
                    c.moveTo(p[0], p[1])
                } else {
                    c.lineTo(p[0], p[1])
                }
            }
            c.lineWidth = 10
            c.strokeStyle = shadeColor2(bg, 0.1);
            c.stroke()
            angle = (angle + 0.004) % (2 * Math.PI)

            c.beginPath()
            c.moveTo(0,0)
            for (i = 0; i < points2.length; i++) {
                p2 = points2[i].slice()
                p2 = rotate(mid, p2, angle2)

                if (i == 0) {
                    c.moveTo(p2[0], p2[1])
                } else {
                    c.lineTo(p2[0], p2[1])
                }
            }
            c.lineWidth = 10
            c.strokeStyle = shadeColor2(bg, 0.1);
            c.stroke()
            angle2 = (angle2 - 0.01) % (2 * Math.PI)
        }, 20)

    break
    */
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
