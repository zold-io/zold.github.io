// SPDX-FileCopyrightText: Copyright (c) 2024-2025 Yegor Bugayenko
// SPDX-License-Identifier: MIT

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

/*global google, zold_timeout */
/*global URLSearchParams, random_default, $, window, console */

function map_by_ip(map, ip, port) {
  'use strict';
  $.ajax({
    url: 'http://www.geoplugin.net/json.gp?ip=' + ip,
    timeout: zold_timeout,
    dataType: 'json',
    success: function(json) {
      var lat = parseFloat(json.geoplugin_latitude);
      var lon = parseFloat(json.geoplugin_longitude);
      var marker = new google.maps.Marker({
        position: {
          lat: lat,
          lng: lon
        },
        title: ip + ':' + port
      });
      marker.setMap(map);
    },
    error: function() {
      console.log('Failed to find geo-location for ' + ip);
    }
  });
}

function map_by_host(map, host, port) {
  'use strict';
  $.ajax({
    url: 'https://api.exana.io/dns/' + host + '/a',
    timeout: zold_timeout,
    dataType: 'json',
    success: function(json) {
      var ip = $.grep(
        json.answer,
        function(a, ignore) {
          return a.type === 'A';
        }
      )[0].rdata;
      map_by_ip(map, ip, port);
    },
    error: function() {
      console.log('Failed to find IP for ' + host);
    }
  });
}

function map_refresh(host, map) {
  'use strict';
  $.ajax({
    url: 'http://' + host + '/remotes',
    timeout: zold_timeout,
    dataType: 'json',
    success: function(json) {
      $.each(json.all, function(ignore, r) {
        if (r.host.match(/^[0-9\.]+$/)) {
          map_by_ip(map, r.host, r.port);
        } else {
          map_by_host(map, r.host, r.port);
        }
      });
    }
  });
}

function map_init() {
  'use strict';
  if (window.location.protocol.startsWith('https')) {
    $(location).attr('href', 'http://www.zold.io/map.html');
    return;
  }
  var map = new google.maps.Map(
    document.getElementById('map'), {
      center: new google.maps.LatLng(55.751244, 37.618423),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 2
    }
  );
  map.addListener('drag', function() {
    var offset = 85;
    if (
      map.getBounds().getSouthWest().lat() < (-1 * offset) ||
      map.getBounds().getNorthEast().lat() > offset
    ) {
      map.setOptions({
        zoom: 2,
        center: new google.maps.LatLng(0, 0)
      });
    }
  });
  map_refresh(random_default(), map);
}
