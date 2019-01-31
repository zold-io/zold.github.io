/**
(The MIT License)

Copyright (c) 2018-2019 Zerocracy, Inc.

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

/*global URLSearchParams, random_default, $, window, console, master_nodes */

function zold_amount(am) {
  'use strict';
  return parseFloat(am / Math.pow(2, 32)).toFixed(2);
}

function zold_date(d) {
  'use strict';
  var date = new Date(Date.parse(d));
  return (date.getMonth() + 1) + '/' +
    date.getDate() + '/' +
    date.getFullYear() + ' ' +
    (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
}

function ledger_draw(host, wallet) {
  'use strict';
  $.ajax({
    url: 'http://' + host + '/wallet/' + wallet + '/txns.json',
    timeout: 4000,
    success: function(json) {
      var $tbody = $('#ledger tbody');
      if ($tbody.find('tr').length > 0) {
        return;
      }
      var i = 0, txn;
      for (i = 0; i < json.length; i += 1) {
        txn = json[i];
        $tbody.append(
          '<tr>' +
          '<td>' + (txn.amount < 0 ? '#' + txn.id : '&mdash;') + '</td>' +
          '<td>' + zold_date(txn.date) + '</td>' +
          '<td class="data" style="color:' + (txn.amount < 0 ? 'darkred' : 'darkgreen') + '">' +
            zold_amount(txn.amount) + '</td>' +
          '<td><code><a href="?wallet=' + txn.bnf + '">' + txn.bnf + '</a></code></td>' +
          '<td>' + txn.details.replace(/([^\ ]{16})/g, '$1&shy;') + '</td>' +
          '</tr>'
        );
      }
    },
    error: function() {
      console.log('Failed to find ' + wallet + ' at ' + host);
    }
  });
}

function ledger_seen(host) {
  'use strict';
  var seen = $('#copies a.host')
    .map(function() { return $.trim($(this).text()); })
    .get()
    .includes(host);
  console.log('Host ' + host + ' seen: ' + seen);
  return seen;
}

function ledger_move(json, $a) {
  'use strict';
  var $tbody = $('#copies tbody');
  var $tr = $tbody.find('tr:has(td[data-digest="' + json.digest + '"])');
  if ($tr.length === 0) {
    $tr = $(
      '<tr>' +
      '<td data-digest="' + json.digest + '"><code>' + json.digest.substring(0, 8) + '</code></td>' +
      '<td class="data score">' + json.score.value + '</td>' +
      '<td class="data nodes">1</td>' +
      '<td class="data">' + zold_amount(json.balance) + '</td>' +
      '<td class="data">' + json.txns + '</td>' +
      '<td class="hosts"></td>' +
      '</tr>'
    );
    $tbody.append($tr);
  }
  $tr.find('td.score').text(parseInt($tr.find('td.score').text()) + json.score.value);
  $tr.find('td.nodes').text(parseInt($tr.find('td.nodes').text()) + 1);
  var $td = $tr.find('td.hosts');
  $td.append($td.text() === '' ? '' : '; ');
  $a.remove();
  $a.css('color', '');
  $td.append($a);
}

function ledger_fetch(host, wallet) {
  'use strict';
  if (ledger_seen(host)) {
    return;
  }
  var $a = $(
    '<a class="host" style="color:gray" href="http://' + host + '/wallet/' + wallet +
    '.txt" data-addr="' + host + '">' + host + '</a>'
  );
  $('#copies td#candidates').append($a).append(' ');
  $.ajax({
    url: 'http://' + host + '/wallet/' + wallet,
    timeout: 4000,
    error: function(request, error, thrown) {
      $a.attr('title', request + '; ' + error + '; ' + thrown);
      $a.css('color', 'red');
    },
    success: function(json) {
      ledger_move(json, $a);
      if ($('#copies tbody td.hosts a').length < 15) {
        $.ajax({
          url: 'http://' + host + '/remotes',
          timeout: 4000,
          success: function(data) {
            $.each(data.all, function (ignore, r) {
              var addr = r.host + ':' + r.port;
              if (!ledger_seen(addr)) {
                ledger_fetch(addr, wallet);
              }
            });
          },
          error: function() {
            $a.css('color', 'red');
          }
        });
      }
      if ($('#ledger tbody tr').length === 0) {
        ledger_draw(host, wallet);
      }
    }
  });
}

function ledger_init() {
  'use strict';
  var root = new URLSearchParams(window.location.search).get('wallet');
  if (root === null || !(/^[0-9a-f]{16}$/).test(root)) {
    root = '0000000000000000';
  }
  $('#root').val(root);
  master_nodes.forEach(function (host) {
    ledger_fetch(host, root);
  });
}

