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

function ledger_init() {
  root = new URLSearchParams(window.location.search).get('wallet');
  if (root == null) {
    root = '0000000000000000';
  }
  ledger_refresh(root);
}

function ledger_refresh(wallet) {
  var $head = $('#wallet');
  var host = random_default();
  var html = '<code>' + wallet + '</code> from ' + '<a href="http://' + host + '/wallet/' + wallet + '.txt">' + host + '</a>';
  $head.html('Loading ' + html + ' <div class="spinner">&nbsp;</div>');
  $.ajax({
    url: 'http://' + host + '/wallet/' + wallet + '/txns.json',
    timeout: 4000,
    success: function(json) {
      $head.html(html);
      var $tbody = $('#txns');
      for (var i = 0; i < json.length; i++) {
        var txn = json[i];
        $tbody.append(
          '<tr>' +
          '<td>' + (txn['amount'] < 0 ? '#' + txn['id'] : '&mdash;') + '</td>' +
          '<td>' + zold_date(txn['date']) + '</td>' +
          '<td style="text-align:right;color:' + (txn['amount'] < 0 ? 'darkred' : 'darkgreen') + '">' +
            zold_amount(txn['amount']) + '</td>' +
          '<td><code><a href="?wallet=' + txn['bnf'] + '">' + txn['bnf'] + '</a></code></td>' +
          '<td>' + txn['details'].replace(/([^ ]{16})/g, '$1&shy;') + '</td>' +
          '</tr>'
        );
      }
    },
    error: function() {
      $head.css('color', 'darkred');
      $head.html('Failed to load ' + html);
      window.setTimeout(function () { ledger_refresh(wallet); }, 1000);
    }
  });
}

function zold_amount(am) {
  return parseFloat(am / Math.pow(2, 32)).toFixed(2);
}

function zold_date(d) {
  var date = new Date(Date.parse(d));
  return (date.getMonth() + 1) + '/' +
    date.getDate() + '/' +
    date.getFullYear() + ' ' +
    (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' +
    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
}
