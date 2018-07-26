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

function map_init() {
  if (window.location.protocol.startsWith('https')) {
    $(location).attr('href', 'http://www.zold.io/map.html');
    return;
  }
  var map = new google.maps.Map(
    document.getElementById("map"), {
      center: new google.maps.LatLng(55.751244, 37.618423),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 2
    }
  );
  map.addListener('drag', function(){
    var offset = 85;
    if (
      map.getBounds().getSouthWest().lat() < (-1 * offset) ||
      map.getBounds().getNorthEast().lat() > offset
    ) {
      map.setOptions({
        zoom: 2,
        center: new google.maps.LatLng(0,0)
      });
    }
  });
  map_refresh('b1.zold.io', map);
}

function map_refresh(host, map) {
  $.getJSON('http://' + host + '/remotes', function(json) {
    $.each(json.all, function (i, r) {
      if (r.host.match(/^[0-9\.]+$/)) {
        map_by_ip(map, r.host, r.port);
      } else {
        map_by_host(map, r.host, r.port);
      }
    });
  });
}

function map_by_host(map, host, port) {
  $.getJSON('https://api.exana.io/dns/' + host + '/a', function(json) {
    var ip = $.grep(json.answer, function (a, i) { return a.type == 'A'; })[0].rdata;
    map_by_ip(map, ip, port);
  }).fail(function() { console.log('Failed to find IP for ' + host); });
}

function map_by_ip(map, ip, port) {
  $.getJSON('http://www.geoplugin.net/json.gp?ip=' + ip, function(json) {
    var lat = parseFloat(json.geoplugin_latitude),
      lon = parseFloat(json.geoplugin_longitude);
    new google.maps.Marker({
      position: { lat: lat, lng: lon },
      map: map,
      title: ip + ':' + port
    });
  }).fail(function() { console.log('Failed to find geo-location for ' + ip); });
}
