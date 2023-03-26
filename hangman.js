console.log("JavaScript file loaded");

const canvas = document.getElementById("hangman");
const ctx = canvas.getContext("2d");
const wordElement = document.getElementById("word");
const letterInput = document.getElementById("letter-input");
const usedLettersElement = document.getElementById("used-letters");
const gameStatusElement = document.getElementById("game-status");

const newWordButton = document.getElementById("new-word");
newWordButton.addEventListener("click", async () => {
  await startGame();
});

let secretWord = "";
let guessedWord = "";
let remainingGuesses = 6;
let usedLetters = [];

async function drawHangman() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Base
  if (remainingGuesses <= 6) {
    await drawLine(100, 350, 150, 400);
    await drawLine(150, 400, 50, 400);
    await drawLine(50, 400, 100, 350);
  }

  // Vertical and horizontal bars
  if (remainingGuesses <= 5) {
    await drawLine(100, 350, 100, 50);
    await drawLine(100, 50, 250, 50);
  }

  // Rope
  if (remainingGuesses <= 4) {
    await drawLine(250, 50, 250, 100);
  }

  // Head
  if (remainingGuesses <= 3) {
    await drawCircle(250, 125, 25);
  }

  // Body
  if (remainingGuesses <= 2) {
    await drawLine(250, 150, 250, 250);
  }

  // Arms
  if (remainingGuesses <= 1) {
    await drawLine(250, 170, 200, 220); // Left arm
    await drawLine(250, 170, 300, 220); // Right arm
  }

  // Legs
  if (remainingGuesses <= 0) {
    await drawLine(250, 250, 200, 320); // Left leg
    await drawLine(250, 250, 300, 320); // Right leg
  }
}

async function drawLine(x1, y1, x2, y2) {
  return new Promise((resolve) => {
    const line = new Path2D();
    line.moveTo(x1, y1);
    line.lineTo(x2, y2);
    ctx.stroke(line);

    setTimeout(() => {
      resolve();
    }, 200);
  });
}

async function drawCircle(x, y, radius) {
  return new Promise((resolve) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.stroke();

    setTimeout(() => {
      resolve();
    }, 200);
  });
}

async function fetchWord() {
  const response = await fetch(
    "https://random-word-api.herokuapp.com/word?number=1"
  );
  const words = await response.json();
  return words[0].toUpperCase();
}

function updateWordDisplay() {
  let display = "";
  for (const letter of secretWord) {
    if (usedLetters.includes(letter)) {
      display += letter;
    } else {
      display += "_";
    }
    display += " ";
  }
  wordElement.innerText = display.trim();
}

function updateRemainingGuesses() {
  const livesContainer = document.getElementById("lives-container");
  let hearts = "";
  for (let i = 0; i < remainingGuesses; i++) {
    hearts += "❤";
  }
  livesContainer.textContent = hearts;
}

function updateUsedLetters() {
  usedLettersElement.innerText = `Used letters: ${usedLetters.join(", ")}`;
}

function checkGameStatus() {
  if (guessedWord === secretWord) {
    gameStatusElement.innerText = "Congratulations! You won!";
    submitLetterButton.disabled = true;
    letterInput.disabled = true;
  } else if (remainingGuesses === 0) {
    gameStatusElement.innerText = `Sorry, you lost. The word was "${secretWord}".`;
    submitLetterButton.disabled = true;
    letterInput.disabled = true;
  } else {
    gameStatusElement.innerText = "";
  }
}

letterInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    if (remainingGuesses <= 0 || guessedWord === secretWord) {
      return;
    }
    const letter = letterInput.value.toUpperCase();
    letterInput.value = "";
    if (!letter || usedLetters.includes(letter)) {
      return;
    }

    usedLetters.push(letter);
    updateUsedLetters();
    if (secretWord.includes(letter)) {
      guessedWord = "";
      for (const secretLetter of secretWord) {
        if (usedLetters.includes(secretLetter)) {
          guessedWord += secretLetter;
        } else {
          guessedWord += "_";
        }
      }
      updateWordDisplay();
    } else {
      remainingGuesses--;
      updateRemainingGuesses();
      drawHangman();
    }

    checkGameStatus();
  }
});

async function startGame() {
  secretWord = await fetchWord();
  guessedWord = "_".repeat(secretWord.length);
  remainingGuesses = 6;
  usedLetters = [];
  updateWordDisplay();
  updateRemainingGuesses();
  updateUsedLetters();
  checkGameStatus();
  drawHangman();
  updateRemainingGuesses();
}

startGame();
