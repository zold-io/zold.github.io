/**
(The MIT License)

Copyright (c) 2018 Yegor Bugayenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

$.fn.colorize = function(colors) {
  var data = parseFloat(this.text());
  var keys = Object.keys(colors)
    .map(function (k) { return parseInt(k); })
    .sort(function (a,b) { return a - b; })
    .reverse();
  var used = '';
  for (i = 0; i < keys.length; ++i) {
    var max = keys[i];
    if (data >= max) {
      this.addClass(colors[max]);
      used = colors[max];
      break;
    }
  }
  for (i = 0; i < keys.length; ++i) {
    var color = colors[keys[i]];
    if (used != color) {
      this.removeClass(color);
    }
  }
  return this;
}
