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

/*global URLSearchParams, random_default, $, window, Set, master_nodes */

$.fn.reset = function(v) {
  'use strict';
  var $this = this;
  var before = parseFloat($this.text());
  $this.text(v);
  if (before !== parseFloat(v)) {
    $this.css('background-color', before > v ? '#EECBCA' : '#E3EFCA');
    setTimeout(function () { $this.css('background-color', 'inherit'); }, 800);
  }
  return this;
};

var delay = 5000;

var seen_nodes = new Set([]);

function health_amount(zents) {
  'use strict';
  return Math.round(parseInt(zents) / Math.pow(2, 32), 2) + 'Z';
}

function health_flag(host) {
  'use strict';
  var $td = $('#health td[data-ip="' + host + '"]');
  var ip = $td.data('ip');
  if (ip.match(/^[0-9\.]+$/)) {
    $.getJSON('https://ssl.geoplugin.net/json.gp?k=af0ad95fd7caa623&ip=' + ip, function(json) {
      var country = json.geoplugin_countryCode;
      $td.html('<img src="https://flagpedia.net/data/flags/normal/' +
        country.toLowerCase() + '.png" alt="' + country + '" style="width:1em;"/>');
    }).fail(function() { $td.text('?'); });
  }
}

function health_update_nscore() {
  'use strict';
  var nscore = 0;
  var nodes = 0;
  $('#health td.nscore').each(function () {
    var td = $(this).text();
    if (td.match(/^[0-9]+$/)) {
      var n = parseInt(td);
      if (n > nscore) {
        nscore += n;
        nodes += 1;
      }
    }
  });
  nscore = Math.round(nscore / nodes);
  var score = 0;
  $('#health td.score').each(function () {
    var td = $(this).text();
    if (td.match(/^[0-9]+$/)) {
      score += parseInt(td);
    }
  });
  $('#nscore').html('<span title="average">' + nscore + '</span>/<span title="actual">' + score + '</span>');
}

function health_update_cost() {
  'use strict';
  var cpus = 0;
  $('#health td.cpus').each(function () {
    var td = $(this).text();
    if (td.match(/^[0-9]+$/)) {
      cpus += parseInt(td);
    }
  });
  $('#total_cpus').text(cpus);
  var nodes = $('#health td.cpus').length;
  var visible = $('#health td.cpus').length;
  var dollars = (0.16 * nodes * cpus / visible);
  $('#total_dollars').text(dollars.toFixed(2));
}

function avg(type) {
  'use strict';
  var total = 0, count = 0;
  $('#health td.' + type).each(function () {
    var td = $(this).text();
    if (td.match(/^[0-9\.]+$/)) {
      total += parseInt(td);
      count += 1;
    }
  });
  var a = 0;
  if (count > 0) {
    a = total / count;
  }
  return a;
}

function health_update_lag() {
  'use strict';
  var remotes = avg('remotes');
  $('#avg_remotes').text(Math.round(remotes));
  var speed = avg('speed');
  $('#avg_speed').reset(Math.round(speed)).colorize({ '32': 'red', '16': 'orange', '0': 'green'});
  var queue = avg('queue');
  $('#avg_queue').reset(queue.toFixed(1)).colorize({ '32': 'red', '8': 'orange', '0': 'green'});
  var hops = 1 + Math.log(Math.log(seen_nodes.size)) / Math.log(remotes);
  $('#hops').reset(hops.toFixed(2));
  var lag = hops * speed * (1 + queue);
  $('#lag').reset(Math.round(lag)).colorize({ '32': 'red', '16': 'orange', '0': 'green'});
}

function health_earnings(host, wallet) {
  'use strict';
  var $td = $('#health tr[data-addr="' + host + '"] td.earnings');
  var root = 'b2.zold.io:4096';
  $.ajax({
    url: 'http://' + root + '/wallet/' + wallet + '/balance',
    timeout: 4000,
    success: function(data) {
      $td.html('<a href="/ledger.html?wallet=' + wallet + '">' + health_amount(data) + '</a>');
      $td.attr('title', data + ' zents in the wallet ' + wallet + ' (found in ' + root + ')');
    },
    error: function() {
      $td.text('?');
      $td.attr('title', 'Can\'t fetch the wallet ' + wallet + ' from ' + root);
    }
  });
}

