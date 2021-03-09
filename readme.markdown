jQuery Image Player
===================

This is a rewrite of ImagePlayer plug-in originally written by Kelli Shaver, then Josep Llodrà Grimalt. 

It is a player/slideshow that looks and works similarly to a conventional video player. 
You can play/pause, go to the beginning, go to the end, click different points on the scrubber to jump back and forth, 
and you can enable an option that will pause the playback while hovering over the image. 
Images are scaled automatically to fit in the player. You can also switch to full-screen. Captions are supported.

Works perfectly in chrome/safari/firefox, and pretty well in IE. 
Josep Llodrà Grimalt player:
<a href="http://jllodra.github.com/imageplayer/">Project page</a>

<img src="http://jllodra.github.com/assets/imageplayer.png" width="480" alt="jquery ip snap" />
Updates Made by Nhi Nguyen:
Ability to drag scrubber and speed and speed down the player.

<a href="https://www.youtube.com/watch?v=1RjUUyCHdRo">Demo of Nhi Nguyen's Forked Image Player</a>

Example:
--------

    <ul id="image_player">
      <li><img src="./images/photos/sample1.png"></li>
      <li><img src="./images/photos/sample2.png"></li>
      <li><img src="./images/photos/sample3.png"></li>
    </ul>
    
    <script type="text/javascript" src="js/jquery.imageplayer.js">
      $(function() {
        var options = {
          stageWidth:400,
          stageHeight:300,
          autoStart:false,
          pauseOnHover:true,
          delay:1,
          loop:true
        };
        $('#image_player').imagePlayer(options);
      });
    </script>

License:
--------

Copyright 2020 Nhi Nguyen

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this software except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
