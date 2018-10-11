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
  $.getJSON('http://wts.zold.io/stress.json', function(json) {
    $('#age').text(Math.round(json.alive_hours * 60 * 60) + ' seconds');
    $('#wallets').text(json.wallets.length).colorize({ 7: 'green', 0: 'red' });
    $('#remotes').text(json.remotes).colorize({ 7: 'green', 0: 'red' });
    if (json.arrived) {
      $('#results').show();
      $('#tps').text(Math.round(json.arrived.total / (json.alive_hours * 60 * 60), 3));
      $('#sent').text(json.paid.total);
      $('#arrived').text(json.arrived.total);
      $('#waiting').text(Object.keys(json.waiting).length);
      $('#confirmation_time').text(Math.round(json.arrived.avg / 60, 2));
      push_ok = json.push_ok ? json.push_ok.total : 0;
      push_errors = json.push_errors ? json.push_errors.total : 0;
      $('#push_ok').text(push_ok + push_errors);
      $('#push_percent').text(Math.round(push_errors / (push_ok + push_errors) * 100, 2));
      $('#push_time').text(Math.round(json.push_ok.avg)).colorize({ 16: 'red', 0: 'green' });;
      pull_ok = json.pull_ok ? json.pull_ok.total : 0;
      pull_errors = json.pull_errors ? json.pull_errors.total : 0;
      $('#pull_ok').text(pull_ok + pull_errors);
      $('#pull_percent').text(Math.round(pull_errors / (pull_ok + pull_errors) * 100, 2)).colorize({ 0: 'red' });;
      $('#pull_time').text(Math.round(json.pull_ok.avg)).colorize({ 16: 'red', 0: 'green' });
      $('#cycle_time').text(Math.round(json.cycles_ok.avg)).colorize({ 16: 'red', 0: 'green' });
    } else {
      $('#results').hide();
    }
    window.setTimeout(stress_refresh, delay);
  }).fail(function() { console.log('Failed to load the JSON'); });
}

