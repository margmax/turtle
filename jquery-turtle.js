(function($) {
/* jQuery-turtle version 2.0.

jQuery-turtle
=============

version 2.0

jQuery-turtle is a jQuery plugin that provides turtle graphics.
It provides easy access to advanced geometry, animation, css 3,
and HTML 5 features for students who are learning: it handles
the math of 2d transforms, simplifies usage of modern web features,
and encapsulates computational geometry where needed.

With jQuery-turtle, every DOM element is a turtle that can be
moved using fd, bk, rt, and lt.  Under the covers, CSS3 2d
transforms are used to do the movement, and jQuery-turtle
interacts well with programs that may manipulate 2d CSS3
transforms directly.

The plugin provides three levels of functionality.  The main
feature is a set of turtle movement methods including fd(pix),
bk(pixx), rt(deg), lt(deg), pen(clr) that are added to jQuery objects,
allowing all DOM elements including nested element to be moved
with turtle geometry while still maintaining a simple relationship
to global page coordinates for drawing and hit-testing.

The lowest level of functionality is a set of CSS hooks that define
synthetic CSS properties that can be animated or used to directly
manipulate turtle geometry at a basic mathematical level.

The highest level of functionality is enabled by $.turtle(),
which creates a set of functions expressly designed for learning
beginners.  Calling $.turtle() populates the global namespace with a
handful of functions and other global objects (such as a simplified
timer, a simplified function to create a new turtle, etc).  These
are designed to make programming concepts easier to learn.

JQuery Methods for Turtle Movement
----------------------------------

Turtle-oriented methods taking advantage of the css support:
<pre>
  $(x).fd(100)      // Forward relative motion in local coordinates.
  $(x).bk(50)       // Back.
  $(x).rt(90)       // Right turn.
  $(x).lt(45)       // Left turn.
  $(x).moveto({pageX: 40, pageY: 140})  // Absolute motion in page coordinates.
  $(x).center()     // Page coordinate position of transform-origin.
  $(x).turnto(heading || position)      // Absolute heading adjustment.
  $(x).direction()  // Absolute heading taking into account nested transforms.
  $(x).scale(1.5)   // Scales the element up by 50%.
  $(x).twist(180)   // Changes which direction is considered "forward".
  $(x).mirror(true) // Flips the turtle across its direction axis.
  $(x).shown()      // Shorthand for is(":visible")
  $(x).hidden()     // Shorthand for !is(":visible")
  $(x).pen('red')   // Sets a pen style, or 'none' for no drawing.
  $(x).dot()        // Draws a dot.
  $(x).reload()     // Reloads the turtle's image (restarting animated gifs)
  $(x).erase()      // Erases under the turtle.
  $(x).touches(y)   // Collision tests elements (uses turtleHull if present).
  $(x).encloses(y)  // Containment collision test.
</pre>
When $.fx.speeds.turtle is nonzero (the default is zero unless
$.turtle() is called), the first four movement functions animate
at that speed, and the remaining mutators also participate in the
animation queue.  Note that when using predicates such as
touches(), queuing will mess up the logic because the predicate
will not queue, so when making a game with hit testing,
$.fx.speed.turtle should be set to 0 so that movement is
synchronous and instantaneous.

JQuery CSS Hooks for Turtle Geometry
------------------------------------

Low-level Turtle-oriented 2d transform cssHooks, with animation
support on all motion:
<pre>
  $(x).css('turtlePosition', '30 40');   // position in local coordinates.
  $(x).css('turtlePositionX', '30');     // x component.
  $(x).css('turtlePositionY', '40');     // y component.
  $(x).css('turtleRotation', '90');      // rotation in degrees.
  $(x).css('turtleScale', '2');          // double the size of any element.
  $(x).css('turtleScaleX', '2');         // x stretch before rotate after twist.
  $(x).css('turtleScaleX', '2');         // y stretch before rotate after twist.
  $(x).css('turtleTwist', '45');         // turn before stretching.
  $(x).css('turtleDisplacement', '50');  // position in direction of rotation.
  $(x).css('turtlePen', 'red');          // or 'red lineWidth 2px' etc.
  $(x).css('turtleHull', '5 0 0 5 0 -5');// fine-tune shape for collisions.
</pre>

Arbitrary 2d transforms are supported, including transforms of elements
nested within other elements that have css transforms. Transforms are
automatically decomposed to turtle components when necessary.
A canvas is supported for drawing, but only created when the pen is
used; pen styles include canvas style properties such as lineWidth
and lineCap.  A convex hull polygon can be set to be used by the collision
detection and hit-testing functions below.

Turtle Teaching Environment
---------------------------

An optional teaching environment setup is created by $.turtle().
It provides easy packaging for the above functionality.

After $.turtle():
  * An &lt;img id="turtle"&gt; is created if #turtle doesn't already exist.
  * An eval debugging panel (see.js) is shown at the bottom of the screen.
  * Turtle methods on the default turtle are packaged as globals, e.g., fd(10).
  * Every #id element is turned into a global variable: window.id = $('#id').
  * Globals are set up to save events: "lastclick", "lastmousemove", etc.
  * speed(movesPerSec) adjusts $.fx.speeds.turtle in a way suitable for kids.
  * Default turtle animation is set to 10 moves per sec so steps can be seen.
  * tick([ticksPerSec,] fn) is an easier-to-call setInterval.
  * random(lessThanThisInteger || array) is an easy alternative to Math.random.
  * hatch() creates and returns a new turtle.
  * see(a, b, c) logs tree-expandable data into the debugging panel.

The turtle teaching environment is designed to work well with either
Javascript or CoffeeScript.  The turtle library is especially compelling
as a teaching tool when used with CoffeeScript.

License (MIT)
-------------

Copyright (c) 2013 David Bau

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

//////////////////////////////////////////////////////////////////////////
// PREREQUISTIES
// Establish support for transforms in this browser.
//////////////////////////////////////////////////////////////////////////

if (!$.cssHooks) {
  throw("jQuery 1.4.3+ is needed for jQuery-turtle to work");
}

// Determine the name of the 'transform' css property.
function styleSupport(prop) {
  var vendorProp, supportedProp,
      capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
      prefixes = [ "Moz", "Webkit", "O", "ms" ],
      div = document.createElement("div");
  if (prop in div.style) {
    supportedProp = prop;
  } else {
    for (var i = 0; i < prefixes.length; i++) {
      vendorProp = prefixes[i] + capProp;
      if (vendorProp in div.style) {
        supportedProp = vendorProp;
        break;
      }
    }
  }
  div = null;
  $.support[prop] = supportedProp;
  return supportedProp;
}
function hasGetBoundingClientRect() {
  var div = document.createElement("div"),
      result = ('getBoundingClientRect' in div);
  div = null;
  return result;
}
var transform = styleSupport("transform"),
    transformOrigin = styleSupport("transformOrigin");

if (!transform || !hasGetBoundingClientRect()) {
  // Need transforms and boundingClientRects to support turtle methods.
  return;
}

//////////////////////////////////////////////////////////////////////////
// MATH
// 2d matrix support functions.
//////////////////////////////////////////////////////////////////////////

function identity(x) { return x; }

// Handles both 2x2 and 2x3 matrices.
function matrixVectorProduct(a, v) {
  var r = [a[0] * v[0] + a[2] * v[1], a[1] * v[0] + a[3] * v[1]];
  if (a.length == 6) {
    r[0] += a[4];
    r[1] += a[5];
  }
  return r;
}

// Multiplies 2x2 or 2x3 matrices.
function matrixProduct(a, b) {
  var r = [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3]
  ];
  var along = (a.length == 6);
  if (b.length == 6) {
    r.push(a[0] * b[4] + a[2] * b[5] + (along ? a[4] : 0));
    r.push(a[1] * b[4] + a[3] * b[5] + (along ? a[5] : 0));
  } else if (along) {
    r.push(a[4]);
    r.push(a[5]);
  }
  return r;
}

function nonzero(e) {
  // Consider zero any deviations less than one in a trillion.
  return Math.abs(e) > 1e-12;
}

function isone2x2(a) {
  return !nonzero(a[1]) && !nonzero(a[2]) &&
      !nonzero(1 - a[0]) && !nonzero(1 - a[3]);
}

function inverse2x2(a) {
  if (isone2x2(a)) { return [1, 0, 0, 1]; }
  var d = decomposeSVD(a);
  // Degenerate matrices have no inverse.
  if (!nonzero(d[2])) return null;
  return matrixProduct(
      rotation(-(d[3])), matrixProduct(
      scale(1/d[1], 1/d[2]),
      rotation(-(d[0]))));
}

function rotation(theta) {
  var c = Math.cos(theta),
      s = Math.sin(theta);
  return [c, s, -s, c];
}

function scale(sx, sy) {
  if (arguments.length == 1) { sx = sy; }
  return [sx, 0, 0, sy];
}

function addVector(v, a) {
  return [v[0] + a[0], v[1] + a[1]];
}

function subtractVector(v, s) {
  return [v[0] - s[0], v[1] - s[1]];
}

function translatedMVP(m, v, origin) {
  return addVector(matrixVectorProduct(m, subtractVector(v, origin)), origin);
}

// decomposeSVD:
//
// Decomposes an arbitrary 2d matrix into a rotation, an X-Y scaling,
// and a prescaling rotation (which we call a "twist").  The prescaling
// rotation is only nonzero when there is some skew (i.e, a stretch that
// does not preserve rectilinear angles in the source).
//
// This decomposition is stable, which means that the product of
// the three components is always within near machine precision
// (about ~1e-15) of the original matrix.
//
// Input:  [m11, m21, m12, m22] in column-first order.
// Output: [rotation, scalex, scaley, twist] with rotations in radians.
//
// The decomposition is the unique 2d SVD permuted to fit the contraints:
//  * twist is between +- pi/4
//  * rotation is between +- pi/2
//  * scalex + scaley >= 0.
function decomposeSVD(m) {
  var m0_2 = m[0] * m[0],
      m1_2 = m[1] * m[1],
      m2_2 = m[2] * m[2],
      m3_2 = m[3] * m[3],
      m0m2 = m[0] * m[2],
      m1m3 = m[1] * m[3],
      // Copmute M*M.
      mtm0 = m0_2 + m1_2,
      mtm12 = m0m2 + m1m3, 
      mtm3 = m2_2 + m3_2,
      // Compute sv1, sv2: larger and smaller singular values.
      susum = mtm0 + mtm3,
      susub = mtm0 - mtm3,
      sudif = Math.sqrt(susub * susub + 4 * mtm12 * mtm12),
      sv1 = Math.sqrt((susum + sudif) / 2),
      sv2 = Math.sqrt((susum - sudif) / 2),  // Note: poor precision here.
      // Compute right-side rotation.
      phi = -0.5 * Math.atan2(mtm12 + mtm12, mtm0 - mtm3),
      // Compute left-side rotation.
      v0 = Math.cos(phi),
      v1 = Math.sin(phi),
      mvt0 = (m[0] * v0 - m[2] * v1),
      mvt1 = (m[1] * v0 - m[3] * v1),
      theta = Math.atan2(mvt1, mvt0),
      // Now recompute the smaller singular value.  This does two things:
      // it pushes flips (negative sign) into the small singular value,
      // and it also doubles precision.
      u0 = Math.cos(theta),
      u1 = Math.sin(theta),
      sv2c = (m[1] * v1 + m[3] * v0) * u0 - (m[0] * v1 + m[2] * v0) * u1;
  // Put phi between -pi/4 and pi/4.
  if (phi < -Math.PI / 4) {
    phi += Math.PI / 2;
    sv2 = sv1;
    sv1 = sv2c;
    theta -= Math.PI / 2;
  } else {
    sv2 = sv2c;
  }
  // Put theta between -pi and pi.
  if (theta > Math.PI) { theta -= 2 * Math.PI; }
  return [theta, sv1, sv2, phi];
}

//////////////////////////////////////////////////////////////////////////
// CSS TRANSFORMS
// Basic manipulation of 2d CSS transforms.
//////////////////////////////////////////////////////////////////////////

function getElementTranslation(elem) {
  var ts = readTurtleTransform(elem, false);
  if (ts) { return [ts.tx, ts.ty]; }
  var m = readTransformMatrix(elem);
  if (m) { return [m[4], m[5]]; }
  return [0, 0];
}

// Reads out the 2x3 transform matrix of the given element.
function readTransformMatrix(elem) {
  var ts = (window.getComputedStyle ?
      window.getComputedStyle(elem)[transform] :
      $.css(elem, 'transform'));
  if (!ts || ts === 'none') {
    return null;
  }
  // Quick exit on the explicit matrix() case:
  var e =/^matrix\(([\-+.\de]+),\s*([\-+.\de]+),\s*([\-+.\de]+),\s*([\-+.\de]+),\s*([\-+.\de]+)(?:px)?,\s*([\-+.\de]+)(?:px)?\)$/.exec(ts);
  if (e) {
    return [parseFloat(e[1]), parseFloat(e[2]), parseFloat(e[3]),
            parseFloat(e[4]), parseFloat(e[5]), parseFloat(e[6])];
  }
  // Interpret the transform string.
  return transformStyleAsMatrix(ts);
}

// Reads out the css transformOrigin property, if present.
function readTransformOrigin(elem, wh) {
  var origin = (window.getComputedStyle ?
      window.getComputedStyle(elem)[transformOrigin] :
      $.css(elem, 'transformOrigin'));
  return origin && origin.indexOf('%') < 0 ?
      $.map(origin.split(' '), parseFloat) :
      [wh[0] / 2, wh[1] / 2];
}

// Composes all the 2x2 transforms up to the top.
function totalTransform2x2(elem) {
  var result = [1, 0, 0, 1], t;
  while (elem !== null) {
    t = readTransformMatrix(elem);
    if (t && !isone2x2(t)) {
      result = matrixProduct(t, result);
    }
    elem = elem.parentElement;
  }
  return result.slice(0, 4);
}

// Applies the css 2d transforms specification.
function transformStyleAsMatrix(transformStyle) {
  // Deal with arbitrary transforms:
  var result = [1, 0, 0, 1], ops = [], args = [],
      pat = /(?:^\s*|)(\w*)\s*\(([^)]*)\)\s*/g,
      unknown = transformStyle.replace(pat, function(m) {
        ops.push(m[1].toLowerCase());
        args.push($.map(m[2].split(','), function(s) {
          var v = s.trim().toLowerCase();
          return {
            num: parseFloat(v),
            unit: v.replace(/^[+-.\de]*/, '')
          };
        }));
        return '';
      });
  if (unknown) { return null; }
  for (var index = ops.length - 1; index >= 0; --index) {
    var m = null, a, c, s, t;
    var op = ops[index];
    var arg = args[index];
    if (op == 'matrix') {
      if (arg.length >= 6) {
        m = [arg[0].num, arg[1].num, arg[2].num, arg[3].num,
             arg[4].num, arg[5].num];
      }
    } else if (op == 'rotate') {
      if (arg.length == 1) {
        a = convertToRadians(arg[0]);
        c = Math.cos(a);
        s = Math.sin(a);
        m = [c, -s, c, s];
      }
    } else if (op == 'translate' || op == 'translatex' || op == 'translatey') {
      var tx = 0, ty = 0;
      if (arg.length >= 1) {
        if (arg[0].unit && arg[0].unit != 'px') { return null; } // non-pixels
        if (op == 'translate' || op == 'translatex') { tx = arg[0].num; }
        else if (op == 'translatey') { ty = arg[0].num; }
        if (op == 'translate' && arg.length >= 2) {
          if (arg[1].unit && arg[1].unit != 'px') { return null; }
          ty = arg[1].num;
        }
        m = [0, 0, 0, 0, tx, ty];
      }
    } else if (op == 'scale' || op == 'scalex' || op == 'scaley') {
      var sx = 1, sy = 1;
      if (arg.length >= 1) {
        if (op == 'scale' || op == 'scalex') { sx = arg[0].num; }
        else if (op == 'scaley') { sy = arg[0].num; }
        if (op == 'scale' && arg.length >= 2) { sy = arg[1].num; }
        m = [sx, 0, 0, sy, 0, 0];
      }
    } else if (op == 'skew' || op == 'skewx' || op == 'skewy') {
      var kx = 0, ky = 0;
      if (arg.length >= 1) {
        if (op == 'skew' || op == 'skewx') {
          kx = Math.tan(convertToRadians(arg[0]));
        } else if (op == 'skewy') {
          ky = Math.tan(convertToRadians(arg[0]));
        }
        if (op == 'skew' && arg.length >= 2) {
          ky = Math.tan(convertToRadians(arg[0]));
        }
        m = [1, ky, kx, 1, 0, 0];
      }
    } else {
      // Unrecgonized transformation.
      return null;
    }
    result = matrixProduct(result, m);
  }
  return result;
}

//////////////////////////////////////////////////////////////////////////
// ABSOLUTE PAGE POSITIONING
// Dealing with the element center, rectangle, and direction on the page,
// taking into account nested parent transforms.
//////////////////////////////////////////////////////////////////////////

function limitMovement(start, target, limit) {
  if (limit <= 0) return start;
  var distx = target.pageX - start.pageX,
      disty = target.pageY - start.pageY,
      dist2 = distx * distx + disty * disty;
  if (limit * limit >= dist2) {
    return target;
  }
  var frac = limit / Math.sqrt(dist2);
  return {
    pageX: start.pageX + frac * distx,
    pageY: start.pageY + frac * disty
  };
}

function limitRotation(start, target, limit) {
  if (limit <= 0) { target = start; }
  else if (limit < 180) {
    var delta = normalizeRotation(target - start);
    if (delta > limit) { target = start + limit; }
    else if (delta < -limit) { target = start - limit; }
  }
  return normalizeRotation(target);
}

function getCenterLTWH(x0, y0, w, h) {
  return { pageX: x0 + w / 2, pageY: y0 + h / 2 };
}

function getStraightRectLTWH(x0, y0, w, h) {
  var x1 = x0 + w, y1 = y0 + h;
  return [
    { pageX: x0, pageY: y0 },
    { pageX: x0, pageY: y1 },
    { pageX: x1, pageY: y1 },
    { pageX: x1, pageY: y0 }
  ];
}

function cleanedStyle(trans) {
  // Work around FF bug: the browser generates CSS transforms with nums
  // with exponents like 1e-6px that are not allowed by the CSS spec.
  // And yet it doesn't accept them when set back into the style object.
  // So $.swap doesn't work in these cases.  Therefore, we have a cleanedSwap
  // that cleans these numbers before setting them back.
  if (!/e[\-+]/.exec(trans)) {
    return trans;
  }
  var result = trans.replace(/(?:\d+(?:\.\d*)?|\.\d+)e[\-+]\d+/g, function(e) {
    return cssNum(parseFloat(e)); });
  return result;
}

function cleanSwap(elem, options, callback, args) {
  var ret, name, old = {};
  // Remember the old values, and insert the new ones
  for (name in options) {
    old[name] = elem.style[name];
    elem.style[name] = options[name];
  }
  ret = callback.apply(elem, args || []);
  // Revert the old values
  for (name in options) {
    elem.style[name] = cleanedStyle(old[name]);
  }
  return ret;
}

// Temporarily eliminate transform (but reverse parent distortions)
// to get origin position; then calculate displacement needed to move
// turtle to target coordinates (again reversing parent distortions
// if possible).
function setCenterInPageCoordinates(elem, target, limit) {
  var totalParentTransform = totalTransform2x2(elem.parentElement),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      substTransform = swapout[transform] = (inverseParent ? 'matrix(' +
          $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      origin_gbcr = $.swap(elem, swapout, function() {
        return elem.getBoundingClientRect();
      }),
      middle = readTransformOrigin(elem,
          [origin_gbcr.width, origin_gbcr.height]),
      origin = addVector([origin_gbcr.left, origin_gbcr.top], middle),
      pos, current, translation;
  if (!inverseParent) { return; }
  if ($.isNumeric(limit)) {
    pos = addVector(matrixVectorProduct(totalParentTransform, tr), origin);
    current = {
      pageX: pos[0],
      pageY: pos[1]
    };
    target = limitMovement(current, target, limit);
  }
  $.style(elem, 'turtlePosition', matrixVectorProduct(inverseParent,
      subtractVector([target.pageX, target.pageY], origin)).join(' '));
}

// Uses getBoundingClientRect to figure out current position in page
// coordinates.  Works by backing out local transformation (and inverting
// any parent rotations and distortions) so that the bounding rect is
// rectilinear; then reapplies translation (under any parent distortion)
// to get the final x and y, returned as {pageX:, pagey:}.
function getCenterInPageCoordinates(elem) {
  if ($.isWindow(elem)) {
    return getCenterLTWH(
      $(window).scrollLeft(),
      $(window).scrollTop(),
      (window.innerWidth || $(window).width()),
      (window.innerHeight || $(window).height())
    );
  } else if (elem.nodeType === 9) {
    return getCenterLTWH(0, 0, $(elem).width(), $(elem).height());
  }
  var tr = getElementTranslation(elem),
      totalParentTransform = totalTransform2x2(elem.parentElement),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      st = swapout[transform] = (inverseParent ? 'matrix(' +
          $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      substTransform = (st == 'matrix(1, 0, 0, 1, 0, 0)') ? 'none' : st;
      saved = elem.style[transform],
      gbcr = cleanSwap(elem, swapout, function() {
        return elem.getBoundingClientRect();
      }),
      middle = readTransformOrigin(elem, [gbcr.width, gbcr.height]),
      origin = addVector([gbcr.left, gbcr.top], middle),
      pos = addVector(matrixVectorProduct(totalParentTransform, tr), origin);
  return {
    pageX: pos[0],
    pageY: pos[1]
  };
}

function polyToVectorsOffset(poly, offset) {
  if (!poly) { return null; }
  var result = [], j = 0;
  for (; j < poly.length; ++j) {
    result.push([poly[j].pageX + offset[0], poly[j].pageY + offset[1]]);
  }
  return result;
}

// Uses getBoundingClientRect to figure out the corners of the
// transformed parallelogram in page coordinates.
function getCornersInPageCoordinates(elem, untransformed) {
  if ($.isWindow(elem)) {
    return getStraightRectLTWH(
      $(window).scrollLeft(),
      $(window).scrollTop(),
      (window.innerWidth || $(window).width()),
      (window.innerHeight || $(window).height())
    );
  } else if (elem.nodeType === 9) {
    return getStraightRectLTWH(0, 0, $(elem).width(), $(elem).height());
  }
  var currentTransform = readTransformMatrix(elem) || [1, 0, 0, 1],
      totalParentTransform = totalTransform2x2(elem.parentElement),
      totalTransform = matrixProduct(totalParentTransform, currentTransform),
      inverseParent = inverse2x2(totalParentTransform),
      hidden = ($.css(elem, 'display') === 'none'),
      swapout = hidden ?
        { position: "absolute", visibility: "hidden", display: "block" } : {},
      substTransform = swapout[transform] = (inverseParent ? 'matrix(' +
          $.map(inverseParent, cssNum).join(', ') + ', 0, 0)' : 'none'),
      gbcr = $.swap(elem, swapout, function() {
        return elem.getBoundingClientRect();
      }),
      middle = readTransformOrigin(elem, [gbcr.width, gbcr.height]),
      origin = addVector([gbcr.left, gbcr.top], middle),
      hull = polyToVectorsOffset(getTurtleData(elem).hull, origin) || [
        [gbcr.left, gbcr.top],
        [gbcr.left, gbcr.bottom],
        [gbcr.right, gbcr.bottom],
        [gbcr.right, gbcr.top]
      ];
  if (untransformed) {
    // Used by the turtleHull css getter hook.
    return $.map(hull, function(pt) {
      return { pageX: pt[0] - origin[0], pageY: pt[1] - origin[1] };
    });
  }
  return $.map(hull, function(pt) {
    var tpt = translatedMVP(totalTransform, pt, origin);
    return { pageX: tpt[0], pageY: tpt[1] };
  });
}

function setDirectionOnPage(elem, target, limit) {
  var totalParentTransform = totalTransform2x2(elem.parentElement),
      inverseParent = inverse2x2(totalParentTransform),
      ts = readTurtleTransform(elem, true);
  if (!inverseParent) {
    return;
  }
  if ($.isNumeric(limit)) {
    var r = convertToRadians(ts.rot),
        ux = Math.sin(r), uy = Math.cos(r),
        up = matrixVectorProduct(totalParentTransform, [ux, uy]);
        d = radiansToDegrees(Math.atan2(up[0], up[1]));
    target = limitRotation(d, target, limit);
  }
  var rt = convertToRadians(target),
      lp = matrixVectorProduct(inverseParent, [Math.sin(rt), Math.cos(rt)]),
      tr = Math.atan2(lp[0], lp[1]);
  ts.rot = radiansToDegrees(tr);
  elem.style[transform] = writeTurtleTransform(ts);
}

function getDirectionOnPage(elem) {
  var ts = readTurtleTransform(elem, true),
      r = convertToRadians(ts.rot),
      ux = Math.sin(r), uy = Math.cos(r),
      totalParentTransform = totalTransform2x2(elem.parentElement),
      up = matrixVectorProduct(totalParentTransform, [ux, uy]);
      dp = Math.atan2(up[0], up[1]);
  return radiansToDegrees(dp);
}

function scrollWindowToDocumentPosition(pos, limit) {
  var tx = pos.pageX,
      ty = pos.pageY,
      ww = window.innerWidth || $(window).width(),
      wh = window.innerHeight || $(window).height(),
      b = $('body'),
      dw = b.width(),
      dh = b.height();
  if (tx > dw - ww / 2) { tx = dw - ww / 2; }
  if (tx < ww / 2) { tx = ww / 2; }
  if (ty > dh - wh / 2) { ty = dh - wh / 2; }
  if (ty < wh / 2) { ty = wh / 2; }
  targ = { pageX: tx, pageY: ty };
  if ($.isNumeric(limit)) {
    targ = limitMovement($(window).center(), targ, limit);
  }
  item.scrollLeft(targ.pageX - item.width() / 2);
  item.scrollTop(targ.pageY - item.height() / 2);
  return;
}

//////////////////////////////////////////////////////////////////////////
// HIT DETECTION AND COLLISIONS
// Deal with touching and enclosing element rectangles taking
// into account distortions from transforms.
//////////////////////////////////////////////////////////////////////////

function signedTriangleArea(pt0, pt1, pt2) {
  var x1 = pt1.pageX - pt0.pageX,
      y1 = pt1.pageY - pt0.pageY,
      x2 = pt2.pageX - pt0.pageX,
      y2 = pt2.pageY - pt0.pageY;
  return x2 * y1 - x1 * y2;
}

function signedDeltaTriangleArea(pt0, diff1, pt2) {
  var x2 = pt2.pageX - pt0.pageX,
      y2 = pt2.pageY - pt0.pageY;
  return x2 * diff1.pageY - diff1.pageX * y2;
}

function pointInConvexPolygon(pt, poly) {
  // Implements top google hit algorithm for
  // ["An efficient test for a point to be in a convex polygon"]
  if (poly.length <= 0) { return false; }
  if (poly.length == 1) {
    return poly[0].pageX == pt.pageX && poly[0].pageY == pt.pageY;
  }
  var a0 = signedTriangleArea(pt, poly[poly.length - 1], poly[0]);
  if (a0 === 0) { return true; }
  var positive = (a0 > 0);
  if (poly.length == 2) { return false; }
  for (var j = 1; j < poly.length; ++j) {
    var aj = signedTriangleArea(pt, poly[j - 1], poly[j]);
    if (aj === 0) { return true; }
    if ((aj > 0) != positive) { return false; }
  }
  return true;
}

function diff(v1, v0) {
  return { pageX: v1.pageX - v0.pageX, pageY: v1.pageY - v0.pageY };
}

// Given an edge [p0, p1] of polygon P, and the expected sign of [p0, p1, p]
// for p inside P, then determine if all points in the other poly have the
// opposite sign.
function edgeSeparatesPointAndPoly(inside, p0, p1, poly) {
  var d1 = diff(p1, p0), j, s;
  for (j = 0; j < poly.length; ++j) {
    s = sign(signedDeltaTriangleArea(p0, d1, poly[j]));
    if (!s || s === inside) { return false; }
  }
  return true;
}

function sign(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}

function convexPolygonSign(poly) {
  if (poly.length <= 2) { return 0; }
  var a = signedTriangleArea(poly[poly.length - 1], poly[0], poly[1]);
  if (a !== 0) { return sign(a); }
  for (var j = 1; j < poly.length; ++j) {
    a = signedTriangleArea(poly[j - 1], poly[j], poly[(j + 1) % poly.length]);
    if (a !== 0) { return sign(a); }
  }
  return 0;
}

function doConvexPolygonsOverlap(poly1, poly2) {
  // Implements top google hit for
  // ["polygon collision" gpwiki]
  var sign = convexPolygonSign(poly1), j;
  for (j = 0; j < poly1.length; ++j) {
    if (edgeSeparatesPointAndPoly(
        sign, poly1[j], poly1[(j + 1) % poly1.length], poly2)) {
      return false;
    }
  }
  sign = convexPolygonSign(poly2);
  for (j = 0; j < poly2.length; ++j) {
    if (edgeSeparatesPointAndPoly(
        sign, poly2[j], poly2[(j + 1) % poly2.length], poly1)) {
      return false;
    }
  }
  return true;
}

function doesConvexPolygonContain(polyOuter, polyInner) {
  // Just verify all vertices of polyInner are inside.
  for (var j = 0; j < polyInner.length; ++j) {
    if (!pointInConvexPolygon(polyInner[j], polyOuter)) {
      return false;
    }
  }
  return true;
}

// Google search for [Graham Scan Tom Switzer].
function convexHull(points) {
  function keepLeft(hull, r) {
    if (!r || !$.isNumeric(r.pageX) || !$.isNumeric(r.pageY)) { return hull; }
    while (hull.length > 1 && sign(signedTriangleArea(hull[hull.length - 2],
        hull[hull.length - 1], r)) != 1) { hull.pop(); }
    if (!hull.length || !equalPoint(hull[hull.length - 1], r)) { hull.push(r); }
    return hull;
  }
  function reduce(arr, valueInitial, fnReduce) {
    for (var j = 0; j < arr.length; ++j) {
      valueInitial = fnReduce(valueInitial, arr[j]);
    }
    return valueInitial;
  }
  function equalPoint(p, q) {
    return p.pageX === q.pageX && p.pageY === q.pageY;
  }
  function lexicalPointOrder(p, q) {
    return p.pageX < q.pageX ? -1 : p.pageX > q.pageX ? 1 :
           p.pageY < q.pageY ? -1 : p.pageY > q.pageY ? 1 : 0;
  }
  points.sort(lexicalPointOrder);
  var leftdown = reduce(points, [], keepLeft),
      rightup = reduce(points.reverse(), [], keepLeft);
  return leftdown.concat(rightup.slice(1, -1));
}

function parseTurtleHull(text) {
  if (!text) return null;
  var nums = $.map(text.trim().split(/\s+/), parseFloat), points = [], j = 0;
  while (j + 1 < nums.length) {
    points.push({ pageX: nums[j], pageY: nums[j + 1] });
    j += 2;
  }
  return points;
}

function readTurtleHull(elem) {
  return getTurtleData(elem).hull;
}

function writeTurtleHull(hull) {
  for (var j = 0, result = []; j < hull.length; ++j) {
    result.push(hull[j].pageX, hull[j].pageY);
  }
  return result.length ? $.map(result, cssNum).join(' ') : 'none';
}

function makeHullHook() {
  return {
    get: function(elem, computed, extra) {
      var hull = getTurtleData(elem).hull;
      return writeTurtleHull(hull ||
          getCornersInPageCoordinates(elem, true));
    },
    set: function(elem, value) {
      var hull =
        !value || value == 'auto' ? null :
        value == 'none' ? [] :
        convexHull(parseTurtleHull(value));
      getTurtleData(elem).hull = hull;
    }
  };
}

//////////////////////////////////////////////////////////////////////////
// TURTLE CSS CONVENTIONS
// For better performance, the turtle library always writes transform
// CSS in a canonical form; and it reads this form faster than generic
// matrices.
//////////////////////////////////////////////////////////////////////////

// The canonical 2D transforms written by this plugin have the form:
// translate(tx, ty) rotate(rot) scale(sx, sy) rotate(twi)
// (with each component optional).
// This function quickly parses this form into a canonicalized object.
function parseTurtleTransform(transform) {
  if (transform === 'none') {
    return {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
  }
  // Note that although the CSS spec doesn't allow 'e' in numbers, IE10
  // and FF put them in there; so allow them.
  var e = /^(?:translate\(([\-+.\de]+)(?:px)?,\s*([\-+.\de]+)(?:px)?\)\s*)?(?:rotate\(([\-+.\de]+)(?:deg)?\)\s*)?(?:scale\(([\-+.\de]+)(?:,\s*([\-+.\de]+))?\)\s*)?(?:rotate\(([\-+.\de]+)(?:deg)?\)\s*)?$/.exec(transform);
  if (!e) { return null; }
  var tx = e[1] ? parseFloat(e[1]) : 0,
      ty = e[2] ? parseFloat(e[2]) : 0,
      rot = e[3] ? parseFloat(e[3]) : 0,
      sx = e[4] ? parseFloat(e[4]) : 1,
      sy = e[5] ? parseFloat(e[5]) : sx,
      twi = e[6] ? parseFloat(e[6]) : 0;
  return {tx:tx, ty:ty, rot:rot, sx:sx, sy:sy, twi:twi};
}

function computeTurtleTransform(elem) {
  var m = readTransformMatrix(elem), d;
  if (!m) {
    return {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
  }
  d = decomposeSVD(m);
  return {
    tx: m[4], ty: m[5], rot: radiansToDegrees(d[0]),
    sx: d[1], sy: d[2], twi: radiansToDegrees(d[3])
  };
}

function readTurtleTransform(elem, computed) {
  return parseTurtleTransform(elem.style[transform]) ||
      (computed && computeTurtleTransform(elem));
}

function cssNum(n) {
  var r = n.toString();
  if (r.indexOf('e') >= 0) {
    r = n.toFixed(17);
  }
  return r;
}

function writeTurtleTransform(ts) {
  var result = [];
  if (nonzero(ts.tx) || nonzero(ts.ty)) {
    result.push(
      'translate(' + cssNum(ts.tx) + 'px, ' + cssNum(ts.ty) + 'px)');
  }
  if (nonzero(ts.rot) || nonzero(ts.twi)) {
    result.push('rotate(' + cssNum(ts.rot) + 'deg)');
  }
  if (nonzero(1 - ts.sx) || nonzero(1 - ts.sy)) {
    if (nonzero(ts.sx - ts.sy)) {
      result.push('scale(' + cssNum(ts.sx) + ', ' + cssNum(ts.sy) + ')');
    } else {
      result.push('scale(' + cssNum(ts.sx) + ')');
    }
  }
  if (nonzero(ts.twi)) {
    result.push('rotate(' + cssNum(ts.twi) + 'deg)');
  }
  if (!result.length) {
    return 'none';
  }
  return result.join(' ');
}

function radiansToDegrees(r) {
  d = r * 180 / Math.PI;
  if (d > 180) { d -= 360; }
  return d;
}

function convertToRadians(d) {
  return d * Math.PI / 180;
}

function normalizeRotation(x) {
  if (Math.abs(x) > 180) {
    x = x % 360;
    if (x > 180) { x -= 360; }
    else if (x <= -180) { x += 360; }
  }
  return x;
}

//////////////////////////////////////////////////////////////////////////
// TURTLE DRAWING SUPPORT
// If pen, erase, or dot are used, then a full-page canvas is created
// and used for drawing.
//////////////////////////////////////////////////////////////////////////

// drawing state.
var drawing = {
  ctx: null,
  canvas: null,
  timer: null
};

function getTurtleDrawingCtx() {
  if (drawing.ctx) {
    return drawing.ctx;
  }
  var div = document.createElement('div');
  $('body').prepend('<div id="_turtlesurface" ' +
    'style="position:absolute;top:0;left:0;zIndex:-1;width:100%;' +
    'height:100%;overflow:hidden;"><canvas></div>');
  drawing.canvas = $('#_turtlesurface canvas')[0];
  drawing.ctx = drawing.canvas.getContext('2d');
  resizecanvas();
  pollbodysize(resizecanvas);
  $(window).resize(resizecanvas);
  return drawing.ctx;
}

function pollbodysize(callback) {
  var b = $('body');
  var lastwidth = b.width();
  var lastheight = b.height();
  var poller = (function() {
    if (b.width() != lastwidth || b.height() != lastheight) {
      callback();
      lastwidth = b.width();
      lastheight = b.height();
    }
  });
  if (drawing.timer) {
    clearInterval(drawing.timer);
  }
  drawing.timer = setInterval(poller, 250);
}

function resizecanvas() {
  if (!drawing.canvas) return;
  var b = $('body'),
      wh = Math.max(b.height(), window.innerHeight || $(window).height()),
      bw = Math.max(1500, Math.ceil(b.width() / 100) * 100),
      bh = Math.max(1500, Math.ceil(wh / 100) * 100),
      cw = drawing.canvas.width,
      ch = drawing.canvas.height,
      tc;
  $('#_turtlesurface').css({ width: b.width() + 'px', height: wh + 'px'});
  if (cw != bw || ch != bh) {
    // Transfer canvas out to tc and back again after resize.
    tc = document.createElement('canvas');
    tc.width = Math.min(cw, bw);
    tc.height = Math.min(ch, bh);
    tc.getContext('2d').drawImage(drawing.canvas, 0, 0);
    drawing.canvas.width = bw;
    drawing.canvas.height = bh;
    drawing.canvas.getContext('2d').drawImage(tc, 0, 0);
  }
}

// turtlePen style syntax
function parsePenStyle(text, defaultProp) {
  if (!text) { return null; }
  text = text.trim();
  if (!text || text === 'none') { return null; }
  if (text === 'path') { return { savePath: true }; }
  var words = text.split(/\s+/),
      mapping = {
        strokeStyle: identity,
        lineWidth: parseFloat,
        lineCap: identity,
        lineJoin: identity,
        miterLimit: parseFloat,
        fillStyle: identity,
      },
      result = {}, j, end = words.length;
  for (j = words.length - 1; j >= 0; --j) {
    if (mapping.hasOwnProperty(words[j])) {
      var key = words[j],
          param = words.slice(j + 1, end).join(' ');
      result[key] = mapping[key](param);
      end = j;
    }
  }
  if (end > 0 && !result[defaultProp]) {
    result[defaultProp] = words.slice(0, end).join(' ');
  }
  return result;
}

function writePenStyle(style) {
  if (!style) { return 'none'; }
  var result = [];
  $.each(style, function(k, v) {
    result.push(k);
    result.push(v);
  });
  return result.join(' ');
}

function getTurtleData(elem) {
  var state = $.data(elem, 'turtleData');
  if (!state) {
    state = $.data(elem, 'turtleData', { style: null, path: [] });
  }
  return state;
}

function makePenHook() {
  return {
    get: function(elem, computed, extra) {
      return writePenStyle(getTurtleData(elem).style);
    },
    set: function(elem, value) {
      var style = parsePenStyle(value, 'strokeStyle');
      getTurtleData(elem).style = style;
      elem.style.turtlePen = writePenStyle(style);
      if (style) {
        flushPenState(elem);
      }
    }
  };
}

function isPointNearby(a, b) {
  return Math.round(a.pageX - b.pageX) === 0 &&
         Math.round(a.pageY - b.pageY) === 0;
}

function applyPenStyle(ctx, ps) {
  if (!ps || !('strokeStyle' in ps)) { ctx.strokeStyle = 'black'; }
  if (!ps || !('lineWidth' in ps)) { ctx.lineWidth = 1.62; }
  if (!ps || !('lineCap' in ps)) { ctx.lineCap = 'round'; }
  if (ps) {
    for (var a in ps) {
      if (a === 'path') { continue; }
      ctx[a] = ps[a];
    }
  }
}

function flushPenState(elem) {
  var state = getTurtleData(elem);
  if (!state.style) {
    if (state.path.length) { state.path.length = 0; }
    return;
  }
  var center = getCenterInPageCoordinates(elem);
  // Once the pen is down, the origin needs to be stable when the image
  // loads.
  watchImageToFixOriginOnLoad(elem);
  if (!state.path.length ||
      !isPointNearby(center, state.path[state.path.length - 1])) {
    state.path.push(center);
  }
  if (!state.style.path) {
    var ctx = getTurtleDrawingCtx();
        isClosed = isPointNearby(
            state.path[0], state.path[state.path.length - 1]);
    ctx.save();
    applyPenStyle(ctx, state.style);
    ctx.beginPath();
    ctx.moveTo(state.path[0].pageX, state.path[0].pageY);
    for (var j = 1; j < state.path.length - (isClosed ? 1 : 0); ++j) {
      ctx.lineTo(state.path[j].pageX, state.path[j].pageY);
    }
    if (isClosed) { ctx.closePath(); }
    if ('fillStyle' in state.style) { ctx.fill(); }
    if ('strokeStyle' in state.style) { ctx.stroke(); }
    ctx.restore();
    state.path.splice(0, state.path.length - 1);
  }
}

function fillDot(position, diameter, style) {
  var ctx = getTurtleDrawingCtx();
  ctx.save();
  applyPenStyle(ctx, style);
  ctx.beginPath();
  ctx.arc(position.pageX, position.pageY, diameter / 2, 0, 2*Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function eraseBox(elem, style) {
  var c = getCornersInPageCoordinates(elem),
      ctx = getTurtleDrawingCtx(),
      j = 1;
  if (!c || c.length < 3) { return; }
  ctx.save();
  // Clip to box and use 'copy' mode so that 'transparent' can be
  // written into the canvas - that's better erasing than 'white'.
  ctx.globalCompositeOperation = 'copy';
  applyPenStyle(ctx, style);
  ctx.beginPath();
  ctx.moveTo(c[0].pageX, c[0].pageY);
  for (; j < c.length; j += 1) {
    ctx.lineTo(c[j].pageX, c[j].pageY);
  }
  ctx.closePath();
  ctx.clip();
  ctx.fill();
  ctx.restore();
}

//////////////////////////////////////////////////////////////////////////
// JQUERY METHOD SUPPORT
// Functions in direct support of exported methods.
//////////////////////////////////////////////////////////////////////////

function doQuickMove(elem, distance) {
  var ts = readTurtleTransform(elem, true),
      r = (ts || 0) && convertToRadians(ts.rot),
      dy = -Math.cos(r) * distance,
      dx = Math.sin(r) * distance;
  if (!ts) { return; }
  ts.tx += dx;
  ts.ty += dy;
  elem.style[transform] = writeTurtleTransform(ts);
  flushPenState(elem);
}

function isPageCoordinate(obj) {
  return $.isNumeric(obj.pageX) && $.isNumeric(obj.pageY);
}

function makeTurtleDisplacementHook() {
  return {
    get: function(elem, computed, extra) {
      var ts = readTurtleTransform(elem, computed);
      if (ts) {
        var r = convertToRadians(ts.rot),
            c = Math.cos(r),
            s = Math.sin(r);
        return ts.tx * s - ts.ty * c;
      }
    },
    set: function(elem, value) {
      var ts = readTurtleTransform(elem, true) ||
              {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0},
          v = parseFloat(value),
          r = convertToRadians(ts.rot),
          c = Math.cos(r),
          s = Math.sin(r),
          p = ts.tx * c + ts.ty * s;
      ts.tx = p * c + v * s;
      ts.ty = p * s - v * c;
      elem.style[transform] = writeTurtleTransform(ts);
      flushPenState(elem);
    }
  };
}

// Finally, add turtle support.
function makeTurtleHook(prop, normalize, displace) {
  return {
    get: function(elem, computed, extra) {
      var ts = readTurtleTransform(elem, computed);
      if (ts) { return '' + ts[prop]; }
    },
    set: function(elem, value) {
      var ts = readTurtleTransform(elem, true) ||
          {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
      ts[prop] = normalize(value);
      elem.style[transform] = writeTurtleTransform(ts);
      if (displace) {
        flushPenState(elem);
      }
    }
  };
}

function makeRotationStep(prop) {
  return function(fx) {
    if (!fx.delta) {
      fx.delta = normalizeRotation(fx.end - fx.start);
      fx.start = fx.end - fx.delta;
    }
    $.cssHooks[prop].set(fx.elem, fx.start + fx.delta * fx.pos);
  };
}

function splitPair(text, duplicate) {
  if (text.length && text[0] === '_') {
    // Hack: remove forced number non-conversion.
    text = text.substring(1);
  }
  var result = $.map(('' + text).split(/\s+/), parseFloat);
  while (result.length < 2) {
    result.push(duplicate ?
        (!result.length ? 1 : result[result.length - 1]) : 0);
  }
  return result;
}

function makePairStep(prop, displace) {
  return function(fx) {
    if (!fx.delta) {
      var end = splitPair(fx.end, !displace);
      fx.start = splitPair(fx.start, !displace);
      fx.delta = [end[0] - fx.start[0], end[1] - fx.start[1]];
    }
    $.cssHooks[prop].set(fx.elem, [fx.start[0] + fx.delta[0] * fx.pos,
        fx.start[1] + fx.delta[1] * fx.pos].join(' '));
  };
}

var XY = ['X', 'Y'];
function makeTurtleXYHook(publicname, propx, propy, displace) {
  return {
    get: function(elem, computed, extra) {
      var ts = readTurtleTransform(elem, computed);
      if (ts) {
        if (displace || ts[propx] != ts[propy]) {
          // Hack: if asked to convert a pair to a number by fx, then refuse.
          return (extra === '' ? '_' : '') + ts[propx] + ' ' + ts[propy];
        } else {
          return '' + ts[propx];
        }
      }
    },
    set: function(elem, value, extra) {
      var ts = readTurtleTransform(elem, true) ||
              {tx: 0, ty: 0, rot: 0, sx: 1, sy: 1, twi: 0};
      var parts = (typeof(value) == 'string' ? value.split(/\s+/) : [value]);
      if (parts.length < 1 || parts.length > 2) { return; }
      if (parts.length >= 1) { ts[propx] = parts[0]; }
      if (parts.length >= 2) { ts[propy] = parts[1]; }
      else if (!displace) { ts[propy] = ts[propx]; }
      else { ts[propy] = 0; }
      elem.style[transform] = writeTurtleTransform(ts);
      if (displace) {
        flushPenState(elem);
      }
    }
  };
}

function watchImageToFixOriginOnLoad(elem) {
  if (!elem || elem.tagName !== 'IMG' && elem.complete ||
      $.data(elem, 'turtleFixingOrigin')) {
    return;
  }
  $.data(elem, 'turtleFixingOrigin', true);
  var oldOrigin = readTransformOrigin(elem,
          [$(elem).width(), $(elem).height()]),
      fixOrigin = function() {
    var newOrigin = readTransformOrigin(elem,
            [$(elem).width(), $(elem).height()]),
        ts = readTurtleTransform(elem, true);
    $.removeData(elem, 'turtleFixingOrigin');
    ts.tx += oldOrigin[0] - newOrigin[0];
    ts.ty += oldOrigin[1] - newOrigin[1];
    elem.style[transform] = writeTurtleTransform(ts);
    jQuery.event.remove(elem, 'load', fixOrigin);
  };
  jQuery.event.add(elem, 'load', fixOrigin);
}

//////////////////////////////////////////////////////////////////////////
// JQUERY REGISTRATION
// Register all our hooks.
//////////////////////////////////////////////////////////////////////////

$.extend(true, $, {
  cssHooks: {
    turtlePen: makePenHook(),
    turtleDisplacement: makeTurtleDisplacementHook(),
    turtlePosition: makeTurtleXYHook('turtlePosition', 'tx', 'ty', true),
    turtlePositionX: makeTurtleHook('tx', identity, true),
    turtlePositionY: makeTurtleHook('ty', identity, true),
    turtleRotation: makeTurtleHook('rot', normalizeRotation),
    turtleScale: makeTurtleXYHook('turtleScale', 'sx', 'sy', false),
    turtleScaleX: makeTurtleHook('sx', identity),
    turtleScaleY: makeTurtleHook('sy', identity),
    turtleTwist: makeTurtleHook('twi', normalizeRotation),
    turtleHull: makeHullHook()
  },
  cssNumber: {
    turtleRotation: true,
    turtleScale: true,
    turtleScaleX: true,
    turtleScaleY: true,
    turtleTwist: true
  },
  support: {
    turtle: true
  }
});
$.extend(true, $.fx, {
  step: {
    turtlePosition: makePairStep('turtlePosition', true),
    turtleRotation: makeRotationStep('turtleRotation'),
    turtleScale: makePairStep('turtlePosition', false),
    turtleTwist: makeRotationStep('turtleTwist')
  },
  speeds: {
    turtle: 0
  }
});

var turtlefn = {
  rt: function(amount, seconds) {
    return this.animate({'turtleRotation': '+=' + amount},
          $.isNumeric(seconds) ? 1000 * seconds : 'turtle');
  },
  lt: function(amount, seconds) {
    return this.animate({'turtleRotation': '-=' + amount},
          $.isNumeric(seconds) ? 1000 * seconds : 'turtle');
  },
  fd: function(amount, seconds) {
    // Fast path: do the move directly when there is no animation.
    if ($.isNumeric(seconds) ? !seconds : !$.fx.speeds.turtle) {
      return this.each(function(j, elem) {
        var q = $.queue(elem), doqueue = (q && q.length > 0);
        function domove() {
          doQuickMove(elem, amount);
          if (doqueue) { $.dequeue(elem); }
        }
        if (doqueue) { q.push(domove); } else { domove(); }
      });
    }
    return this.animate({'turtleDisplacement': '+=' + amount},
          $.isNumeric(seconds) ? 1000 * seconds : 'turtle');
  },
  bk: function(amount, seconds) {
    return this.fd(-amount, seconds);
  },
  pen: function(penstyle) {
    return this.each(function(j, elem) {
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function dodraw() {
        $.style(elem, 'turtlePen', penstyle);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(dodraw); } else { dodraw(); }
    });
  },
  dot: function(style, diameter) {
    if ($.isNumeric(style) && typeof(diameter) == 'undefined') {
      diameter = style;
      style = 0;
    }
    if (typeof(diameter) == 'undefined') { diameter = 8.8; }
    if (!style) { style = 'black'; }
    var ps = parsePenStyle(style, 'fillStyle');
    return this.each(function(j, elem) {
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function dodraw() {
        var c = $(elem).center();
        fillDot(c, diameter, ps);
        // Once drawing begins, origin must be stable.
        watchImageToFixOriginOnLoad(elem);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(dodraw); } else { dodraw(); }
    });
  },
  erase: function(style) {
    if (!style) { style = 'transparent'; }
    var ps = parsePenStyle(style, 'fillStyle');
    return this.each(function(j, elem) {
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function dodraw() {
        eraseBox(elem, ps);
        // Once drawing begins, origin must be stable.
        watchImageToFixOriginOnLoad(elem);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(dodraw); } else { dodraw(); }
    });
  },
  reload: function() {
    // Used to reload images to cycle animated gifs.
    return this.each(function(j, elem) {
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function dodraw() {
        if ($.isWindow(elem) || elem.nodeType === 9) {
          window.location.reload();
          return;
        }
        if (elt.src) {
          var src = elt.src;
          elt.src = '';
          elt.src = src;
        }
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(dodraw); } else { dodraw(); }
    });
  },
  center: function() {
    if (!this.length) return;
    return getCenterInPageCoordinates(this[0]);
  },
  moveto: function(position, limit) {
    if ($.isNumeric(position) && $.isNumeric(limit)) {
      position = { pageX: parseFloat(position), pageY: parseFloat(limit) };
      limit = null;
    }
    return this.each(function(j, elem) {
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function domove() {
        var pos = position;
        if (pos && !isPageCoordinate(pos)) { pos = $(pos).center(); }
        if (!pos || !isPageCoordinate(pos)) return this;
        if ($.isWindow(elem)) {
          scrollWindowToDocumentPosition(pos, limit);
          return;
        } else if (elem.nodeType === 9) {
          return;
        }
        setCenterInPageCoordinates(elem, pos, limit);
        // moveto implies a request for a stable origin.
        watchImageToFixOriginOnLoad(elem);
        flushPenState(elem);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(domove); } else { domove(); }
    });
  },
  direction: function() {
    if (!this.length) return;
    var elem = this[0], dir;
    if ($.isWindow(elem) || elem.nodeType === 9) return 0;
    return getDirectionOnPage(elem);
  },
  turnto: function(direction, limit) {
    return this.each(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function domove() {
        if (!$.isNumeric(direction)) {
          var pos = direction, cur = $(elem).center();
          if (pos && !isPageCoordinate(pos)) { pos = $(pos).center(); }
          if (!pos || !isPageCoordinate(pos)) return;
          direction = radiansToDegrees(
              Math.atan2(pos.pageX - cur.pageX, cur.pageY - pos.pageY));
        }
        setDirectionOnPage(elem, direction, limit);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(domove); } else { domove(); }
    });
  },
  mirror: function(val) {
    if (typeof val === 'undefined') {
      var c = $.map(this.css('turtleScale').split(' '), parseFloat),
          p = c[0] * (c.length > 1 ? c[1] : 1);
      return (p < 0);
    }
    return this.each(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function domove() {
        var c = $.map($.css(elem, 'turtleScale').split(' '), parseFloat);
        if (c.length === 1) { c.push(c[0]); }
        if ((c[0] * c[1] < 0) === (!val)) {
          c[0] = -c[0];
        }
        $.style(elem, 'turtleScale', c.join(' '));
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(domove); } else { domove(); }
    });
  },
  twist: function(val) {
    if (typeof val === 'undefined') {
      return parseFloat(this.css('turtleTwist'));
    }
    return this.each(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function domove() {
        $.style(elem, 'turtleTwist', val);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(domove); } else { domove(); }
    });
  },
  scale: function(valx, valy) {
    if (typeof valx === 'undefined' && typeof valy === 'undefined') {
      return parseFloat(this.css('turtleTwist'));
    }
    var val = '' + cssNum(valx) +
        (typeof valy === 'undefined' ? '' : ' ' + cssNum(valy));
    return this.each(function(j, elem) {
      if ($.isWindow(elem) || elem.nodeType === 9) return;
      var q = $.queue(elem), inqueue = (q && q.length > 0);
      function domove() {
        $.style(elem, 'turtleScale', val);
        if (inqueue) { $.dequeue(elem); }
      }
      if (inqueue) { q.push(domove); } else { domove(); }
    });
  },
  shown: function() {
    return this.is(':visible');
  },
  hidden: function() {
    return this.is(':hidden');
  },
  encloses: function(arg, y) {
    if (!this.length || this.hidden()) return false;
    if ($.isNumeric(arg) && $.isNumeric(y)) {
      arg = [{ pageX: arg, pageY: y }];
    }
    if (!arg) return true;
    if (typeof arg === 'string') { arg = $(arg); }
    if (!arg.jquery && !$.isArray(arg)) { arg = [arg]; }
    var elem = this[0],
        encloser = getCornersInPageCoordinates(elem),
        allok = true, j = 0, k, obj;
    for (; allok && j < arg.length; ++j) {
      obj = arg[j];
      if (isPageCoordinate(obj)) {
        allok &= pointInConvexPolygon(obj, encloser);
      } else {
        allok &= doesConvexPolygonContain(
          polyOuter, getCornersInPageCoordinates(obj));
      }
    }
    return !!allok;
  },
  touches: function(arg, y) {
    if (this.hidden()) { return false; }
    if ($.isNumeric(arg) && $.isNumeric(y)) {
      arg = [{ pageX: arg, pageY: y }];
    }
    if (!arg) return false;
    if (typeof arg === 'string') { arg = $(arg); }
    if (!arg.jquery && !$.isArray(arg)) { arg = [arg]; }
    var elem = this[0],
        toucher = getCornersInPageCoordinates(elem),
        anyok = false, j = 0, k, obj;
    for (;!anyok && j < arg.length; ++j) {
      obj = arg[j];
      if (isPageCoordinate(obj)) {
        anyok |= pointInConvexPolygon(obj, toucher);
      } else {
        anyok |= doConvexPolygonsOverlap(
          toucher, getCornersInPageCoordinates(obj));
      }
    }
    return !!anyok;
  }
};

$.fn.extend(turtlefn);


//////////////////////////////////////////////////////////////////////////
// TURTLE GLOBAL ENVIRONMENT
// Implements educational support when $.turtle() is called:
// * Looks for an element #id to use as the turtle (id defaults to 'turtle').
// * If not found, does a hatch(id).
// * Turns every #id into a global variable.
// * Sets up globals for "lastclick", "lastmousemove" etc.
// * Sets up global functions for all turtle functions for the main turtle.
// * Sets up a global "tick" function.
// * Sets up a global "speed" function and does a speed(10) by default.
// * Sets up a global "hatch" function to make a new turtle.
//////////////////////////////////////////////////////////////////////////

var turtleGIFUrl = "data:image/gif;base64,R0lGODlhKAAvAPIHAAFsOACSRQ2ZRQySQzCuSBygRQ+DPv///yH5BAlkAAcAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAKAAvAAAD/ni63P4wygVqnVjWQnoBWdgAXdmBYkiaJZpiK0u4ryafNUwYw0AUHFruARgEjkiBcOgAAJ+FwXJSMcwglqwlFcMxskZkIbDNAKwmlOUoQB4JyDK1a7AMxm4k3K3NNlkVRwVteQF4bnVnJR9/J0VihQKHeU4mjCMzhYN5m5EfgE2BeQJ7eoUBkm10RKeGeKQEhGKHfaynpIMCkrF6kxcRRbJuk3o/HcJkGndAsqSnHW/Iv7aoHEDQhaVAeXXA2YvIpYaFUwdnz4S4gxy6b+RYBs+ci0+wUJdNrcSubri6AgMAlhPVT1w0NwbjeBvmoWCehAG6YWFzTBcvNsT2RSxnfM5atlkO3y28BQcWw30cFQBoBYseM5NxtBBZqUkWB4Pbjji5OYVgEmIXHVYqYYBIpmHIOhWqAwoTASlJkKGSSqbLjCUxqjjzRK7PNAqWqrQKYPCrjRYqaWqKKaILPnNrIm40C8OAgQ8cZTIx42Wvjrd+gUkMrIEu4cMLEgAAIfkECWQABwAsAAAAACgALwCCAm04AJJFDZlFDJJDL65IHKBGDIM+////A/54utz+MMoFgKkzy1qIL4AmNoBneuEolqeZqhnbEi+8zagdE8YwEIVOTfewBI5IwZDoAASfBSUzUqlalwcnCgup9pCBQqDKqJy4pAoYTECSzefmtSIQr492N9wld6nDAndhglo5TWcAgXh3dYIXQkuFNHdRa5WMIBiHHwCCbWyKYHUCF10Wf5R2Ah6heHloCqhrqwK1dUBIuHobA61Il2wnvrAAA0+hq4JBRwS1YJpFSR1BHp5JvqUQBncnwMzSd1yyuYG1QHUdzoNr4p3coh0f1KtAUO3KqaLntrXigslrmrERNIZKq3h5AgDMRRCNO3q2BB5pBCbhri7T3rlC9naJ3QaCCtusSpjRYxorBXzMagHFXMcxkajRcGcpVDyFv14V6WYEXkBfIZVAoxCPU82jggY4wWIB0TVGQGEakjMnZFKLUvms6EXwJUwZPFRU8aRIU1OtI6p+HQIW1oQ5RZykdPvWg4EpaYHQxZtlKV8NZP4KZpAAADs=";

var eventfn = { click:1, mouseup:1, mousedown:1, mousemove:1,
    keydown:1, keypress:1, keyup:1 };

var turtle_globals = [];

$.turtle = function turtle(id, options) {
  if (!arguments.length) {
    id = 'turtle';
  }
  if (arguments.length == 1 && typeof(id) == 'object' && id &&
      !id.hasOwnProperty('length')) {
    options = id;
    id = 'turtle';
  }
  options = options || {};
  // Clear any previous turtle methods.
  for (var j = 0; j < turtle_globals.length; ++j) {
    delete window[turtle_globals[j]];
  }
  turtle_globals = [];
  // Expand any <script type="text/html"> unless htmlscript is false.
  if (!options.hasOwnProperty('htmlscript') || options.htmlscript) {
    $('script[type="text/html"]').each(function() {
        $(this).replaceWith(
            $(this).html().replace(/^\x3c!\[CDATA\[\n?|\]\]\x3e$/g, ''));
    });
  }
  // Set up global events.
  if (!options.hasOwnProperty('events') || options.events) {
    turtleevents(options.eventprefix);
  }
  // Set up global objects by id.
  if (!options.hasOwnProperty('ids') || options.ids) {
    turtleids(options.idprefix);
  }
  // Set up global log function.
  if (!options.hasOwnProperty('see') || options.see) {
    exportsee();
    if (window.addEventListener) {
      window.addEventListener('error', see);
    } else {
      window.onerror = see;
    }
  }
  // Set up test console.
  if (!options.hasOwnProperty('panel') || options.panel) {
    see.init({title: 'Turtle test panel'});
  }
  // Set up an easy integer random function.
  if (!options.hasOwnProperty('random') || options.random) {
    window.random = random;
  }
  // Set up global tick function.
  if (!options.hasOwnProperty('tick') || options.tick) {
    window.tick = tick;
  }
  // Set up global speed function and set a default speed.
  if (!options.hasOwnProperty('tick') || options.tick) {
    window.speed = speed;
    speed(10);
  }
  // Set up global hatch function.
  if (!options.hasOwnProperty('hatch') || options.hatch) {
    window.hatch = hatch;
    speed(10);
  }
  // Find or create a turtle if one does not exist.
  var selector = null;
  if (id) {
    selector = $('#' + id);
    if (!selector.length) {
      hatch(id);
      selector = $('#' + id);
      if (!selector.length) { selector = null; }
    }
  }
  // Make the methods of the turtle global.
  if (selector) {
    var domfn = {append:1, prepend:1};
    var extraturtlefn = {show:1, hide:1, css:1};
    var globalfn = $.extend({}, turtlefn, extraturtlefn, eventfn, domfn);
    for (var jqfn in globalfn) {
      if ($.fn.hasOwnProperty(jqfn) && !(jqfn in window)) {
        var obj;
        if ((!options.hasOwnProperty('handlers') || options.handlers) &&
            (eventfn.hasOwnProperty(jqfn) || jqfn == 'erase')) {
          // Attach main event handlers to the window, not the turtle.
          obj = $(window);
        } else if (domfn[jqfn]) {
          // Attach inner HTML manipulation to the document body.
          obj = $('body');
        } else {
          obj = $(selector);
        }
        window[jqfn] = (function() {
          var method = obj[jqfn];
          var target = obj;
          return (function() {
            return method.apply(target, arguments); });
        })();
        turtle_globals.push(jqfn);
      }
    }
  }
};

// Turtle creation function.
function hatch(name) {
  // Don't create the same named turtle twice.
  if (name && $('#' + name).length) { return; }
  // Create an image element with the requested name.
  var result = $('<img ' +
      (name ? 'id="' + name + '" ' : '') +
      'style="position:absolute;top:0;left:0;' +
      'width:40px;height:47px;opacity:0.5;" ' +
      'src="' + turtleGIFUrl + '">').appendTo('body').moveto(document).
      css('turtleHull', '-16 -6 -16 14 0 -23 16 14 16 -6 0 21');
  if (name) {
    window[name] = result;
  }
  // Move it to the center of the document and export the name as a global.
  return result;
}

// Simplify Math.floor(Math.random() * N) and also random choice.
function random(arg) {
  if (!arguments.length) { return Math.random(); }
  if (typeof(arg) == 'number') { return Math.floor(Math.random() * arg); }
  if (typeof(arg) == 'object' && arg.length && arg.slice) {
    return arg[Math.floor(Math.random() * arg.length)];
  }
}

// Simplify setInterval(fn, 1000) to just tick(fn).
var tickinterval = null;
function tick(rps, fn) {
  fn = arguments.length >= 2 ? fn : rps;
  rps = arguments.length > 1 && $.isNumeric(rps) ? rps : 1;
  if (tickinterval) {
    window.clearInterval(tickinterval);
    tickinterval = null;
  }
  if (fn && rps) {
    tickinterval = window.setInterval(fn, 1000 / rps);
  }
}

// Allow speed to be set in moves per second.
function speed(mps) {
  if (typeof mps == 'undefined') {
    return 1000 / $.fx.speeds.turtle;
  } else {
    $.fx.speeds.turtle = mps > 0 ? 1000 / mps : 0;
  }
}

// Simplify $('#x').move() to just x.move()
function turtleids(prefix) {
  if (typeof prefix == 'undefined') {
    prefix = '';
  }
  $('[id]').each(function(j, item) {
    window[prefix + item.id] = $('#' + item.id);
  });
}

// Simplify $(window).click(function(e) { x.moveto(e); } to just
// x.moveto(lastclick).
var eventsaver = null;
function turtleevents(prefix) {
  if (typeof prefix == 'undefined') {
    prefix = 'last';
  }
  if (eventsaver) {
    $(window).off($.map(eventfn, function(x,k) { return k; }).join(' '),
        eventsaver);
  }
  if (prefix || prefix === '') {
    eventsaver = (function(e) {
      window[prefix + e.type] = e;
    });
    $(window).on($.map(eventfn, function(x,k) { return k; }).join(' '),
        eventsaver);
    for (var k in eventfn) {
      if (eventfn.hasOwnProperty(k)) {
        window[prefix + k] = null;
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////////
// SEE LOGGING SUPPORT
// A copy of see.js here.
//////////////////////////////////////////////////////////////////////////

// see.js version 0.1

var seepkg = 'see'; // Defines the global package name used.
var version = '0.1';
var oldvalue = noteoldvalue(seepkg);
// Option defaults
var linestyle = 'position:relative;font-family:monospace;' +
  'word-break:break-all;margin-bottom:3px;padding-left:1em;';
var logdepth = 5;
var autoscroll = false;
var logelement = 'body';
var panel = true;
var see;  // defined below.
var paneltitle = '';
var logconsole = null;
var uselocalstorage = '_loghistory';
var panelheight = 100;
var currentscope = '';
var scopes = {
  '':  { e: window.eval, t: window },
  top: { e: window.eval, t: window }
};
var coffeescript = window.CoffeeScript;
var seejs = '(function(){return eval(arguments[0]);})';

// If see has already been loaded, then return without doing anything.
if (window.see && window.see.js && window.see.js == seejs &&
    window.see.version == version) {
  return;
}


function init(options) {
  if (arguments.length === 0) {
    options = {};
  } else if (arguments.length == 2) {
    var newopt = {};
    newopt[arguments[0]] = arguments[1];
    options = newopt;
  } else if (arguments.length == 1 && typeof arguments[0] == 'function') {
    options = {'eval': arguments[0]};
  }
  if (options.hasOwnProperty('jQuery')) { $ = options.jQuery; }
  if (options.hasOwnProperty('eval')) { scopes[''].e = options['eval']; }
  if (options.hasOwnProperty('this')) { scopes[''].t = options['this']; }
  if (options.hasOwnProperty('element')) { logelement = options.element; }
  if (options.hasOwnProperty('autoscroll')) { autoscroll = options.autoscroll; }
  if (options.hasOwnProperty('linestyle')) { linestyle = options.linestyle; }
  if (options.hasOwnProperty('depth')) { logdepth = options.depth; }
  if (options.hasOwnProperty('panel')) { panel = options.panel; }
  if (options.hasOwnProperty('height')) { panelheight = options.height; }
  if (options.hasOwnProperty('title')) { paneltitle = options.title; }
  if (options.hasOwnProperty('console')) { logconsole = options.console; }
  if (options.hasOwnProperty('history')) { uselocalstorage = options.history; }
  if (options.hasOwnProperty('coffee')) { coffeescript = options.coffee; }
  if (options.hasOwnProperty('noconflict')) { noconflict(options.noconflict); }
  if (panel) {
    // panel overrides element and autoscroll.
    logelement = '#_testlog';
    autoscroll = '#_testscroll';
    loadjQueryIfNotPresent(tryinitpanel);
  }
  return scope();
}

function scope(name, evalfuncarg, evalthisarg) {
  if (arguments.length <= 1) {
    if (!arguments.length) {
      name = '';
    }
    return seepkg + '.scope(' + cstring(name) + ',' + seejs + ',this)';
  }
  scopes[name] = { e: evalfuncarg, t: evalthisarg };
}

function seeeval(scope, code) {
  if (arguments.length == 1) {
    code = scope;
    scope = '';
  }
  var ef = scopes[''].e, et = scopes[''].t;
  if (scopes.hasOwnProperty(scope)) {
    if (scopes[scope].e) { ef = scopes[scope].e; }
    if (scopes[scope].t) { et = scopes[scope].t; }
  }
  return ef.call(et, code);
}

var varpat = '[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*';
var initialvardecl = new RegExp(
  '^\\s*var\\s+(?:' + varpat + '\\s*,)*' + varpat + '\\s*;\\s*');

function barecs(s) {
  // Compile coffeescript in bare mode.
  var compiler = coffeescript || window.CoffeeScript;
  var compiled = compiler.compile(s, {bare:1});
  if (compiled) {
    // Further strip top-level var decls out of the coffeescript so
    // that assignments can leak out into the enclosing scope.
    compiled = compiled.replace(initialvardecl, '');
  }
  return compiled;
}

function exportsee() {
  see.repr = repr;
  see.loghtml = loghtml;
  see.noconflict = noconflict;
  see.init = init;
  see.scope = scope;
  see.eval = seeeval;
  see.barecs = barecs;
  see.here = 'eval(' + seepkg + '.init())';
  see.js = seejs;
  see.cs = '(function(){return eval(' + seepkg + '.barecs(arguments[0]));})';
  see.version = version;
  window[seepkg] = see;
}

function noteoldvalue(name) {
  return {
    name: name,
    has: window.hasOwnProperty(name),
    value: window[name],
  };
}

function restoreoldvalue(old) {
  if (!old.has) {
    delete window[old.name];
  } else {
    window[old.name] = old.value;
  }
}

function noconflict(newname) {
  if (!newname || typeof(newname) != 'string') {
    newname = 'see' + (1 + Math.random() + '').substr(2);
  }
  if (oldvalue) {
    restoreoldvalue(oldvalue);
  }
  seepkg = newname;
  oldvalue = noteoldvalue(newname);
  exportsee();
  return see;
}

function loadjQueryIfNotPresent(callback) {
  if ($ && $.fn && $.fn.jquery) {
    callback();
    return;
  }
  function loadscript(src, callback) {
    function setonload(script, fn) {
      script.onload = script.onreadystatechange = fn;
    }
    var script = document.createElement("script"),
       head = document.getElementsByTagName("head")[0],
       pending = 1;
    setonload(script, function() {
      if (pending && (!script.readyState ||
          {loaded:1,complete:1}[script.readyState])) {
        pending = 0;
        callback();
        setonload(script, null);
        head.removeChild(script);
      }
    });
    script.src = src;
    head.appendChild(script);
  }
  loadscript(
      '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',
      function() {
    $ = jQuery.noConflict(true);
    callback();
  });
}

// ---------------------------------------------------------------------
// LOG FUNCTION SUPPORT
// ---------------------------------------------------------------------
var logcss = "input._log:focus{outline:none;}label._log > span:first-of-type:hover{text-decoration:underline;}div._log > label._log,div_.log > span > label._log{display:inline-block;vertical-align:top;}label._log > span:first-of-type{margin-left:2em;text-indent:-1em;}label._log > ul{display:none;padding-left:14px;margin:0;}label._log > span:before{content:'';font-size:70%;font-style:normal;display:inline-block;width:0;text-align:center;}label._log > span:first-of-type:before{content:'\\0025B6';}label._log > ul > li{display:block;white-space:pre-line;margin-left:2em;text-indent:-1em}label._log > ul > li > div{margin-left:-1em;text-indent:0;white-space:pre;}label._log > input[type=checkbox]:checked ~ span{margin-left:2em;text-indent:-1em;}label._log > input[type=checkbox]:checked ~ span:first-of-type:before{content:'\\0025BC';}label._log > input[type=checkbox]:checked ~ span:before{content:'';}label._log,label._log > input[type=checkbox]:checked ~ ul{display:block;}label._log > span:first-of-type,label._log > input[type=checkbox]:checked ~ span{display:inline-block;}label._log > input[type=checkbox],label._log > input[type=checkbox]:checked ~ span > span{display:none;}";
var addedcss = false;
var cescapes = {
  '\0': '\\0', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r',
  '\t': '\\t', '\v': '\\v', "'": "\\'", '"': '\\"', '\\': '\\\\'
};
var retrying = null;
var queue = [];
see = function see() {
  if (logconsole && typeof(logconsole.log) == 'function') {
    logconsole.log.apply(window.console, arguments);
  }
  var args = Array.prototype.slice.call(arguments);
  queue.push('<div class="_log">');
  while (args.length) {
    var obj = args.shift();
    if (vtype(obj) == 'String')  {
      // Logging a string just outputs the string without quotes.
      queue.push(htmlescape(obj));
    } else {
      queue.push(repr(obj, logdepth, queue));
    }
    if (args.length) { queue.push(' '); }
  }
  queue.push('</div>');
  flushqueue();
};

function loghtml(html) {
  queue.push('<div class="_log">');
  queue.push(html);
  queue.push('</div>');
  flushqueue();
}


function vtype(obj) {
  var bracketed = Object.prototype.toString.call(obj);
  var vt = bracketed.substring(8, bracketed.length - 1);
  if (vt == 'Object') {
    if ('length' in obj && 'slice' in obj && 'number' == typeof obj.length) {
      return 'Array';
    }
  }
  return vt;
}
function isprimitive(vt) {
  switch (vt) {
    case 'String':
    case 'Number':
    case 'Boolean':
    case 'Undefined':
    case 'Date':
    case 'RegExp':
    case 'Null':
      return true;
  }
  return false;
}
function isdom(obj) {
  return (obj.nodeType && obj.nodeName && typeof(obj.cloneNode) == 'function');
}
function midtruncate(s, maxlen) {
  if (maxlen && s.length > maxlen) {
    return s.substring(0, Math.floor(maxlen / 2)) + '...' +
        s.substring(s.length - Math.floor(maxlen / 2));
  }
  return s;
}
function cstring(s, maxlen) {
  s = midtruncate(s, maxlen);
  function cescape(c) {
    if (cescapes.hasOwnProperty(c)) {
      return cescapes[c];
    }
    var temp = '0' + c.charCodeAt(0).toString(16);
    return '\\x' + temp.substring(temp.length - 2);
  }
  if (s.indexOf('"') == -1 || s.indexOf('\'') != -1) {
    return '"' + htmlescape(s.replace(/[\0-\x1f\x7f-\x9f"\\]/g, cescape)) + '"';
  } else {
    return "'" + htmlescape(s.replace(/[\0-\x1f\x7f-\x9f'\\]/g, cescape)) + "'";
  }
}
function tiny(obj, maxlen) {
  var vt = vtype(obj);
  if (vt == 'String') { return cstring(obj, maxlen); }
  if (vt == 'Undefined' || vt == 'Null') { return vt.toLowerCase(); }
  if (isprimitive(vt)) { return '' + obj; }
  if (vt == 'Array' && obj.length === 0) { return '[]'; }
  if (vt == 'Object' && isshort(obj)) { return '{}'; }
  if (isdom(obj) && obj.nodeType == 1) {
    if (obj.hasAttribute('id')) {
      return obj.tagName.toLowerCase() +
          '#' + htmlescape(obj.getAttribute('id'));
    } else {
      if (obj.hasAttribute('class')) {
        var classname = obj.getAttribute('class').split(' ')[0];
        if (classname) {
          return obj.tagName.toLowerCase() + '.' + htmlescape(classname);
        }
      }
      return obj.tagName.toLowerCase();
    }
  }
  return vt;
}
function isnonspace(dom) {
  return (dom.nodeType != 3 || /[^\s]/.exec(dom.textContent));
}
function trimemptystartline(s) {
  return s.replace(/^\s*\n/, '');
}
function isshort(obj, shallow, maxlen) {
  var vt = vtype(obj);
  if (isprimitive(vt)) { return true; }
  if (!shallow && vt == 'Array') { return !maxlen || obj.length <= maxlen; }
  if (isdom(obj)) {
    if (obj.nodeType == 9 || obj.nodeType == 11) return false;
    if (obj.nodeType == 1) {
      return (obj.firstChild === null ||
         obj.firstChild.nextSibling === null &&
         obj.firstChild.nodeType == 3 &&
         obj.firstChild.textContent.length <= maxlen);
    }
    return true;
  }
  if (vt == 'Function') {
    var sc = obj.toString();
    return (sc.length - sc.indexOf('{') <= maxlen);
  }
  if (vt == 'Error') {
    return !!obj.stack;
  }
  var count = 0;
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      count += 1;
      if (shallow && !isprimitive(vtype(obj[prop]))) { return false; }
      if (maxlen && count > maxlen) { return false; }
    }
  }
  return true;
}
function domsummary(dom, maxlen) {
  var short;
  if ('outerHTML' in dom) {
    short = isshort(dom, true, maxlen);
    var html = dom.cloneNode(short).outerHTML;
    var tail = null;
    if (!short) {
      var m = /^(.*)(<\/[^\s]*>$)/.exec(html);
      if (m) {
        tail = m[2];
        html = m[1];
      }
    }
    return [htmlescape(html), tail && htmlescape(tail)];
  }
  if (dom.nodeType == 1) {
    var parts = ['<' + dom.tagName];
    for (var j = 0; j < dom.attributes.length; ++j) {
      parts.push(domsummary(dom.attributes[j], maxlen)[0]);
    }
    short = isshort(dom, true, maxlen);
    if (short && dom.firstChild) {
      return [htmlescape(parts.join(' ') + '>' +
          dom.firstChild.textContent + '</' + dom.tagName + '>'), null];
    }
    return [htmlescape(parts.join(' ') + (dom.firstChild? '>' : '/>')),
        !dom.firstChild ? null : htmlescape('</' + dom.tagName + '>')];
  }
  if (dom.nodeType == 2) {
    return [htmlescape(dom.name + '="' +
        htmlescape(midtruncate(dom.value, maxlen), '"') + '"'), null];
  }
  if (dom.nodeType == 3) {
    return [htmlescape(trimemptystartline(dom.textContent)), null];
  }
  if (dom.nodeType == 4) {
    return ['<![CDATA[' + htmlescape(midtruncate(dom.textContent, maxlen)) +
        ']]>', null];
  }
  if (dom.nodeType == 8) {
    return ['<!--' + htmlescape(midtruncate(dom.textContent, maxlen)) +
        '-->', null];
  }
  if (dom.nodeType == 10) {
    return ['<!DOCTYPE ' + htmlescape(dom.nodeName) + '>', null];
  }
  return [dom.nodeName, null];
}
function summary(obj, maxlen) {
  var vt = vtype(obj);
  if (isprimitive(vt)) {
    return tiny(obj, maxlen);
  }
  if (isdom(obj)) {
    var ds = domsummary(obj, maxlen);
    return ds[0] + (ds[1] ? '...' + ds[1] : '');
  }
  if (vt == 'Function') {
    var ft = obj.toString();
    if (ft.length - ft.indexOf('{') > maxlen) {
      ft = ft.replace(/\{(?:.|\n)*$/, '').trim();
    }
    return ft;
  }
  if ((vt == 'Error' || vt == 'ErrorEvent') && 'message' in obj) {
    return obj.message;
  }
  var pieces = [];
  if (vt == 'Array' && obj.length < maxlen) {
    var identical = (obj.length > 1);
    var firstobj = identical && obj[0];
    for (var j = 0; j < obj.length; ++j) {
      if (identical && obj[j] !== firstobj) { identical = false; }
      pieces.push(tiny(obj[j], maxlen));
    }
    if (identical) {
      return '[' + tiny(firstobj, maxlen) + '] \xd7 ' + obj.length;
    }
    return '[' + pieces.join(', ') + ']';
  } else if (isshort(obj, false, maxlen)) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        pieces.push(quotekey(key) + ': ' + tiny(obj[key], maxlen));
      }
    }
    return (vt == 'Object' ? '{' : vt + '{') + pieces.join(', ') + '}';
  }
  if (vt == 'Array') { return 'Array(' + obj.length + ')'; }
  return vt;
}
function quotekey(k) {
  if (/^\w+$/.exec(k)) { return k; }
  return cstring(k);
}
function htmlescape(s, q) {
  var pat = /[<>&]/g;
  if (q) { pat = new RegExp('[<>&' + q + ']', 'g'); }
  return s.replace(pat, function(c) {
    return c == '<' ? '&lt;' : c == '>' ? '&gt;' : c == '&' ? '&amp;' :
           c == '"' ? '&quot;' : '&#' + c.charCodeAt(0) + ';';
  });
}
function unindented(s) {
  s = s.replace(/^\s*\n/, '');
  var leading = s.match(/^\s*\S/mg);
  var spaces = leading.length && leading[0].length - 1;
  var j = 1;
  // If the block begins with a {, ignore those spaces.
  if (leading.length > 1 && leading[0].trim() == '{') {
    spaces = leading[1].length - 1;
    j = 2;
  }
  for (; j < leading.length; ++j) {
    spaces = Math.min(leading[j].length - 1, spaces);
    if (spaces <= 0) { return s; }
  }
  var removal = new RegExp('^\\s{' + spaces + '}', 'mg');
  return s.replace(removal, '');
}
function expand(prefix, obj, depth, output) {
  output.push('<label class="_log"><input type="checkbox"><span>');
  if (prefix) { output.push(prefix); }
  if (isdom(obj)) {
    var ds = domsummary(obj, 10);
    output.push(ds[0]);
    output.push('</span><ul>');
    for (var node = obj.firstChild; node; node = node.nextSibling) {
      if (isnonspace(node)) {
        if (node.nodeType == 3) {
          output.push('<li><div>');
          output.push(unindented(node.textContent));
          output.push('</div></li>');
        } else if (isshort(node, true, 20) || depth <= 1) {
          output.push('<li>' + summary(node, 20) + '</li>');
        } else {
          expand('', node, depth - 1, output);
        }
      }
    }
    output.push('</ul>');
    if (ds[1]) {
      output.push('<span>');
      output.push(ds[1]);
      output.push('</span>');
    }
    output.push('</label>');
  } else {
    output.push(summary(obj, 10));
    output.push('</span><ul>');
    var vt = vtype(obj);
    if (vt == 'Function') {
      var ft = obj.toString();
      var m = /\{(?:.|\n)*$/.exec(ft);
      if (m) { ft = m[0]; }
      output.push('<li><div>');
      output.push(htmlescape(unindented(ft)));
      output.push('</div></li>');
    } else if (vt == 'Error') {
      output.push('<li><div>');
      output.push(htmlescape(obj.stack));
      output.push('</div></li>');
    } else if (vt == 'Array') {
      for (var j = 0; j < Math.min(100, obj.length); ++j) {
        try {
          val = obj[j];
        } catch(e) {
          val = e;
        }
        if (isshort(val, true, 20) || depth <= 1 || vtype(val) == 'global') {
          output.push('<li>' + j + ': ' + summary(val, 100) + '</li>');
        } else {
          expand(j + ': ', val, depth - 1, output);
        }
      }
      if (obj.length > 100) {
        output.push('<li>length=' + obj.length + ' ...</li>');
      }
    } else {
      var count = 0;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          count += 1;
          if (count > 100) { continue; }
          var val;
          try {
            val = obj[key];
          } catch(e) {
            val = e;
          }
          if (isshort(val, true, 20) || depth <= 1 || vtype(val) == 'global') {
            output.push('<li>');
            output.push(quotekey(key));
            output.push(': ');
            output.push(summary(val, 100));
            output.push('</li>');
          } else {
            expand(quotekey(key) + ': ', val, depth - 1, output);
          }
        }
      }
      if (count > 100) {
        output.push('<li>' + count + ' properties total...</li>');
      }
    }
    output.push('</ul></label>');
  }
}
function initlogcss() {
  if (!addedcss && !window.document.getElementById('_logcss')) {
    var style = window.document.createElement('style');
    style.id = '_logcss';
    style.innerHTML = (linestyle ? 'div._log{' +
        linestyle + '}' : '') + logcss;
    window.document.head.appendChild(style);
    addedcss = true;
  }
}
function repr(obj, depth, aoutput) {
  depth = depth || 3;
  var output = aoutput || [];
  var vt = vtype(obj);
  if (vt == 'Error' || vt == 'ErrorEvent') {
    output.push('<span style="color:red;">');
    expand('', obj, depth, output);
    output.push('</span>');
  } else if (isprimitive(vt)) {
    output.push(tiny(obj));
  } else if (isshort(obj, true, 100) || depth <= 0) {
    output.push(summary(obj, 100));
  } else {
    expand('', obj, depth, output);
  }
  if (!aoutput) {
    return output.join('');
  }
}
function aselement(s, def) {
  switch (typeof s) {
    case 'string':
      if (s == 'body') { return document.body; }
      if (document.querySelector) { return document.querySelector(s); }
      if ($) { return $(s)[0]; }
      return null;
    case 'undefined':
      return def;
    case 'boolean':
      if (s) { return def; }
      return null;
    default:
      return s;
  }
  return null;
}
function stickscroll() {
  var stick = false, a = aselement(autoscroll, null);
  if (a) {
    stick = a.scrollHeight - a.scrollTop - 10 <= a.clientHeight;
  }
  if (stick) {
    return (function() {
      a.scrollTop = a.scrollHeight - a.clientHeight;
    });
  } else {
    return (function() {});
  }
}
function flushqueue() {
  var elt = aselement(logelement, null);
  if (elt && elt.appendChild && queue.length) {
    initlogcss();
    var temp = window.document.createElement('div');
    temp.innerHTML = queue.join('');
    queue.length = 0;
    var complete = stickscroll();
    while ((child = temp.firstChild)) {
      elt.appendChild(child);
    }
    complete();
  }
  if (!retrying && queue.length) {
    retrying = setTimeout(function() { timer = null; flushqueue(); }, 100);
  } else if (retrying && !queue.length) {
    clearTimeout(retrying);
    retrying = null;
  }
}

// ---------------------------------------------------------------------
// TEST PANEL SUPPORT
// ---------------------------------------------------------------------
var addedpanel = false;
var inittesttimer = null;

function show(flag) {
  if (arguments.length === 0 || flag) {
    $('#_testpanel').show();
  } else {
    $('#_testpanel').hide();
  }
}
function promptcaret(color) {
  return '<div style="position:absolute;left:0;font-size:120%;color:' + color +
      ';">&gt;</div>';
}
function getSelectedText(){
    if(window.getSelection) { return window.getSelection().toString(); }
    else if(document.getSelection) { return document.getSelection(); }
    else if(document.selection) {
        return document.selection.createRange().text; }
}
function tryinitpanel() {
  if (!addedpanel) {
    if (!window.document.getElementById('_testlog') && window.document.body) {
      initlogcss();
      var titlehtml = (paneltitle ?
        '<div class="_log" style="color:gray;">' + paneltitle + '</div>' : '');
      $('body').prepend(
        '<div id="_testpanel" style="overflow:hidden;' +
            'position:fixed;bottom:0;left:0;width:100%;height:' + panelheight +
            'px;background:whitesmoke;font:10pt monospace;">' +
          '<div id="_testdrag" style="' +
              'cursor:row-resize;height:6px;width:100%;' +
              'background:lightgray"></div>' +
          '<div id="_testscroll" style="overflow-y:scroll;overflow-x:hidden;' +
              'width:100%;height:' + (panelheight - 6) + 'px;">' +
            '<div id="_testlog">' + titlehtml + '</div>' +
            '<div style="position:relative;">' +
            promptcaret('blue') +
            '<input id="_testinput" class="_log" style="width:100%;' +
                'padding-left:1em;margin:0;border:0;font:inherit;">' +
           '</div>' +
        '</div>');
      addedpanel = true;
      var history = [];
      if (uselocalstorage) {
        try {
          history = window.JSON.parse(window.localStorage[uselocalstorage]);
        } catch (e) { }
      }
      flushqueue();
      var historyindex = 0;
      var historyedited = {};
      $('#_testinput').on('keydown', function(e) {
        if (e.which == 13) {
          // Handle the Enter key.
          var text = $(this).val();
          $(this).val('');
          // Save (nonempty, nonrepeated) commands to history and localStorage.
          if (text.trim().length &&
              (history.length === 0 || history[history.length - 1] != text)) {
            history.push(text);
            if (uselocalstorage) {
              try {
                window.localStorage[uselocalstorage] =
                    window.JSON.stringify(history);
              } catch (e) { }
            }
          }
          // Reset up/down history browse state.
          historyedited = {};
          historyindex = 0;
          // Copy the entered prompt into the log, with a grayed caret.
          loghtml('<div class="_log" style="margin-left:-1em;">' +
                  promptcaret('lightgray') +
                  htmlescape(text) + '</div>');
          $(this).select();
          // Deal with the ":scope" command
          if (text.trim().length && text.trim()[0] == ':') {
            var scopename = text.trim().substring(1).trim();
            if (!scopename || scopes.hasOwnProperty(scopename)) {
              currentscope = scopename;
              var desc = scopename ? 'scope ' + scopename : 'default scope';
              loghtml('<span style="color:blue">switched to ' + desc + '</span>');
            } else {
              loghtml('<span style="color:red">no scope ' + scopename + '</span>');
            }
            return;
          }
          // Actually execute the command and log the results (or error).
          try {
            var result = seeeval(currentscope, text);
            if ((typeof result) != 'undefined') {
              loghtml(repr(result));
            }
          } catch (e) {
            see(e);
          }
        } else if (e.which == 38 || e.which == 40) {
          // Handle the up and down arrow keys.
          // Stow away edits in progress (without saving to history).
          historyedited[historyindex] = $(this).val();
          // Advance the history index up or down, pegged at the boundaries.
          historyindex += (e.which == 38 ? 1 : -1);
          historyindex = Math.max(0, Math.min(history.length, historyindex));
          // Show the remembered command at that slot.
          var newval = historyedited[historyindex] ||
              history[history.length - historyindex];
          if (typeof newval == 'undefined') { newval = ''; }
          $(this).val(newval);
          this.selectionStart = this.selectionEnd = newval.length;
          e.preventDefault();
        }
      });
      $('#_testdrag').on('mousedown', function(e) {
        var drag = this,
            dragsum = $('#_testpanel').height() + e.pageY,
            barheight = $('#_testdrag').height(),
            dragwhich = e.which,
            dragfunc;
        if (drag.setCapture) { drag.setCapture(true); }
        dragfunc = function dragresize(e) {
          if (e.type != 'blur' && e.which == dragwhich) {
            var winheight = window.innerHeight || $(window).height();
            var newheight = Math.max(barheight, Math.min(winheight,
                dragsum - e.pageY));
            var complete = stickscroll();
            $('#_testpanel').height(newheight);
            $('#_testscroll').height(newheight - barheight);
            complete();
          }
          if (e.type == 'mouseup' || e.type == 'blur' ||
              e.type == 'mousemove' && e.which != dragwhich) {
            $(window).off('mousemove mouseup blur', dragfunc);
            if (document.releaseCapture) { document.releaseCapture(); }
          }
        };
        $(window).on('mousemove mouseup blur', dragfunc);
        return false;
      });
      $('#_testpanel').on('mouseup', function(e) {
        if (getSelectedText()) { return; }
        // Focus without scrolling.
        var scrollpos = $('#_testscroll').scrollTop();
        $('#_testinput').focus();
        $('#_testscroll').scrollTop(scrollpos);
      });
    }
  }
  if (inittesttimer && addedpanel) {
    clearTimeout(inittesttimer);
  } else if (!addedpanel && !inittesttimer) {
    inittesttimer = setTimeout(tryinitpanel, 100);
  }
}

})(jQuery);
