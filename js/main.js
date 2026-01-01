// SPDX-FileCopyrightText: Copyright (c) 2024-2026 Yegor Bugayenko
// SPDX-License-Identifier: MIT

/**
(The MIT License)

Copyright (c) 2018-2026 Zerocracy, Inc.

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

var zold_timeout = 16 * 1000; // 16 seconds

var master_nodes = [
  'b2.zold.io:4096',
  '159.203.63.90:4096',
  '167.99.77.100:4096',
  '159.203.19.189:4096',
  '138.197.140.42:4096'
];

function random_default() {
  'use strict';
  return master_nodes[Math.floor(Math.random() * master_nodes.length)];
}

function zold_amount(am) {
  'use strict';
  return parseFloat(am / Math.pow(2, 32)).toFixed(2);
}

function zold_date(d) {
  'use strict';
  var date = new Date(Date.parse(d));
  return date.getFullYear() + '-' +
    (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) + '-' +
    (date.getDate() < 9 ? '0' : '') + date.getDate() + 'T' +
    (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + 'Z';
}
