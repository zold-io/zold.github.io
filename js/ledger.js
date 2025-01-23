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

/*global zold_amount, zold_date, zold_timeout */
/*global URLSearchParams, random_default, $, window, console, master_nodes */

function ledger_draw(host, wallet, digest) {
  'use strict';
  var $tbody = $('#ledger tbody');
  if ($tbody.find('tr[data-digest="' + digest + '"]').length !== 0) {
    return;
  }
  $.ajax({
    url: 'http://' + host + '/wallet/' + wallet + '/txns.json',
    timeout: zold_timeout,
    success: function(json) {
      $tbody.find('tr').remove();
      $tbody.append('<tr data-digest="' + digest +
        '"><td colspan="5">Found ' + json.length +
        ' transactions at <a href="http://' +
        host + '/wallet/' + wallet + '.txt">' +
        host + '/wallet/' + wallet + '.txt</a> / <code>' +
        digest.substring(0, 8) + '</code>:</td></tr>');
      var i = 0;
      var txn;
      for (i = 0; i < json.length; i += 1) {
        txn = json[i];
        $tbody.append(
          '<tr>' +
          '<td style="color:' + (txn.amount < 0 ? 'darkred' : 'darkgreen') +
          '">#' + txn.id + '</td>' +
          '<td>' + zold_date(txn.date) + '</td>' +
          '<td class="data" style="color:' +
          (txn.amount < 0 ? 'darkred' : 'darkgreen') + '">' +
            zold_amount(txn.amount) + '</td>' +
          '<td><code><a href="?wallet=' + txn.bnf + '">' + txn.bnf +
          '</a></code></td>' +
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
  return $('#copies a.host')
    .map(function() {
      return $.trim($(this).text());
    })
    .get()
    .includes(host);
}

function ledger_reorder($tr) {
  'use strict';
  var mine = parseInt($tr.find('.score').text());
  var $prev;
  while ($tr.index() > 0) {
    $prev = $tr.prev();
    if (parseInt($prev.find('.score').text()) >= mine) {
      break;
    }
    $prev.insertAfter($tr);
  }
  var $next;
  while ($tr.index() < $tr.parent().find('tr').length - 1) {
    $next = $tr.next();
    if (parseInt($next.find('.score').text()) <= mine) {
      break;
    }
    $next.insertBefore($tr);
  }
}

function ledger_reset_diffs() {
  'use strict';
  var left = $('#copies tbody tr:first .host').attr('data-addr');
  $('#copies tbody tr:first .diff').html('');
  $('#copies tbody tr:not(:first)').each(function() {
    var $tr = $(this);
    $tr.find('.diff').html(
      '<a href="/diff.html?wallet=' + $('#root').val() +
      '&left=' + encodeURI(left) +
      '&right=' + encodeURI($tr.find('.host').attr('data-addr')) +
      '">&ne;</span>'
    );
  });
}

function ledger_move(json, $span) {
  'use strict';
  var $tbody = $('#copies tbody');
  var $tr = $tbody.find('tr:has(td[data-digest="' + json.digest + '"])');
  if ($tr.length === 0) {
    $tr = $(
      '<tr>' +
      '<td data-digest="' + json.digest + '"><code>' +
      json.digest.substring(0, 8) + '</code></td>' +
      '<td class="diff"/></td>' +
      '<td class="data score">' + json.score.value + '</td>' +
      '<td class="data nodes">0</td>' +
      '<td class="data">' + zold_amount(json.balance) + '</td>' +
      '<td class="data">' + json.txns + '</td>' +
      '<td class="data">' + json.size + '</td>' +
      '<td class="hosts"></td>' +
      '</tr>'
    );
    $tbody.append($tr);
  }
  $tr.find('td.score').text(
    parseInt($tr.find('td.score').text()) + json.score.value
  );
  $tr.find('td.nodes').text(parseInt($tr.find('td.nodes').text()) + 1);
  var $td = $tr.find('td.hosts');
  $td.append($td.text() === '' ? '' : '; ');
  $span.remove();
  $span.removeClass('candidate');
  $td.append($span);
  ledger_reorder($tr);
  ledger_reset_diffs();
  return $tr.index();
}

function ledger_fetch(host, wallet) {
  'use strict';
  if (ledger_seen(host)) {
    return;
  }
  var $span = $(
    '<span class="candidate"><a class="host" href="http://' + host +
    '/wallet/' + wallet +
    '.txt" data-addr="' + host + '" style="' +
    (master_nodes.includes(host) ? 'font-weight:bold' : '') +
    '">' + host + '</a></span>'
  );
  $('#copies td#candidates').append($span).append(' ');
  var start = new Date().getTime();
  $.ajax({
    url: 'http://' + host + '/wallet/' + wallet,
    timeout: zold_timeout,
    complete: function() {
      $span.find('a').after(
        '<span class="ms">/' + (new Date().getTime() - start) + 'ms</span>'
      );
    },
    error: function(request, error, thrown) {
      $span.attr('title', request + '; ' + error + '; ' + thrown);
      $span.removeClass('candidate').addClass('failed-candidate');
    },
    success: function(json) {
      var row = ledger_move(json, $span);
      if ($('#copies tbody td.hosts a').length < 15) {
        $.ajax({
          url: 'http://' + host + '/remotes',
          timeout: zold_timeout,
          success: function(data) {
            $.each(data.all, function(ignore, r) {
              var addr = r.host + ':' + r.port;
              if (!ledger_seen(addr) &&
                ($('#copies a.host').length < 16 ||
                master_nodes.includes(addr))) {
                ledger_fetch(addr, wallet);
              }
            });
          },
          error: function() {
            $span.css('color', 'red');
          }
        });
      }
      if (row === 0) {
        ledger_draw(host, wallet, json.digest);
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
  master_nodes.forEach(function(host) {
    ledger_fetch(host, root);
  });
}

