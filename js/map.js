function put_marker_by_ip(map, coords, ip, port) {
  $.getJSON('http://www.geoplugin.net/json.gp?ip=' + ip, function(json) {
    var lat = parseFloat(json['geoplugin_latitude']), lon = parseFloat(json['geoplugin_longitude']);
    console.log(ip + ' located at ' + lat + '/' + lon);
    new google.maps.Marker({
      position: { lat: lat, lng: lon },
      map: map,
      title: coords
    });
    console.log('Marker set for ' + coords + ' at ' + lat + '/' + lon);
  }).fail(function() { console.log('Failed to find geo-location for ' + ip) });
}

function put_marker_by_host(map, coords, host, port) {
  $.getJSON('https://api.exana.io/dns/' + host + '/a', function(json) {
    ip = $.grep(json['answer'], function (a, i) { return a['type'] == 'A'; })[0]['rdata'];
    console.log('Host ' + host + ' resolved to ' + ip);
    put_marker_by_ip(map, coords, ip, port);
  }).fail(function() { console.log('Failed to find IP for ' + host) });
}

function put_markers(map, remotes) {
  $.each(remotes, function (i, r) {
    var host = r['host'], port = r['port'];
    var coords = host + ':' + port;
    var items = $('#remotes li[data-coords="' + coords + '"]');
    if (items.length) {
      var li = items.first();
      $.getJSON('http://' + coords + '/', function(json) {
        li.html(coords + ': ' + json['score']['value'] + '/' + json['wallets'] + ' (' + json['version'] + ')');
        if (host.match(/^[0-9\.]+$/)) {
          put_marker_by_ip(map, host + ':' + port, host, port);
        } else {
          put_marker_by_host(map, host + ':' + port, host, port);
        }
      }).done(function() { li.css('color', 'darkgreen'); }).fail(function() { li.css('color', 'red'); });
    } else {
      $('#remotes').append('<li data-coords="' + coords + '">' + coords + '</li>')
    }
  });
}

function refresh_list(map) {
  $.getJSON('http://b1.zold.io/remotes', function(data) {
    var remotes = data['all'];
    console.log(remotes.length + ' remote nodes found');
    put_markers(map, remotes);
  });
}

function refresh(map) {
  $.getJSON('http://b2.zold.io:4096/', function(data) {
    $('#header').html(
      'Version: ' + data['version'] + '<br/>' +
      'Host: ' + data['score']['host'] + ':' + data['score']['port'] + '<br/>' +
      'Score: ' + data['score']['value'] + '<br/>' +
      'Wallets: ' + data['wallets']
    );
    refresh_list(map);
    window.setTimeout(refresh, 10000);
  });
}

function init() {
  var map = new google.maps.Map(
    document.getElementById("map"),
    {
      center: new google.maps.LatLng(55.751244, 37.618423),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 3
    }
  );
  refresh(map);
};
