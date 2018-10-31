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

var delay = 1000;

function stress_init() {
  if (window.location.protocol.startsWith('https')) {
    $(location).attr('href', 'http://www.zold.io/stress.html');
    return;
  }
  stress_refresh();
}

function stress_refresh() {
  var $ping = $('#ping');
  $ping.html('<div class="spinner">&nbsp;</div>');
  var start = new Date();
  $.getJSON('http://wts.zold.io/stress.json', function(json) {
    var msec = new Date() - start;
    $ping.text(msec).colorize({ 1000: 'red', 500: 'orange', 0: 'green' });
    $('#age').text(Math.round(json.alive_hours * 60 * 60) + ' seconds');
    $('#wallets').text(json.wallets.length).colorize({ 7: 'green', 0: 'red' });
    $('#remotes').text(json.remotes).colorize({ 7: 'green', 0: 'red' });
    $('#tps').text(Math.round(json.arrived.total / json.arrived.age, 3));
    $('#sent').text(json.paid.total);
    $('#arrived').text(json.arrived.total);
    $('#waiting').text(Object.keys(json.waiting).length);
    $('#confirmation_time').text(Math.round(json.arrived.avg / 60, 2));
    push_ok = json.push_ok ? json.push_ok.total : 0;
    push_error = json.push_error ? json.push_error.total : 0;
    $('#push_ok').text(push_ok + push_error);
    $('#push_percent').text(Math.round(push_error / (push_ok + push_error) * 100, 2));
    $('#push_time').text(Math.round(json.push_ok.avg)).colorize({ 16: 'red', 0: 'green' });;
    pull_ok = json.pull_ok ? json.pull_ok.total : 0;
    pull_error = json.pull_error ? json.pull_error.total : 0;
    $('#pull_ok').text(pull_ok + pull_error);
    $('#pull_percent').text(Math.round(pull_error / (pull_ok + pull_error) * 100, 2)).colorize({ 0: 'red' });;
    $('#pull_time').text(Math.round(json.pull_ok.avg)).colorize({ 16: 'red', 0: 'green' });
    $('#cycle_time').text(Math.round(json.cycle_ok.avg)).colorize({ 16: 'red', 0: 'green' });
    window.setTimeout(stress_refresh, delay);
  }).fail(function() { console.log('Failed to load the JSON'); });
}

