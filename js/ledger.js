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
  $.getJSON('http://b2.zold.io:4096/wallet/' + wallet + '/txns.json', function(json) {
    $('#wallet').html('<code>' + wallet + '</code>');
    var $tbody = $('#txns');
    for (var i = 0; i < json.length; i++) {
      var txn = json[i];
      $tbody.append(
        '<tr>' +
        '<td>' + txn['id'] + '</td>' +
        '<td>' + zold_date(txn['date']) + '</td>' +
        '<td style="text-align:right;color:' + (txn['amount'] < 0 ? 'darkred' : 'darkgreen') + '">' +
          zold_amount(txn['amount']) + '</td>' +
        '<td><code><a href="?wallet=' + txn['bfn'] + '">' + txn['bfn'] + '</a></code></td>' +
        '<td>' + txn['details'] + '</td>' +
        '</tr>'
      );
    }
  }).fail(function() { $('#wallet').text('Failed to load the wallet ' + wallet); });
}

function zold_amount(am) {
  return parseFloat(am / Math.pow(2, 32)).toFixed(4);
}

function zold_date(d) {
  var monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ];
  var day = new Date(Date.parse(d));
  return day.getMonth() + '/' + day.getDay() + '/' + day.getFullYear() + ' ' + day.getHours() + ':' + day.getMinutes();
}
