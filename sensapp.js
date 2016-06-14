var Gpio = require('onoff').Gpio;
var pause = require('sleep');
var childproc = require('child_process');

// debounce < 600 was too sensitive and > 900 was not sensitive enough for first contact, for this particular hardware
var doormotion = new Gpio(17, 'in', 'both', {debounceTimeout: 700});
var inmotion = false;
var i = 0;

doormotion.watch(function (err,value) {
  if (err) {
    throw err;
  }
  // add check for whether motion already initially detected
  if (value == true && !inmotion) {
    var now = new Date();    
    console.log('Motion by the Door! ' + now);
    inmotion = true;

    var filename = 'photo/image_'+i+'.jpg';
    var args = ['-w', '320', '-h', '240', '-vf', '-hf', '-o', filename, '-t', '1'];
    // option with -t (in ms) important as otherwise default is 5s. vf,hf used to flip image if camera is upside down.
    /* var spawn = childproc.spawn('raspistill', args);
        
    spawn.on('exit', function(code) {
      console.log('A photo was saved as ' + filename + ' with exit code ' + code);
      i++;
    }); */

    var args = ['./tunes/r2o2.mp3'];
    var spawn_r2 = childproc.spawn('omxplayer', args);

    spawn_r2.on('exit', function(code) {
      var r2now = new Date();
      console.log('You woke up R2 with exit code ' + code + ' - ' + r2now);
      
      var spawn_cantina = childproc.spawn('omxplayer', ['./tunes/cantinabar.mp3']);    
      spawn_cantina.on('exit', function(exitcode) {
        var cantina_now = new Date();
        console.log('Finished the cantina song, with exit code ' + exitcode + ' - ' + cantina_now);
      });
    });

    setTimeout(function() {
      inmotion = false;  // After 1 min, assume sensing new motion, might tune differently for front door vs animal sensing
    },60000);
  } else {
    console.log("No Motion yet..."); // Technically, a low event can also indicate movement, leaving the sensing area
  }
});

function cleanup() {
  console.log("Cleaning up...");  
  doormotion.unexport();
}

console.log("Starting up and calibrating... ");
// Pause to calibrate, greater than 10 doesn't seem to improve calibration, 5 sometimes false positive at start; HW spec calls for 2 sec at least
pause.sleep(10);
console.log("Ready...");

process.on('SIGINT', function() {
  cleanup();  
  process.exit(0);
});
