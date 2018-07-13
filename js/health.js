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

var delay = 2000;

function health_init() {
  if (window.location.protocol.startsWith('https')) {
    $(location).attr('href', 'http://www.zold.io/health.html');
    return;
  }
  root = 'b1.zold.io';
  $.getJSON('http://' + root + '/remotes', function(data) {
    $.each(data.all, function (i, r) {
      var addr = r.host + ':' + r.port;
      $('#health tbody').append(
        '<tr data-addr="' + addr + '">' +
          '<td class="host"><a href="http://' + addr + '/">' + r.host + '</a></td>' +
          '<td class="port">' + r.port + '</td>' +
          '<td class="cpus"></td>' +
          '<td class="score"></td>' +
          '<td class="wallets"></td>' +
          '<td class="version"></td>' +
          '<td class="nscore"></td>' +
          '<td class="remotes"></td>' +
          '<td class="history"></td>' +
          '<td class="queue"></td>' +
          '<td class="age"></td>' +
          '<td class="issues"></td>' +
          '</tr>'
      )
      window.setTimeout(function () { health_node(addr); }, delay);
    });
  }).fail(function() { console.log('Failed to load the list of remotes from ' + root); });
}

function health_node(addr) {
  var $tr = $('#health tr[data-addr="' + addr + '"]');
  $tr.find('td.port').addClass('gray');
  $.getJSON('http://' + addr + '/', function(json) {
    $tr.find('td.cpus').text(json.cpus);
    var $score = $tr.find('td.score');
    $score.text(json.score.value);
    $score.removeClass('green orange red');
    if (json.score.value > 15) {
      $score.addClass('green');
    } else if (json.score.value > 3) {
      $score.addClass('orange');
    } else {
      $score.addClass('red');
    }
    $tr.find('td.wallets').text(json.wallets);
    $tr.find('td.remotes').text(json.remotes);
    $tr.find('td.version').text(json.version + '/' + json.protocol);
    $tr.find('td.nscore').text(json.nscore);
    $tr.find('td.age').text(parseFloat(Math.round(json.hours_alive)));
    $tr.find('td.history').text((json.entrance.history.match(/ /g) || []).length);
    $tr.find('td.queue').text(json.entrance.queue);
    $tr.find('td.issues').text(issues(json).join('; '));
    $tr.find('td.port').removeClass('gray');
    window.setTimeout(function () { health_node(addr); }, delay);
  });
}

function issues(json) {
  var issues = [];
  if (json.network != 'zold') {
    issues.push('Network name is wrong!');
  }
  if ((json.entrance.history.match(/ /g) || []).length < 8) {
    issues.push('History is too short!');
  }
  if (json.entrance.queue > 16) {
    issues.push('Queue is too long!');
  }
  return issues;
}