function health_discover(root) {
  'use strict';
  $.ajax({
    url: 'http://' + root + '/remotes',
    timeout: 4000,
    success: function(data) {
      if (data.all.length === 0) {
        $('#head').text('The list of remotes is empty!');
        return;
      }
      $('#head').hide();
      $.each(data.all.sort(function (r) { return r.host; }), function (ignore, r) {
        var addr = r.host + ':' + r.port;
        if (!seen_nodes.has(addr)) {
          seen_nodes.add(addr);
          $('#health tbody').append(
            '<tr data-addr="' + addr + '" data-errors="0">' +
              '<td class="host" style="' + (master_nodes.includes(addr) ? 'font-weight:bold;' : '') + '"' +
                ' title="Found at ' + root + '"' +
                '><a href="http://' + addr + '/" class="alias">' + r.host + '</a></td>' +
              '<td class="port">' + r.port + '</td>' +
              '<td class="ping data"></td>' +
              '<td class="flag" data-ip="' + r.host + '"></td>' +
              '<td class="platform"></td>' +
              '<td class="cpus data"></td>' +
              '<td class="memory data"></td>' +
              '<td class="load data"></td>' +
              '<td class="threads data"></td>' +
              '<td class="processes data"></td>' +
              '<td class="score data"></td>' +
              '<td class="wallets data"></td>' +
              '<td class="version"></td>' +
              '<td class="nscore data"></td>' +
              '<td class="remotes data"></td>' +
              '<td class="history data"></td>' +
              '<td class="queue data"></td>' +
              '<td class="speed data"></td>' +
              '<td class="age data"></td>' +
              '<td class="earnings data"></td>' +
              '<td class="wallet data"></td>' +
              '</tr>'
          );
          setTimeout('health_node("' + addr + '");', 0); // to foll jslint
          health_flag(r.host);
        }
      });
    },
    error: function() {
      $('#head').text('Failed to load the list of remotes from ' + root);
      health_discover(random_default());
    }
  });
}

function mb(bytes) {
  'use strict';
  var mega = bytes / (1024 * 1024);
  return mega.toFixed(0);
}

