/**
(The MIT License)

Copyright (c) 2018-2025 Zerocracy, Inc.

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

/*global URLSearchParams, random_default, $, window, console  */
/*global master_nodes, zold_amount, zold_date, zold_timeout */

function diff_add(txn, diff, host) {
  'use strict';
  var wallet = $('#wallet').val();
  $('#ledger tbody').append(
    '<tr>' +
    '<td><a href="http://' + host + '/wallet/' + wallet +
    '.html">' + diff + '</a></td>' +
    '<td style="color:' + (txn.amount < 0 ? 'darkred' : 'darkgreen') +
    '">#' + txn.id + '</td>' +
    '<td>' + zold_date(txn.date) + '</td>' +
    '<td class="data" style="color:' +
    (txn.amount < 0 ? 'darkred' : 'darkgreen') + '" ' +
    'title="' + txn.amount + '">' +
    zold_amount(txn.amount) + '</td>' +
    '<td><code><a href="/ledger.html?wallet=' + txn.bnf + '">' +
    txn.bnf + '</a></code></td>' +
    '<td>' + txn.details.replace(/([^\ ]{16})/g, '$1&shy;') + '</td>' +
    '</tr>'
  );
}

function diff_draw(left_json, right_json, diff, left_host) {
  'use strict';
  var i;
  var j;
  var left;
  var right;
  var found;
  for (i = 0; i < left_json.length; i += 1) {
    left = left_json[i];
    found = false;
    for (j = 0; j < right_json.length; j += 1) {
      right = right_json[j];
      if (left.id === right.id && left.amount === right.amount) {
        found = true;
        break;
      }
    }
    if (!found) {
      diff_add(left, diff, left_host);
    }
  }
}

function diff_error(msg) {
  'use strict';
  var $tbody = $('#ledger tbody');
  $tbody.find('tr').remove();
  $('#ledger tbody').append('<tr><td colspan="6">' + msg + '</td></tr>');
}

function diff_render() {
  'use strict';
  var wallet = $('#wallet').val();
  var left = $('#left').val();
  var right = $('#right').val();
  diff_error('Loading the JSON of the wallet ' + wallet +
    ' from ' + left + '...');
  $.ajax({
    url: 'http://' + left + '/wallet/' + wallet + '/txns.json',
    timeout: zold_timeout,
    success: function(left_json) {
      diff_error('Loading the JSON of the wallet ' + wallet +
        ' from ' + right + '...');
      $.ajax({
        url: 'http://' + right + '/wallet/' + wallet + '/txns.json',
        timeout: zold_timeout,
        success: function(right_json) {
          var $tbody = $('#ledger tbody');
          $tbody.find('tr').remove();
          diff_draw(left_json, right_json, 'L', left);
          diff_draw(right_json, left_json, 'R', right);
          if ($tbody.find('tr').length === 0) {
            diff_error('No differences found');
          }
        },
        error: function() {
          diff_error('Failed to find ' + wallet + ' at ' + right);
        }
      });
    },
    error: function() {
      diff_error('Failed to find ' + wallet + ' at ' + left);
    }
  });
}

function diff_init() {
  'use strict';
  var url = new URLSearchParams(window.location.search);
  var root = url.get('wallet');
  if (root === null || !(/^[0-9a-f]{16}$/).test(root)) {
    root = '0000000000000000';
  }
  $('#wallet').val(root);
  var left = url.get('left');
  if (left === null) {
    left = master_nodes[0];
  }
  $('#left').val(left);
  var right = url.get('right');
  if (right === null) {
    right = master_nodes[1];
  }
  $('#right').val(right);
  diff_render();
}

