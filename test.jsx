(() => {
  'use strict';

  var __ = require('./timeengine.js');

  __.t = __.log('test.jsx started...');

  //==============================================
  var x = __.stream();
  var y = __.stream();
  y.t = __.sync([x], () => x.t * 2); // y = x * 2

  x.t = 5;
  console.log(y.t); //10
  //==============================================

  var f = () => {
    __.t = __.log(__.t); //console.log(__.t);
  };

  __.t = __.computeTimeout(f, 0);
  __.t = __.computeTimeout(f, 1000);

  //------------------------
  var f0 = () => {
    __.t = __.log('--------------------------------------------');
  };
  __.t = __.computeTimeout(f0, 1500);

  // Atomic Update ------------------------
  var a = __.stream();
  var b = __.stream();
  var c = __.stream();
  var d = __.stream();
  var e = __.stream();

  b.t = __.sync([a], () => a.t * 2); // b.t = 1 * 2 = 2
  c.t = __.sync([a, b], () => a.t + b.t * 3); // c.t = 1 + 2 * 3 = 7
  d.t = __.sync([b], () => b.t * 100); // d.t = 2 * 100 = 200
  e.t = __.sync([a, b, c, d], () => a.t + b.t + c.t + d.t); //210

  __.t = a.onDiscover((val) => {
    __.t = __.log('a', a.t); //or  __.t = __.log('a', val);
  });

  __.t = b.onDiscover((val) => {
    __.t = __.log('b', b.t);
  });

  __.t = c.onDiscover((val) => {
    __.t = __.log('c', c.t);
  });

  __.t = d.onDiscover((val) => {
    __.t = __.log('d', d.t);
  });

  __.t = e.onDiscover((val) => {
    __.t = __.log('e', e.t);
  });

  var f1 = () => {
    a.t = 1;
  };
  __.t = __.computeTimeout(f1, 2000);

  var f2 = () => {
    __.t = __.log('--------------------------------------------');
  };
  __.t = __.computeTimeout(f2, 2500);

  var f3 = () => {
    //b.t = 5; // comment out, dependency Error occures

    //since b.t depends on a, this is an illegal operation,
  };
  __.t = __.computeTimeout(f3, 3000);

  var f4 = () => {
    a.t = 5; // new update(discoverly on the timeline stream)
  };
  __.t = __.computeTimeout(f4, 3500);
  //---------------------------------------------
  var f5 = () => {
    __.t = __.log('--------------------------------------------');
  };
  __.t = __.computeTimeout(f5, 4000);

  //Promise---------------------------------------------

  var m = __.stream();
  var n = __.stream();
  var o = __.stream();
  var p = __.stream();

  __.t = m.onDiscover((val) => {
    __.t = __.log('m', m.t);
  });

  __.t = n.onDiscover((val) => {
    __.t = __.log('n', n.t);
  });

  __.t = o.onDiscover((val) => {
    __.t = __.log('o', o.t);
  });

  __.t = p.onDiscover((val) => {
    __.t = __.log('p', p.t);
  });


  p.t = __.sync([m, n, o], () => 'Promised');

  var f6 = () => {
    m.t = 'some';
  };
  __.t = __.computeTimeout(f6, 5000);

  var f7 = () => {
    n.t = 'time';
  };
  __.t = __.computeTimeout(f7, 5500);

  var f8 = () => {
    o.t = 'other';
  };
  __.t = __.computeTimeout(f8, 6000);

  //---------------------------------------------
  var f9 = () => {
    __.t = __.log('--------------------------------------------');
  };
  __.t = __.computeTimeout(f9, 7000);
  //---------------------------------------------

  var f99 = () => {
    __.t = __.log('Any Event Function can be wrapped.');
  };
  __.t = __.wrap(setTimeout)(f99, 8000);
  //onMousemove or whatever instead of setTimeout

  ///-----------------------------------------------


})();
