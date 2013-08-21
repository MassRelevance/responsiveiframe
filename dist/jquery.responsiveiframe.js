/*! jQuery ResponsiveIframe - v0.1.1 - 2013-08-21
* https://github.com/npr/responsiveiframe
* Copyright (c) 2013 inadarei; Licensed MIT, GPL */
(function() {
  if (typeof jQuery !== 'undefined') {
    (function( $ ){
      var settings = {
        xdomain: '*',
        scrollToTop: true
      };

      var methods = {
        // initialization for the parent, the one housing this
        init: function() {
          return this.each(function(self){
            var $this = $(this);

            if (window.postMessage) {
              if (window.addEventListener) {
                window.addEventListener('message', function(e) {
                  privateMethods.messageHandler($this,e);
                } , false);
              } else if (window.attachEvent) {
                window.attachEvent('onmessage', function(e) {
                  privateMethods.messageHandler($this,e);
                }, $this);
              }
            }
          });
        }
      };

      var privateMethods = {
        messageHandler: function (elem, e) {
          var height,
            r,
            matches,
            strD;

          if (settings.xdomain !== '*') {
            var regex = new RegExp(settings.xdomain + '$');
            if(e.origin == "null"){
              throw new Error("messageHandler( elem, e): There is no origin.  You are viewing the page from your file system.  Please run through a web server.");
            }
            if(e.origin.match(regex)){
              matches = true;
            }else{
              throw new Error("messageHandler( elem, e): The origin doesn't match the responsiveiframe  xdomain.");
            }
          }

          if(settings.xdomain === '*' || matches ) {
            strD = e.data + "";
            r = strD.match(/^(\d+)(s?)$/);
            if(r && r.length === 3){
              height = parseInt(r[1], 10);
              if (!isNaN(height)) {
                try {
                  privateMethods.setHeight(elem, height);
                } catch (ex) {}
              }
              if (settings.scrollToTop && r[2] === "s"){
                scroll(0,0);
              }
            }
          }
        },

        // Sets the height of the iframe
        setHeight : function (elem, height) {
          elem.css('height', height + 'px');
        }
      };

      $.fn.responsiveIframe = function( method ) {
        if ( methods[method] ) {
          return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
          $.extend(settings, arguments[0]);
          return methods.init.apply( this );
        } else {
          $.error( 'Method ' +  method + ' does not exist on jQuery.responsiveIframe' );
        }
      };
    }( jQuery ));
  }

  function ResponsiveIframe(opts){
    var defaults = {
          resizeOnly: true,
          scrollToTop: false,
          pollInterval: 150
        },
        previousHeight;

    opts = opts || {};
    for (var k in defaults) {
      if (defaults.hasOwnProperty(k) && !opts.hasOwnProperty(k)) {
        opts[k] = defaults[k];
      }
    }

    function getDocHeight() {
      var body = document.body,
         html = document.documentElement;

      return Math.max( body.scrollHeight, body.offsetHeight,
                         html.clientHeight, html.scrollHeight, html.offsetHeight );
    }

    function messageParent(newHeight) {
      newHeight += (opts.scrollToTop) ? 's' : '';
      if(top.postMessage){
        top.postMessage( newHeight , '*');
      }
    }

    function firstLoad() {
      var currentHeight = getDocHeight();
      if (!opts.resizeOnly) {
        messageParent(currentHeight);
      }

      // No "content has resized" event in the iframe, so we need to poll...
      setInterval(checkHeight, opts.pollInterval);
    }

    function checkHeight() {
      var currentHeight = getDocHeight();
      if (currentHeight !== previousHeight) {
        previousHeight = currentHeight;
        messageParent(currentHeight);
      }
    }

    firstLoad();
  }

  // expose
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(function() {
      return ResponsiveIframe;
    });
  } else {
    // Drop onto window
    window.ResponsiveIframe = ResponsiveIframe;
  }

  return ResponsiveIframe;
})();
