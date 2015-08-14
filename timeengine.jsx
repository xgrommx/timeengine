(() => {
  'use strict';

  var util = require('util'); //debug
  var log = (obj) => {
    //  console.log(util.inspect(obj, false, null));
  };

  var timestream = {};

  Object.defineProperties(timestream,
    {
      t: {
        get() {
          return Date.now();
        },
        set(f) {
          f();
        }
      }
    });

  timestream.log = (...args) => {
    var f = () => {
      console.info.apply(console, args);
    };
    return f;
  };


  timestream.wrap = (legacyF) => {
    var f = (...args) => {
      var wrappedF = () => {
        legacyF(...args);
      };
      return wrappedF;
    };
    return f;
  };

  timestream.computeInterval = timestream.wrap(setInterval);
  timestream.computeTimeout = timestream.wrap(setTimeout);



  timestream.sync = (syncStreams, equation) => {

    log('syncStreamsOnDefine ', syncStreams);
    syncStreams.map((syncStream) => {
      log('--syncStreamOnDefine ', syncStream);
    });
    return {
      synctimestream: {
        syncStreams,
        equation
      }
    };
  };

  //--------
  timestream.stream = () => { // return new stream
    var stream = {};
    var valOnT;
    var computingF = [];

    stream.onDiscover = (f) => { // this fn is fine on each streams
      var f1 = () => {
        computingF[computingF.length] = f; //push  f
      };
      return f1;
    };

    stream.isUpdated = false;

    //!!!!!!!!!!!!!!!!!
    stream.syncStreams = [];
    stream.referredStreams = [];
    //!!!!!!!!!!!!!!!!!

    Object.defineProperties(stream, //detect t update on each streams
      {
        t: { //foo.t
          get() {
            return valOnT;
          },
          set(valOrEqF) { //foo.t is set
            if (!valOrEqF.synctimestream) {

              var checkErrorF = () => {
                if (stream.syncStreams.length === 0) {
                  return false;
                } else {
                  var flag = false;
                  stream.syncStreams.map((syncStream) => {
                    if (syncStream.isUpdated === false) {
                      flag = true; //no functional library here
                    }
                  });
                  return flag;
                }
              };

              if (checkErrorF() === true) {
                throw new Error("the value depends on another value");
              } else {
                valOnT = valOrEqF;

                //----fill other stream's key true------------
                log('valOnT set!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

                log(valOnT);
                stream.isUpdated = true;
                log(stream);

                //propagate ======================================
                stream.referredStreams.map((referredStream) => {

                  var checkF = () => {
                    if (referredStream.syncStreams.length === 0) {
                      return false;
                    } else {
                      var flag = true;
                      referredStream.syncStreams.map((syncStream) => {
                        if (syncStream.isUpdated === false) {
                          flag = false; //no functional library here
                        }
                      });
                      return flag;
                    }
                  };

                  if ((referredStream.isUpdated === false)
                    && (checkF() === true))
                  // the referredStream's all syncStream.isUpdated === true
                  {

                    log('************ the referredStreams all syncStream.isUpdated === true******************');
                    referredStream.t = referredStream.eqF();

                  }

                });

                //finally do own task-----------------

                computingF
                  .map((f) => {
                    f(valOnT);
                  });

              }

            //======================================
            } else {
              stream.isUpdated = false;
              //obtain own stream.syncStreams on = triggered

              stream.eqF = valOrEqF.synctimestream.equation; //retain the equationF

              stream.syncStreams = valOrEqF.synctimestream.syncStreams;

              stream.syncStreams.map((syncStream) => {

                var flag = false;
                syncStream
                  .referredStreams.map((referredStream) => {
                  if (referredStream === stream) {
                    flag = true;
                  }
                });
                log('^^^^^^^^^^^^^^^^^flag');
                log(flag);
                if (flag === false) {
                  syncStream
                    .referredStreams[syncStream.referredStreams.length] = stream;
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
