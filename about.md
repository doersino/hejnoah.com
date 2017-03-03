---
layout: page
title: About
permalink: /about/
---

I'm Noah Doersing, and I’m currently enrolled in the media informatics master program in [Tübingen](http://www.uni-tuebingen.de/en/faculties/faculty-of-science/departments/computer-science/department.html), on track to graduate in 2019. When I'm not busy studying, I sometimes [tweet](https://twitter.com/Doersino), work on [open-source projects](https://github.com/doersino), take [pictures](http://instagram.com/doersino) on my phone, or listen to [music](https://bandcamp.com/noah).

*If you want to contact me, please feel free to <a href="mailto:&#100;&#111;&#101;&#x72;&#115;&#105;&#x6e;&#111;&#43;&#104;&#101;&#x6a;&#110;&#111;&#x61;&#x68;&#64;&#x67;&#x6d;&#97;&#x69;&#x6c;&#46;&#99;&#111;&#109;">send an email</a>, [tweet at me](https://twitter.com/Doersino) or [ask me anything](http://neondust.tumblr.com/ask).*

<!-- TODO [Here's my CV.]({{ "/static/cv.pdf" | relative_url }})-->


## Colophon

This [Jekyll](https://jekyllrb.com) blog is hosted on [Uberspace](https://uberspace.de). Headlines are set in [Montserrat](https://fonts.google.com/specimen/Montserrat), code is displayed in [Fira Code](https://github.com/tonsky/FiraCode) and everything else uses the [Asap](https://fonts.google.com/specimen/Asap) font -- except for math, which is displayed using [MathJax](https://www.mathjax.org) and configured to use the [TeX Gyre Pagella](http://www.gust.org.pl/projects/e-foundry/tex-gyre/pagella) font. [Bigfoot](http://www.bigfootjs.com) helps making footnotes easy to use.

![]({{ "/static/me.jpg" | relative_url }}){: .endimg}

<canvas id="canvas" style="display: none;"></canvas>
<script>
    window.addEventListener("load", function(event) {

        // show canvas and overlay over logo
        var logo = document.getElementById("logo");
        var canvas = document.getElementById("canvas");
        var styles = window.getComputedStyle(logo);
        canvas.style.display = "inline-block";
        canvas.style.position = "absolute";
        canvas.style.top = parseFloat(styles["marginTop"]) + "px";
        canvas.style.pointerEvents = "none";

        // set height and width correctly on retina devices
        var w = logo.offsetWidth;
        var h = logo.offsetHeight;
        var dpr = 1;
        if (window.devicePixelRatio) {
            dpr = window.devicePixelRatio;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            w = w * dpr;
            h = h * dpr;
        }
        canvas.setAttribute("width", w);
        canvas.setAttribute("height", h);

        var c = canvas.getContext("2d");

        // randomness
        rand = function() { return Math.random() };
        rands = function() { return rand() - 0.5 };
        randssq = function() { return rands() * rands() };

        // math helpers
        function eucl(p, q) {
            return Math.sqrt(Math.pow(p[0] - q[0], 2) + Math.pow(p[1] - q[1], 2));
        }

        function clamp(n, min, max) {
            if (n < min) {
                return min;
            } else if (n > max) {
                return max;
            }
            return n;
        }

        function negate(n) {
            return -n;
        }

        // account for retina factor, but making things a bit smaller on mobile
        function s(n) {
            if (w / dpr < 500) {
                return n * (dpr/3);
            }
            return n * (dpr/2);
        }

        // select which art is going to be shown
        var arts = ["cogs", "raindrops", "starfield", "brownian"];
        var art = arts[Math.floor(Math.random()*arts.length)];

        if (art == "cogs") {

            // generate center points and radiuses based on poisson sampling
            // approach, also randomly generate rotational speed and initial angles
            var tries = 1000;
            var points = [];
            var radiuses = [];
            var speeds = [];
            var angles = [];
            while (true) {
                var x = rand() * w;
                var y = rand() * h;
                var p = [x,y];
                var r = s(50 + rand() * 60);

                var okay = true;
                for (var j = 0; j < points.length; j++) {
                    if (eucl(points[j], p) < r + radiuses[j] + s(30)) {
                        okay = false;
                        break;
                    }
                }

                if (!okay) {
                    if (--tries < 0) {
                        break;
                    }
                } else {
                    radiuses.push(r);
                    points.push(p);
                    speeds.push(rands() / 10);
                    angles.push(rand() * 2 * Math.PI);
                }
            }

            // main loop
            setInterval(function() {
                c.clearRect(0, 0, w, h);

                // iterate over cogs
                for (var i = 0; i < points.length; i++) {
                    var x = points[i][0];
                    var y = points[i][1];
                    var r = radiuses[i];
                    var a = angles[i];
                    var t = parseInt(r * 0.18);

                    // draw outline
                    var segLen = s(1/t) * 2 * Math.PI * 0.5;
                    for (var j = 0; s(j) < t; j++) {
                        c.beginPath();
                        c.arc(x, y, r, a, a + segLen, false);
                        c.arc(x, y, r - s(13), a + segLen, a + 2 * segLen, false);
                        c.arc(x, y, r, a + 2 * segLen, a + 3 * segLen, false);
                        c.lineWidth = s(3);
                        c.strokeStyle = "white";
                        c.stroke();

                        a += s(1/t) * 2 * Math.PI;
                    }

                    // draw center circle
                    c.beginPath();
                    c.arc(x, y, s(10), 0, 2 * Math.PI, false);
                    c.lineWidth = s(3);
                    c.strokeStyle = "white";
                    c.stroke();

                    // update angle
                    angles[i] += speeds[i];
                }
            }, 25);
        } else if (art == "raindrops") {

            // generate points and initial ages
            var points = [];
            var ages = [];
            for (var i = 0; s(i) < (w * h) / 100000 + 15 * rand(); i++) {
                var x = rand() * w;
                var y = rand() * h;
                var p = [x,y];
                points.push(p);
                ages.push(rand() * 120 + 1);
            }

            // main loop
            setInterval(function() {
                c.clearRect(0, 0, w, h);

                // iterate over droplets
                for (var i = 0; i < points.length; i++) {
                    var x = points[i][0];
                    var y = points[i][1];
                    var a = ages[i] + 1;

                    // reset droplet if too old
                    if (a > 100 + rand() * 150) {
                        a = 1;
                        x = rand() * w;
                        y = rand() * h;
                        points[i] = [x,y];
                    }
                    ages[i] = a;

                    // TODO improve
                    if (a <= 100) {
                        var prev = 0;
                        var len = clamp(1/20 * 2 * Math.PI * (1 - (clamp(a-20, 0, 100))/(100-20)), 0, 1);
                        for (var j = 0; j < 20; j++) {
                            c.beginPath();
                            c.arc(x, y, s(2.5) * a, prev, prev + len, false);
                            c.lineWidth = s(3);
                            c.strokeStyle = "white";
                            c.stroke();

                            prev += 1/20 * 2 * Math.PI;
                        }
                    }
                }
            }, 25);
        } else if (art == "starfield") {
            var mx = w/2;
            var my = h/2;

            // generate points
            var points = [];
            for (var i = 0; i < 100 + rands() * 30; i++) {
                var px = mx + randssq() * mx;
                var py = my + randssq() * my;
                var p = [px,py];
                points.push(p);
            }

            // main loop
            setInterval(function() {
                c.clearRect(0, 0, w, h);

                // iterate over stars
                for (var i = 0; i < points.length; i++) {
                    var px = points[i][0]
                    var py = points[i][1]

                    // reset star if out of bounds or right in the middle (where
                    // we can't infer a motion direction)
                    while (px < -25 || px > w + 25 || py < -25 || py > h + 25 || (px == w/2 && py == h/2)) {
                        px = mx + rands() * w/10;
                        py = my + rands() * h/10;
                        points[i] = [px,py];
                    }

                    // compute radius
                    var r = s(55) * (Math.abs(px-mx) + Math.abs(py-my)) / (w + h);

                    // draw star
                    c.beginPath()
                    c.arc(px, py, r, 0, 2 * Math.PI, false);
                    c.fillStyle = "white";
                    c.fill()

                    // update star
                    var nx = px + (px - mx) * 0.03;
                    var ny = py + (py - my) * 0.03;
                    points[i] = [nx,ny];
                }
            }, 25);

        } else if (art == "brownian") {

            // generate points, as well as inital sizes and speeds in x and y
            // direction
            var points = [];
            var sizes = [];
            var speeds = [];
            for (var i = 0; s(i) < 100 + rand() * 400; i++) {
                var x = rand() * w;
                var y = rand() * h;
                var p = [x,y];
                points.push(p);
                sizes.push(rand());
                speeds.push([rands(), rands()]);
            }

            // main loop
            setInterval(function() {
                c.clearRect(0, 0, w, h);

                // iterate over particles
                for (i = 0; i < points.length; i++) {
                    var p = points[i];

                    // move particle
                    sizes[i] = clamp(sizes[i] + (rands()) * 0.1, 0.2, 1.5);
                    speeds[i] = [
                        clamp(speeds[i][0] + (rands()) * 0.2, -1, 1),
                        clamp(speeds[i][1] + (rands()) * 0.2, -1, 1)
                    ];

                    var x = p[0] + speeds[i][0] * s(3);
                    var y = p[1] + speeds[i][1] * s(3);

                    // if out of bounds, make sure particle will move back into
                    // visible part of canvas
                    if (x < -50 || x > w + 50 || y < -50 || y > h + 50) {
                        speeds[i] = speeds[i].map(negate);
                    }
                    points[i] = [x,y];

                    // draw particle
                    c.beginPath();
                    c.arc(x, y, sizes[i] * s(10), 0, 2 * Math.PI, false);
                    c.closePath();
                    c.lineWidth = s(20) * sizes[i];
                    c.strokeStyle = "white";
                    c.stroke();
                }
            }, 25)
        }
    });
</script>
