// global constants
const cluePauseTime = 333; // how long to pause in between clues
const nextClueWaitTime = 1000; // how long to wait before starting playback of the clue sequence

// Global Variables
var pattern = [];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;
var clueHoldTime = 1000;
var guessCounter = 0;
var strikes = 3;

function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generatePattern() {
  var pattern = [];
  for (let i = 0; i <= 6; i++) {
    pattern.push(randomNumber(1, 6));
  }
  return pattern;
}

function startGame() {
  // initialize game variables
  progress = 0;
  strikes = 3;
  gamePlaying = true;
  pattern = generatePattern();
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  // initialize game variables
  gamePlaying = false;
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 300.2,
  6: 500.2,
};
function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}
function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}
function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  let delay = nextClueWaitTime; // set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
  clueHoldTime -= 50;
}

function guess(btn) {
  console.log("user guessed: " + btn);

  if (!gamePlaying) {
    return;
  }

  if (pattern[guessCounter] == btn) {
    // Guess was correct
    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        // Won game
        winGame();
      } else {
        // Pattern was correct
        progress++;
        playClueSequence();
      }
    } else {
      guessCounter++;
    }
  } else {
    // Guess was incorrect
    if (strikes > 0) {
      strikes--;
      if (strikes == 1) {
        alert(
          "You're wrong. Try again! You have " + strikes + " strike remaining."
        );
      }
      alert(
        "You're wrong. Try again! You have " + strikes + " strikes remaining."
      );
      playClueSequence();
    } else {
      loseGame();
    }
  }
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function winGame() {
  stopGame();
  alert("You won! Good game!");
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);
