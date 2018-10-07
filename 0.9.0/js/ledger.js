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
    var url = window.location.href;
    var wallet = url.split('?')[1].split('=')[1];
    ledger_refresh(wallet);
}

function ledger_refresh(wallet) {
    $.getJSON('http://b2.zold.io:4096/wallet/' + wallet, function(json) {
        $('#results').show();
        $('#wallet').text(json.id);
        var txns = json.body.split("\n");
        var txns_lines = '<table>';
        for (var i = 5; i < txns.length - 1; i++) {
            var tx = txns[i].split(';');
            txns_lines += '<tr><td><b>' + tx[0] + '</b></td><td>' +
                human_date(tx[1]) + '</td><td>' + zold_amount(tx[2]) + '</td><td>' +
                "<a href='ledger.html?wallet=" + tx[4] + "'>" + tx[4] +  '</a></td><td>' +
                tx[5] + '</i>' + '</a></td></tr>';
        }
        $('#transactions').html(txns_lines + '</table>');
    }).fail(function() { console.log('Failed to load the JSON'); });
}

function zold_amount(am) {
    return parseFloat(am / Math.pow(2, 32)).toFixed(7) + ' ZLD';
}

function human_date(d) {
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];
    var day = new Date(Date.parse(d));
    var monthIndex = day.getMonth();
    var year = day.getFullYear();
    var hour = day.getHours();
    var minutes = day.getMinutes();
    return monthNames[monthIndex] + ' ' + year + ' ' + hour + ':' + minutes;
}