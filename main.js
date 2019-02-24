const puzzle = document.getElementById('puzzle');
const windowW = window.innerWidth;
const windowH = window.innerHeight;
const head = document.head;
const ROWS = 2;
const COLS = 3;
const padding = 8;
const pieceH = (puzzle.clientHeight - padding * 2) / ROWS;
const pieceW = (puzzle.clientWidth - padding * 2) / COLS;
const frames = [];
const pieces = [];

let currentFrame = null;
let currentPiece = null;
let currentIndex = 0;

const isTouchDevice = 'ontouchstart' in window;

const mouseDownEvent = isTouchDevice ? 'touchstart' : 'mousedown';
const mouseMoveEvent = isTouchDevice ? 'touchmove' : 'mousemove';
const mouseUpEvent = isTouchDevice ? 'touchend' : 'mouseup';

document.addEventListener(mouseMoveEvent, dragMove);

function setImage() {
  const style = document.createElement('style');
  style.type = 'text/css';

  fetch(`https://picsum.photos/${puzzle.clientWidth}/${puzzle.clientHeight}/?random`)
    .then((res) => {
      style.appendChild(document.createTextNode(`
        #puzzle,
        .piece {
          background-image: url('${res.url}');
         }
      `));

      head.appendChild(style);
      makeGrid();
    })
}

function makeGrid() {
  for (let i = 0; i < ROWS * COLS; i += 1) {
    const frame = document.createElement('div');
    const piece = document.createElement('div');
    frame.classList.add('frame');
    piece.classList.add('piece');

    frame.setAttribute('data-num', i + '');
    piece.setAttribute('data-num', i + '');
    piece.style.width = `${pieceW}px`;
    piece.style.height = `${pieceH}px`;

    frame.appendChild(piece);
    puzzle.appendChild(frame);

    frames.push(frame);
    pieces.push(piece);

    piece.addEventListener(mouseDownEvent, dragStart);
    piece.addEventListener(mouseUpEvent, dragEnd);

    piece.style.backgroundPosition = `
      ${(-(i % COLS) * pieceW - padding)}px
      ${(-Math.floor(i / COLS) * pieceH - padding)}px
    `;
  }

  setTimeout(function (){
    pieces.forEach((p) => {
      p.style.top = `${Math.floor(Math.random() * ((windowH - pieceH) - (windowH / 2 + 16) + 1)) + (windowH / 2 + 16)}px`;

      p.style.left = `${Math.floor(Math.random() * ((windowW - pieceW) + 1))}px`;
    })
  }, 1500)
}

function dragStart(e) {
  currentPiece = e.currentTarget;
  currentPiece.classList.add('dragged');

  currentIndex += 1;
  currentPiece.style.zIndex = currentIndex;

  if (currentPiece.classList.contains('dropped')) {
    currentPiece.classList.remove('dropped');
    currentFrame.classList.remove('busy');
  }
}

function dragMove(e) {
  addHover(e.clientY, e.clientX);
  if (!currentPiece) return;

  currentPiece.style.top = `${e.clientY - pieceH / 2}px`;
  currentPiece.style.left = `${e.clientX - pieceW / 2}px`;
}

function dragEnd() {
  currentPiece.classList.remove('dragged');


  if (currentFrame.classList.contains('hover') && !currentFrame.classList.contains('busy')) {
    currentFrame.classList.add('busy');
    currentPiece.classList.add('dropped');
    currentPiece.style.top = `${currentFrame.offsetTop}px`;
    currentPiece.style.left = `${currentFrame.offsetLeft}px`;

    if (currentFrame.dataset.num === currentPiece.dataset.num) {
      currentPiece.classList.add('correct')
    }
  }

  if (pieces.every((p) => p.classList.contains('correct'))) {
    setTimeout(() => {
      alert('win');
      reset();
      setImage();
    }, 300);
  }
  currentPiece = null;
}

function addHover(clientY, clientX) {
  frames.forEach((f) => {
    if (
      clientY > f.offsetTop &&
      clientY < f.offsetTop + pieceH &&
      clientX > f.offsetLeft &&
      clientX < f.offsetLeft + pieceW
    ) {
      f.classList.add('hover');
      currentFrame = f;
    } else {
      f.classList.remove('hover')
    }
  })
}

function reset () {
  puzzle.innerHTML = '';
}

setImage();
