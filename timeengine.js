'use strict';

(function () {
  'use strict';

  //  var util = require('util'); //debug
  var log = function log(obj) {
    //  console.log(util.inspect(obj, false, null));
  };

  var timestream = {};

  Object.defineProperties(timestream, {
    t: {
      get: function get() {
        return Date.now();
      },
      set: function set(f) {
        f();
      }
    }
  });

  timestream.log = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var f = function f() {
      console.info.apply(console, args);
    };
    return f;
  };

  timestream.wrap = function (legacyF) {
    var f = function f() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var wrappedF = function wrappedF() {
        legacyF.apply(undefined, args);
      };
      return wrappedF;
    };
    return f;
  };

  timestream.computeInterval = timestream.wrap(setInterval);
  timestream.computeTimeout = timestream.wrap(setTimeout);

  timestream.sync = function (syncStreams, equation) {

    log('syncStreamsOnDefine ', syncStreams);
    syncStreams.map(function (syncStream) {
      log('--syncStreamOnDefine ', syncStream);
    });
    return {
      synctimestream: {
        syncStreams: syncStreams,
        equation: equation
      }
    };
  };

  //--------
  timestream.stream = function () {
    // return new stream
    var stream = {};
    var valOnT;
    var computingF = [];

    stream.onDiscover = function (f) {
      // this fn is fine on each streams
      var f1 = function f1() {
        computingF[computingF.length] = f; //push  f
      };
      return f1;
    };

    stream.isUpdated = false;

    stream.syncStreams = [];
    stream.referredStreams = [];

    Object.defineProperties(stream, //detect t update on each streams
    {
      t: { //foo.t
        get: function get() {
          return valOnT;
        },
        set: function set(valOrEqF) {
          //foo.t is set
          if (!valOrEqF.synctimestream) {
            var ff = function ff() {
              valOnT = valOrEqF;
              log('valOnT set!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
              log(valOnT);
              stream.isUpdated = true;
              log(stream);
              //propagate ======================================
              stream.referredStreams.map(function (referredStream) {

                var checkF = function checkF() {
                  if (referredStream.syncStreams.length === 0) {
                    return false;
                  } else {
                    var flag = true;
                    referredStream.syncStreams.map(function (syncStream) {
                      if (syncStream.isUpdated === false) {
                        flag = false; //no functional library here
                      }
                    });
                    return flag;
                  }
                };

                if (referredStream.isUpdated === false && checkF() === true)
                  // the referredStream's all syncStream.isUpdated === true
                  {
                    log('************ the referredStreams all syncStream.isUpdated === true******************');
                    referredStream.t = referredStream.eqF();
                  }
              });
              //finally do own task-----------------
              computingF.map(function (f) {
                f(valOnT);
              });
            };

            if (stream.isUpdated === false) {
              ff(); //library internal updated, keep going
            } else {
                log('@@@@@@@@@@@    stream.isUpdated === true    @@@@@@@@@@');
                // can be proper new update cycle, can be illegal

                var dependencyErrorCheck = function dependencyErrorCheck() {
                  if (stream.syncStreams.length === 0) {
                    return false;
                  } else {
                    return true;
                  }
                };

                if (dependencyErrorCheck() === true) {
                  throw new Error("the value depends on another value");
                } else {
                  var clearUpdatedFlag = function clearUpdatedFlag() {
                    stream.referredStreams.map(function (referredStream) {
                      referredStream.isUpdated = false;
                      referredStream.syncStreams.map(function (syncStream) {
                        syncStream.isUpdated = false;
                      });
                    });
                  };

                  clearUpdatedFlag();
                  ff(); //manual updated new cycle
                }
              }

            //======================================
          } else {
              stream.isUpdated = false;

              //retain the equationF
              stream.eqF = valOrEqF.synctimestream.equation;
              //obtain own stream.syncStreams on = triggered
              stream.syncStreams = valOrEqF.synctimestream.syncStreams;

              stream.syncStreams.map(function (syncStream) {

                var flag = false;
                syncStream.referredStreams.map(function (referredStream) {
                  if (referredStream === stream) {
                    flag = true;
                  }
                });
                log('^^^^^^^^^^^^^^^^^flag');
                log(flag);
                if (flag === false) {
                  syncStream.referredStreams[syncStream.referredStreams.length] = stream;
                }

                // add self stream as the referredStream to syncStream
              });

              log('@@@@@@@@@@ = triggered @@@@@@@@@@');
              log(stream);
              log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
            }
        }
      }
    });

    return stream;
  };

  //--------

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = timestream;
  } else {
    window.__ = timestream;
  }
})();
