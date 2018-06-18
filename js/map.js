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

function init() {
  startLoader();
  var map = new google.maps.Map(
    document.getElementById("map"),
    {
      center: new google.maps.LatLng(55.751244, 37.618423),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 2
    }
  );
  refresh('b2.zold.io:4096', map);
}

function startLoader() {
  $('#header').html('Loading...');
  $('#remotes-table').html('<tr rel="loader"><td colspan="4">Loading...</td></tr>');
}

function refresh(host, map) {
  $.getJSON('http://' + host + '/', function(data) {
    $('#remotes-table tr[rel="loader"]').hide();
    $('#header').html(
      'Version: ' + data.version + '<br/>' +
      'Host: ' + data.score.host + ':' + data.score.port + '<br/>' +
      'Score: ' + data.score.value + '<br/>' +
      'Remote nodes: ' + data.remotes + '<br/>' +
      'Wallets: ' + data.wallets
    );
    refresh_list(host, map);
    window.setTimeout(function () { refresh(host, map); }, 10000);
  });
}

function refresh_list(host, map) {
  $.getJSON('http://' + host + '/remotes', function(data) {
    var remotes = data.all;
    console.log(remotes.length + ' remote nodes found at ' + host);
    put_markers(map, remotes);
  });
}

function put_markers(map, remotes) {
  $.each(remotes, function (i, r) {
    var host = r.host, port = r.port;
    var coords = host + ':' + port;
    var items = $('#remotes-table tr[data-coords="' + coords + '"]');

    if (items.length) {
      var item = items.first();

      $.getJSON('http://' + coords + '/', function(json) {
        item.html('<td>' + makeALink(coords) + '</td><td>' + json['score']['value'] + '</td><td>' + json['wallets'] + '</td><td>' + json['version'] + '</td>');

        item.addClass('blink');
        setTimeout(function(item){ item.removeClass('blink'); }, 3000, item);

        if (host.match(/^[0-9\.]+$/)) {
          put_marker_by_ip(map, host + ':' + port, host, port);
        } else {
          put_marker_by_host(map, host + ':' + port, host, port);
        }

      }).done(function() {
        item.removeClass('node-down');
        item.addClass('node-up');
      }).fail(function() {
        item.removeClass('node-up');
        item.addClass('node-down');
      });

    } else {
      $('#remotes-table').append('<tr data-coords="' + coords + '"><td>' + makeALink(coords) + '</td> <td colspan=3>&nbsp;</td> </tr>')
    }
  });
}

function makeALink(coords) {
  return '<a href="http://' + coords + '/">' + coords + '</a>';
}

function put_marker_by_host(map, coords, host, port) {
  $.getJSON('https://api.exana.io/dns/' + host + '/a', function(json) {
    ip = $.grep(json.answer, function (a, i) { return a.type == 'A'; })[0].rdata;
    console.log('Host ' + host + ' resolved to ' + ip);
    put_marker_by_ip(map, coords, ip, port);
  }).fail(function() { console.log('Failed to find IP for ' + host); });
}

function put_marker_by_ip(map, coords, ip, port) {
  $.getJSON('http://www.geoplugin.net/json.gp?ip=' + ip, function(json) {
    var lat = parseFloat(json.geoplugin_latitude), lon = parseFloat(json.geoplugin_longitude);
    console.log(ip + ' located at ' + lat + '/' + lon);
    new google.maps.Marker({
      position: { lat: lat, lng: lon },
      map: map,
      title: coords
    });
    console.log('Marker set for ' + coords + ' at ' + lat + '/' + lon);
  }).fail(function() { console.log('Failed to find geo-location for ' + ip); });
}
