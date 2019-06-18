<img src="http://www.zold.io/logo.svg" width="92px" height="92px"/>

[![Build Status](https://travis-ci.org/zold-io/zold.github.io.svg?branch=master)](https://travis-ci.org/zold-io/zold.github.io)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/yegor256/takes/blob/master/LICENSE.txt)
[![Hits-of-Code](https://hitsofcode.com/github/zold-io/zold.github.io)](https://hitsofcode.com/github/zold-io/zold.github.io)
[![Availability at SixNines](https://www.sixnines.io/b/4b53)](https://www.sixnines.io/h/4b53)

Here is the [White Paper](https://papers.zold.io/wp.pdf).

Join our [Telegram group](https://t.me/zold_io) to discuss it all live.

The website is here: [www.zold.io](https://www.zold.io)

Zold is a decentralized payment system, aka cryptocurrency, which
maintains data on a number of anonymous "nodes." In order to make it
possible to observe the entire network the collection of JavaScript
pages was created. Everything you see in these pages is rendered
in your browser, without any backend. Most important pages are these:

  * [/health.html](http://www.zold.io/health.html): the list of all nodes of Zold network
    with their detailed statistics, updated live.

  * [/ledger.html](http://www.zold.io/ledger.html): the list of transactions
    in any particular wallet, rendered live from a number of visible Zold nodes.

  * [/map.html](http://www.zold.io/map.html): the geo-positioned list
    of all visible Zold nodes.

  * [/diff.html](http://www.zold.io/diff.html): the comparison of two
    copies of the same wallet from two different nodes, in order to
    spot the differences (mostly used for debugging).

More pages may be added later.

## How to Contribute

First, install
[Node.js+NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and
[Grunt](https://www.ruby-lang.org/en/documentation/installation/).
Then:

```bash
$ npm install
$ grunt
```

The build has to be clean. If it's not, [submit an issue](https://github.com/zold-io/zold.github.io/issues).

Then, make your changes, make sure the build is still clean,
and [submit a pull request](https://www.yegor256.com/2014/04/15/github-guidelines.html).

You can develop and debug locally. First, run `grunt`. Then, open
the file from `/build` directory, for example `health.html`, in your browser.
Then, run `grunt watch` and make changes to the sources. The HTML file in
the `/build` directory will be re-compiled on-fly. Have fun!