function health_node(addr) {
  'use strict';
  var $tr = $('#health tr[data-addr="' + addr + '"]');
  var errors = parseInt($tr.attr('data-errors'));
  if (errors > 3) {
    $tr.remove();
    seen_nodes.delete(addr);
    return;
  }
  var start = new Date();
  $tr.find('td.ping').html('<div class="spinner">&nbsp;</div> ');
  $.ajax({
    url: 'http://' + addr + '/',
    timeout: 16000,
    success: function(json) {
      var msec = new Date() - start;
      $tr.find('td.ping').css('color', 'inherit').removeClass('failure');
      var $ping = $tr.find('td.ping');
      $ping.text(msec).colorize({ '1000': 'red', '500': 'orange', '0': 'green' });
      if (json.alias) {
        $tr.find('td.alias').text(json.alias);
      }
      $tr.find('td.platform').text(json.platform);
      $tr.find('td.cpus')
        .html("<a href='http://" + addr + "/farm'>" + json.cpus + "</a>");
      var mem = (json.memory / json.total_mem) * 100;
      $tr.find('td.memory')
        .attr('title', mb(json.memory) + 'Mb out of ' + mb(json.total_mem) + 'Mb')
        .reset(mem.toFixed(0))
        .colorize({ '75': 'red', '50': 'orange', '0': 'green' });
      $tr.find('td.load')
        .reset(json.load.toFixed(2))
        .colorize({ '8': 'red', '4': 'orange', '0': 'green' });
      $tr.find('td.threads')
        .html("<a href='http://" + addr + "/threads'>" + json.threads + "</a>");
      $tr.find('td.processes')
        .html("<a href='http://" + addr + "/ps'>" + json.processes + "</a>");
      $tr.find('td.score')
        .reset(json.score.value)
        .colorize({ '16': 'green', '4': 'orange', '0': 'red' });
      if (json.score.expired || json.score.strength < 8 || Date.parse(json.score.time) > new Date()) {
        $tr.find('td.score').addClass('cross');
        errors += 1;
      } else {
        $tr.find('td.score').removeClass('cross');
      }
      $tr.find('td.wallets')
        .reset(json.wallets)
        .colorize({ '256': 'gray', '257': 'inherit' });
      $tr.find('td.remotes')
        .reset(json.remotes)
        .colorize({ '20': 'orange', '8': 'green', '0': 'red' });
      $tr.find('td.version').html(
        "<a href='https://github.com/" + json.repo + "'><i class='icon icon-github' style='margin-right:.3em;'/></a>" +
        "<span class='" + (json.version === $('#version').text() ? 'green' : 'red') + "'>" +
        json.version + "</span>/<span class='" + (json.protocol.toString() === $('#protocol').text() ? 'green' : 'red') + "'>" +
        json.protocol + "</span>"
      );
      $tr.find('td.nscore')
        .html("<a href='/health.html?start=" + addr + "'>" + json.nscore + "</a>");
      $tr.find('td.age')
        .reset(json.hours_alive.toFixed(1))
        .colorize({ '1': 'green', '0': 'red' });
      $tr.find('td.history')
        .reset(json.entrance.history_size)
        .colorize({ '8': 'green', '0': 'red' });
      $tr.find('td.queue')
        .reset(json.entrance.queue)
        .colorize({ '32': 'red', '8': 'orange', '0': 'green' });
      $tr.find('td.speed')
        .reset(Math.round(json.entrance.speed))
        .colorize({ '32': 'red', '16': 'orange', '0': 'green' });
      health_earnings(addr, json.score.invoice.split('@')[1]);
      health_update_lag();
      health_update_nscore();
      health_update_cost();
      health_discover(addr);
      $('#total_nodes').reset(seen_nodes.size);
      $tr.data('errors', 0);
    },
    error: function(jqXHR) {
      $tr.find('td.ping').text('#' + jqXHR.status + '/' + errors).addClass('failure');
      errors += 1;
    },
    complete: function() {
      $tr.attr('data-errors', errors);
      window.setTimeout(function () { health_node(addr); }, delay);
    }
  });
}

function health_check_wallet() {
  'use strict';
  var wallet = $('#wallet').val();
  $('#ledger_link').html('<a href="/ledger.html?wallet=' + wallet + '">/ledger</a>');
  $('#health tr[data-addr]').each(function () {
    var addr = $(this).data('addr');
    var $td = $(this).find('td.wallet');
    var url = 'http://' + addr + '/wallet/' + wallet + '/balance';
    $td.text('checking...').addClass('gray').removeClass('green');
    $td.attr('title', url);
    $.getJSON(url, function(data) {
      $td.html('<a href="http://' + addr + '/wallet/' + wallet + '.txt">' + health_amount(data) + '</a>');
      $td.removeClass('gray red');
    })
    .fail(function(jqXHR) { $td.text(jqXHR.status).addClass('red'); });
  });
}

function health_init() {
  'use strict';
  if (window.location.protocol.startsWith('https')) {
    $(location).attr('href', 'http://www.zold.io/health.html');
    return;
  }
  var root = new URLSearchParams(window.location.search).get('start');
  if (root === null) {
    root = random_default();
  }
  $('#head').html('Wait a second, we are loading the list of nodes from ' + root + '...');
  $.get('http://b2.zold.io:4096/version', function(data) {
    $('#version').text(data);
  });
  $.get('http://b2.zold.io:4096/protocol', function(data) {
    $('#protocol').text(data);
  });
  health_discover(root);
}
