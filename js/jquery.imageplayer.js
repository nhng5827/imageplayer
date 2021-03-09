if (typeof(jQuery) == 'undefined') alert('jQuery library was not found.');

(function($) {
  $.fn.extend({
    imagePlayer: function(options) {
      if (options && typeof(options) == 'object') {
        options = $.extend({}, $.imagePlayer.settings, options);
      } else {
        options = $.imagePlayer.settings;
      }
      return this.each(function() {
        try {
          new $.imagePlayer(this, options);
        } catch (e) {
          console.error(e);
        }
      });
    }
  });

  $.imagePlayer = function(self, options) {
    var settings = options;
    var playlist = $(self);
    var images = [];
    var imagesEl = [];
    var imagesLoaded = 0;
    var body = null;
    var player, stage, controls, start, prev, play_pause, next, end, speed_up, speed_down, scrubber, scrubber_handle, fullscreen, frame_count, caption, image = null;
    var last_frame_scrubber_pos = 0;
    var full = false;
    var pauseOnHover = settings.pauseOnHover;
    var inc; // delta inc for scrubber
    var i = 0; // current image
    var rotator = null;
    playlist.find('img').each(function() {
      images.push(this.dataset.src);
      imagesEl.push(this);
    });
    if (images.length == 0) {
      throw "No images found!";
    }

    create_player();
    // Check if all images are loaded here. http://api.jquery.com/load-event/
    $.each(imagesEl, function(index, el) {
      $(el).attr('src', el.dataset.src);
      $(el).load(function() {
        imagesLoaded++;
        if (imagesLoaded >= images.length) {
          if (settings.autoStart == true) {
            image_cycle();
          } else {
            set_image(images[0]);
          }
          create_bindings();
        }
      });
    });

    function create_player() {
      // Player elements.
      player = $('<div>').addClass('img_player');
      stage = $('<div>').addClass('stage');
      controls = $('<div>').addClass('controls');
      start = $('<a>').attr('href', '#').addClass('start');
      prev = $('<a>').attr('href', '#').addClass('prev');
      play_pause = $('<a>').attr('href', '#');
      next = $('<a>').attr('href', '#').addClass('next');
      end = $('<a>').attr('href', '#').addClass('end');
      speed_up = $('<a>').attr('href', '#').addClass('speed_up');
      speed_down = $('<a>').attr('href', '#').addClass('speed_down');
      scrubber = $('<input id = "range" value="0" type="range" min="0" max="' + (images.length - 1) + '" role="input-range">').addClass('scrubber');
      fullscreen = $('<a>').attr('href', '#').addClass('fullscreen');
      frame_count = $('<span>').addClass('frame_count');
      caption = $('<div>').addClass('caption');
      // Set dimensions
      player.css({
        width: settings.stageWidth + 'px',
        height: settings.stageHeight + 40 + 'px' // 40 is control bar height
      });
      stage.css({
        width: settings.stageWidth + 'px',
        height: settings.stageHeight + 'px'
      });
      controls.css({
        width: settings.stageWidth + 'px'
      });
      // Set the right control for play/pause.
      (settings.autoStart === true) ? play_pause.addClass('pause'): play_pause.addClass('play');
      // Build the player.
      player.append(stage.append(caption)).append(controls.append(start).append(prev).append(play_pause).append(next).append(end).append(scrubber).append(speed_down).append(speed_up).append(fullscreen).append(frame_count));
      playlist.hide().after(player);
      inc = 1
    }

    function create_bindings() {
      // Bind mouse interactions
      stage.bind('mouseenter', function(e) {
        handle_image_hover(e, this);
      }).bind('mouseleave', function(e) {
        handle_image_out(e, this);
      });
      play_pause.bind('click', function(e) {
        handle_control_click(e, this);
      });
      prev.bind('click', function(e) {
        handle_prev_click(e, this);
      });
      next.bind('click', function(e) {
        handle_next_click(e, this);
      });
      start.bind('click', function(e) {
        handle_start_click(e, this);
      });
      end.bind('click', function(e) {
        handle_end_click(e, this);
      });
      speed_up.bind('click', function(e) {
        handle_speed_up(e, this);
      });
      speed_down.bind('click', function(e) {
        handle_speed_down(e, this);
      });
      fullscreen.bind('click', function(e) {
        handle_fullscreen_click(e, this);
      });
      scrubber.bind('input', function(e) {
        handle_scrubber_drag(e, this);
      });
    }

    function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

      var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

      return {
        width: srcWidth * ratio,
        height: srcHeight * ratio
      };
    }

    function set_image(img) {
      var asp = calculateAspectRatioFit(1024, 1024, $(window).width(), $(window).height())

      var w = (full === true) ? asp.width : settings.stageWidth;
      var h = (full === true) ? asp.height - 100 : settings.stageHeight;
      var image_object = {
        src: img,
        alt: 'Slide ' + i + 1,
        width: w,
        height: h
      };
      if (image === null) {
        image = $('<img>').attr(image_object);
        stage.append(image);
      } else {
        image.attr(image_object);
      }
      set_caption(i + 1);
      frame_count.html(i + 1 + '/' + images.length);
    }

    function set_caption(frame) {
      if (settings.captions === null || !(frame in settings.captions)) return;
      caption.html(settings.captions[frame]);
    }

    function image_cycle() {
      clearTimeout(rotator);
      if (settings.loop === true) {
        if (i > images.length - 1) {
          i = 0;
          handle = document.getElementById('range');
          handle.value = 0;
        }
      }
      if (i < images.length) {
        image_transition(images[i]);
      }
      i++;
    }

    function image_transition(img) {
      set_image(img);
      handle = document.getElementById('range');
      //animate scrubber
      if (i != 0) {
        handle.stepUp(1);
      }
      rotator = setTimeout(image_cycle, settings.delay * 1000);
    }

    function handle_image_hover(e, elem) {
      if (pauseOnHover === true && play_pause.attr('class') === 'pause') { // is playing
        clearTimeout(rotator);
      }
    }

    function handle_image_out(e, elem) {
      if (pauseOnHover === true && play_pause.attr('class') === 'pause') {
        image_cycle();
      }
    }

    function handle_control_click(e, elem) {
      e.preventDefault();
      elem = $(elem, player);
      // try if we can use "hasClass"

      if (elem.attr('class') == 'pause') { // it's playing (then pause)
        elem.attr('class', 'play');
        clearTimeout(rotator);
        handle = document.getElementById('range');
        handle.value = handle.value - 1;
        i--;
      } else { // paused (we have to resume playback)
        image_cycle();
        elem.attr('class', 'pause');
      }
    }

    // TODO: prev/next/start/end have a lot in common


    function handle_prev_click(e, elem) {
      e.preventDefault();
      elem = $(elem, player);
      clearTimeout(rotator);
      i = (i - 1 < 0) ? 0 : i - 1;
      handle = document.getElementById('range');
      handle.value = i;
      if (play_pause.attr('class') === 'pause') {
        image_cycle();
      } else { // was playing
        set_image(images[i]);
      }
    }

    function handle_next_click(e, elem) {
      e.preventDefault();
      elem = $(elem, player);
      clearTimeout(rotator);
      i = (i + 1 > images.length - 1) ? images.length - 1 : i + 1;
      handle = document.getElementById('range');
      handle.value = i;
      if (play_pause.attr('class') === 'pause') {
        image_cycle();
      } else { // was playing
        set_image(images[i]);
      }
    }

    function handle_start_click(e, elem) {
      e.preventDefault();
      elem = $(elem, player);
      clearTimeout(rotator);
      i = 0;
      handle = document.getElementById('range');
      handle.value = 0;
      if (play_pause.attr('class') === 'pause') {
        image_cycle();
      } else { // was playing
        set_image(images[i]);
      }
    }

    function handle_end_click(e, elem) {
      e.preventDefault();
      elem = $(elem, player);
      clearTimeout(rotator);
      i = images.length - 1;
      handle = document.getElementById('range');
      handle.value = handle.max;
      scrubber_handle.css('left', i * inc + 'px');
      if (play_pause.attr('class') === 'pause') {
        image_cycle();
      } else { // was playing
        set_image(images[i]);
      }
    }

    function handle_fullscreen_click(e, elem) {
      e.preventDefault();
      if (!player.hasClass('full')) {
        full = true;
        $('.fullscreen').css('display', 'none');
        if (play_pause.attr('class') !== 'pause') {
          image_cycle();
          play_pause.attr('class', 'pause');
        }
        pauseOnHover = false; // while we are in fullscreen
        // enter fullscreen
        player.attr('style', 'width:' + 'device-width' + '  !important');
        stage.attr('style', 'width:' + 'device-width' + '  !important');
        let winH = $(window).height() + 100
        player.attr('style', 'height:' + winH + 'px  !important');
        stage.attr('style', 'height:' + winH - 40 + 'px  !important');
        $('body').attr('style', 'background:#333  !important');
        player.attr('style', 'border:none  !important');
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          /* Safari */
          document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          /* IE11 */
          document.documentElement.msRequestFullscreen();
        }
        /*player.addClass('full');
                player.css('width', $(window).innerWidth() + 'px');
                player.css('height', ($(window).innerHeight()) + 'px');
                stage.css('width', $(window).innerWidth() + 'px');
                stage.css('height', ($(window).innerHeight() - 40) + 'px');
                image.attr('width', $(window).innerWidth());
                image.attr('height', $(window).innerHeight() - 40);
                $(player).siblings().filter(':visible').addClass('invisibleimageplayer');*/
      } else {
        full = false;
        pauseOnHover = settings.pauseOnHover; // restore
        // exit fullscreen
        player.removeClass('full');
        $('.fullscreen').css('display', 'block');
        //exitHandler();
        // Set dimensions
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          /* Safari */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          /* IE11 */
          document.msExitFullscreen();
        }
        console.log("newdim", settings)
        // Set dimensions
        player.css({
          width: settings.stageWidth + 'px',
          height: settings.stageHeight + 40 + 'px' // 40 is control bar height
        });
        stage.css({
          width: settings.stageWidth + 'px',
          height: settings.stageHeight + 'px'
        });
        controls.css({
          width: settings.stageWidth + 'px'
        });
        player.attr('style', 'width:' + settings.stageWidth + '  !important');
        stage.attr('style', 'width:' + settings.stageWidth + '  !important');
        player.attr('style', 'height:' + settings.stageHeight + '  !important');
        stage.attr('style', 'height:' + settings.stageHeight + '  !important');
      }
    }

    function handle_scrubber_drag(e, elem) {
      var pos, x_coord, delta_p, delta_n;
      e.preventDefault();
      elem = $(elem, player);
      clearTimeout(rotator);
      handle = document.getElementById('range');
      var val = handle.value //write initial value to var
      handle.setAttribute("value", val);
      i = Number(val);
      if (play_pause.attr('class') === 'pause') {
        image_cycle();
      } else { // was playing
        set_image(images[i]);
      }
    }

    function handle_speed_up(e, elem) {
      e.preventDefault();
      settings.delay = settings.delay - 1 / 50
    }

    function handle_speed_down(e, elem) {
      e.preventDefault();
      settings.delay = settings.delay + 1 / 50
    }
    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    document.addEventListener('mozfullscreenchange', exitHandler);
    document.addEventListener('MSFullscreenChange', exitHandler);

    function exitHandler(e, elem) {
      if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        ///fire your event
        console.log("escaped")
        $('.fullscreen').css('display', 'block');
        // Set dimensions
        player.css({
          width: settings.stageWidth + 'px',
          height: settings.stageHeight + 40 + 'px' // 40 is control bar height
        });
        stage.css({
          width: settings.stageWidth + 'px',
          height: settings.stageHeight + 'px'
        });
        controls.css({
          width: settings.stageWidth + 'px'
        });
        //Set colors
        $('body').attr('style', 'background:whitesmoke  !important');
        player.attr('style', 'border:1px solid black  !important');
        if (play_pause.attr('class') === 'pause') {
          image_cycle();
        } else { // was playing
          set_image(images[i]);
        }


      }
    }
  };
  $.imagePlayer.settings = {
    stageWidth: 520,
    stageHeight: 400,
    autoStart: true,
    pauseOnHover: false,
    delay: 1,
    loop: true,
    captions: null,
    num_images: null, //put in options in project file to overwrite max
  };

})(jQuery);
