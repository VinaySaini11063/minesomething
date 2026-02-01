/**
 * Valentine's Day Proposal Website
 * Home, Love Meter, Puzzle, Proposal
 */

(function () {
  'use strict';

  // ===== State =====
  const state = {};

  // ===== DOM Refs =====
  const sections = document.querySelectorAll('.page-section');
  const navBtns = document.querySelectorAll('.nav-btn');
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorTooltip = document.getElementById('cursor-tooltip');
  const proposalOverlay = document.getElementById('proposal-overlay');
  const yesOverlay = document.getElementById('yes-overlay');
  const noOverlay = document.getElementById('no-overlay');

  // ===== Detect touch device =====
  function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
  if (isTouchDevice()) {
    document.body.classList.add('mobile');
  }

  // ===== Navigation =====
  function showSection(sectionId) {
    sections.forEach((s) => s.classList.remove('active'));
    navBtns.forEach((b) => b.classList.remove('active'));
    const section = document.getElementById('section-' + sectionId);
    const btn = document.querySelector('.nav-btn[data-section="' + sectionId + '"]');
    if (section) section.classList.add('active');
    if (btn) btn.classList.add('active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(section, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }
  }

  navBtns.forEach((btn) => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  // Section Navigation Arrows (Bottom-of-page nav)
  document.querySelectorAll('.nav-arrow').forEach(arrow => {
    arrow.addEventListener('click', function () {
      const target = this.dataset.next || this.dataset.prev;
      if (target) {
        showSection(target);
        // Scroll to top of section for better experience
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Home: Yes/No buttons jump to another area on screen (no redirect)
  const homeSection = document.getElementById('section-home');
  const homeYesBtn = document.getElementById('home-yes-btn');
  const homeNoBtn = document.getElementById('home-no-btn');

  function jumpButton(btn) {
    if (!btn || !homeSection) return;
    var btnRect = btn.getBoundingClientRect();
    var padding = 40;
    var maxX = window.innerWidth - btnRect.width - padding * 2;
    var maxY = window.innerHeight - btnRect.height - padding * 2;
    if (maxX < 20) maxX = 20;
    if (maxY < 20) maxY = 20;
    var newLeft = padding + Math.random() * maxX;
    var newTop = padding + Math.random() * maxY;
    // Force fixed position and current spot (override any CSS)
    btn.style.setProperty('position', 'fixed', 'important');
    btn.style.setProperty('left', btnRect.left + 'px', 'important');
    btn.style.setProperty('top', btnRect.top + 'px', 'important');
    btn.style.setProperty('transform', 'none', 'important');
    btn.style.setProperty('margin', '0', 'important');
    btn.style.setProperty('z-index', '1000', 'important');
    btn.style.setProperty('transition', 'none', 'important');
    btn.offsetHeight; // reflow
    // Now enable transition and set target so it animates
    btn.style.setProperty('transition', 'left 0.35s ease-out, top 0.35s ease-out', 'important');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        btn.style.setProperty('left', newLeft + 'px', 'important');
        btn.style.setProperty('top', newTop + 'px', 'important');
      });
    });
  }

  var lastJumpTime = 0;
  function handleJumpClick(btn, e) {
    e.preventDefault();
    e.stopPropagation();
    if (Date.now() - lastJumpTime < 400) return;
    lastJumpTime = Date.now();
    jumpButton(btn);
  }
  if (homeYesBtn) {
    homeYesBtn.addEventListener('click', function (e) { handleJumpClick(homeYesBtn, e); });
    homeYesBtn.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleJumpClick(homeYesBtn, e);
    }, { passive: false });
  }
  if (homeNoBtn) {
    homeNoBtn.addEventListener('click', function (e) { handleJumpClick(homeNoBtn, e); });
    homeNoBtn.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleJumpClick(homeNoBtn, e);
    }, { passive: false });
  }
  document.getElementById('home-secret-btn')?.addEventListener('click', function () {
    showSection('lovemeter');
  });

  // ===== Love Meter (stepped: 5% to 50, 10% to 100, 100% to 1000, 1000% unlimited) =====
  var lovemeterValueEl = document.getElementById('lovemeter-value');
  var lovemeterSlider = document.getElementById('lovemeter-slider');
  var lovemeterWrap = document.getElementById('lovemeter-slider-wrap');
  // Steps: 5% up to 50, 10% up to 100, 100% up to 1000, then 1000% unlimited
  var loveMeterValues = [];
  var i;
  for (i = 0; i <= 50; i += 5) loveMeterValues.push(i);      // 0, 5, 10, ..., 50
  for (i = 60; i <= 100; i += 10) loveMeterValues.push(i);    // 60, 70, 80, 90, 100
  for (i = 200; i <= 1000; i += 100) loveMeterValues.push(i); // 200, 300, ..., 1000
  // 2000, 3000, ... added when user reaches end (unlimited)

  function getLoveMeterDisplayValue() {
    if (!lovemeterSlider) return 0;
    var idx = parseInt(lovemeterSlider.value, 10);
    return loveMeterValues[idx] !== undefined ? loveMeterValues[idx] : 0;
  }

  function updateLoveMeterDisplay() {
    var v = getLoveMeterDisplayValue();
    if (lovemeterValueEl) lovemeterValueEl.textContent = v;
    if (lovemeterWrap) lovemeterWrap.style.setProperty('--lovemeter-max', String(loveMeterValues.length));
    // Update slider progress for visual fill
    if (lovemeterSlider) {
      var idx = parseInt(lovemeterSlider.value, 10);
      var maxIdx = parseInt(lovemeterSlider.getAttribute('max'), 10);
      var progress = maxIdx > 0 ? (idx / maxIdx) * 100 : 0;
      lovemeterSlider.style.setProperty('--slider-progress', progress + '%');
    }
  }

  function extendSliderIfNeeded() {
    if (!lovemeterSlider) return;
    var idx = parseInt(lovemeterSlider.value, 10);
    if (idx >= loveMeterValues.length - 1) {
      var last = loveMeterValues[loveMeterValues.length - 1];
      loveMeterValues.push(last + 1000); // 2000, 3000, 4000, ...
      lovemeterSlider.setAttribute('max', String(loveMeterValues.length - 1));
      if (lovemeterWrap) lovemeterWrap.style.setProperty('--lovemeter-max', String(loveMeterValues.length));
    }
  }

  if (lovemeterSlider) {
    lovemeterSlider.setAttribute('max', String(loveMeterValues.length - 1));
    lovemeterSlider.addEventListener('input', function () {
      updateLoveMeterDisplay();
      extendSliderIfNeeded();
      showCompliment();
    });
    updateLoveMeterDisplay();
  }

  // ===== Compliment Popup System =====
  var complimentPopup = document.getElementById('lovemeter-compliment');
  var complimentTimeout = null;
  var lastComplimentValue = -1;

  var compliments = [
    { threshold: 0, emoji: '😊', text: 'Just starting!' },
    { threshold: 10, emoji: '💗', text: 'Aww, that\'s sweet!' },
    { threshold: 25, emoji: '💕', text: 'Getting warmer!' },
    { threshold: 50, emoji: '❤️', text: 'Now we\'re talking!' },
    { threshold: 75, emoji: '💖', text: 'My heart is melting!' },
    { threshold: 100, emoji: '💝', text: 'You love me so much!' },
    { threshold: 500, emoji: '🔥', text: 'This is incredible!' },
    { threshold: 1000, emoji: '✨', text: 'Love to infinity!' }
  ];

  function showCompliment() {
    if (!complimentPopup) return;
    var value = getLoveMeterDisplayValue();

    // Find appropriate compliment based on value
    var compliment = compliments[0];
    for (var i = compliments.length - 1; i >= 0; i--) {
      if (value >= compliments[i].threshold) {
        compliment = compliments[i];
        break;
      }
    }

    // Only show if value changed significantly or crossed threshold
    if (Math.abs(value - lastComplimentValue) < 5 && value < 100) return;
    lastComplimentValue = value;

    // Update popup content
    var emojiEl = complimentPopup.querySelector('.compliment-emoji');
    var textEl = complimentPopup.querySelector('.compliment-text');
    if (emojiEl) emojiEl.textContent = compliment.emoji;
    if (textEl) textEl.textContent = compliment.text;

    // Show popup
    complimentPopup.classList.remove('hidden');
    complimentPopup.classList.add('show');

    // Hide after delay
    if (complimentTimeout) clearTimeout(complimentTimeout);
    complimentTimeout = setTimeout(function () {
      complimentPopup.classList.remove('show');
      setTimeout(function () {
        complimentPopup.classList.add('hidden');
      }, 400);
    }, 2500);
  }


  // ===== Cursor & Tooltips =====
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    if (cursorDot && !document.body.classList.contains('mobile')) {
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    }
    if (cursorRing && !document.body.classList.contains('mobile')) {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (cursorTooltip && !document.body.classList.contains('mobile')) {
        cursorTooltip.textContent = el.dataset.tooltip || '';
        cursorTooltip.classList.add('visible');
        cursorTooltip.style.left = mouseX + 'px';
        cursorTooltip.style.top = mouseY + 'px';
        cursorDot?.classList.add('hover');
        cursorRing?.classList.add('hover');
      }
    });
    el.addEventListener('mousemove', (e) => {
      if (cursorTooltip) {
        cursorTooltip.style.left = e.clientX + 'px';
        cursorTooltip.style.top = e.clientY + 'px';
      }
    });
    el.addEventListener('mouseleave', () => {
      cursorTooltip?.classList.remove('visible');
      cursorDot?.classList.remove('hover', 'heart');
      cursorRing?.classList.remove('hover');
    });
  });

  // Special hover for proposal button
  const proposalTrigger = document.getElementById('open-proposal-popup');
  if (proposalTrigger) {
    proposalTrigger.addEventListener('mouseenter', () => cursorDot?.classList.add('heart'));
    proposalTrigger.addEventListener('mouseleave', () => cursorDot?.classList.remove('heart'));
  }

  // ===== Picture Puzzle (3x3 – use your own image) =====
  var PUZZLE_GRID = 3;
  var PUZZLE_SIZE = PUZZLE_GRID * PUZZLE_GRID; // 9
  var puzzleImageUrl = 'images/puzzle.png'; // Your couple photo – jigsaw puzzle image
  const puzzleBoard = document.getElementById('puzzle-board');
  const puzzlePiecesContainer = document.getElementById('puzzle-pieces');
  const puzzleHint = document.getElementById('puzzle-hint');
  let placedPieces = 0;
  let hintShown = false;

  function getSegmentPosition(segment) {
    var col = segment % PUZZLE_GRID;
    var row = Math.floor(segment / PUZZLE_GRID);
    return { row: row, col: col };
  }

  var PIECE_SIZE_PX = 72;

  function setPieceImage(pieceEl, segment, imageUrl) {
    var pos = getSegmentPosition(segment);
    var totalW = PIECE_SIZE_PX * PUZZLE_GRID;
    var totalH = PIECE_SIZE_PX * PUZZLE_GRID;
    pieceEl.innerHTML = '';
    var img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.draggable = false;
    img.style.position = 'absolute';
    img.style.width = totalW + 'px';
    img.style.height = totalH + 'px';
    img.style.left = -pos.col * PIECE_SIZE_PX + 'px';
    img.style.top = -pos.row * PIECE_SIZE_PX + 'px';
    img.style.pointerEvents = 'none';
    pieceEl.appendChild(img);
  }

  function setPieceBackground(el, segment, imageUrl) {
    var pos = getSegmentPosition(segment);
    var x = -pos.col * 100;
    var y = -pos.row * 100;
    el.style.backgroundImage = 'url("' + imageUrl + '")';
    el.style.backgroundSize = PUZZLE_GRID * 100 + '% ' + PUZZLE_GRID * 100 + '%';
    el.style.backgroundPosition = x + '% ' + y + '%';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundOrigin = 'border-box';
  }

  function setSlotImage(slotEl, segment, imageUrl) {
    var pos = getSegmentPosition(segment);
    var totalW = PIECE_SIZE_PX * PUZZLE_GRID;
    var totalH = PIECE_SIZE_PX * PUZZLE_GRID;
    slotEl.innerHTML = '';
    var img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.draggable = false;
    img.style.position = 'absolute';
    img.style.width = totalW + 'px';
    img.style.height = totalH + 'px';
    img.style.left = -pos.col * PIECE_SIZE_PX + 'px';
    img.style.top = -pos.row * PIECE_SIZE_PX + 'px';
    img.style.pointerEvents = 'none';
    img.style.display = 'block';
    slotEl.appendChild(img);
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function initPuzzle() {
    puzzleBoard.innerHTML = '';
    puzzlePiecesContainer.innerHTML = '';
    placedPieces = 0;
    document.getElementById('puzzle-tryagain')?.classList.add('hidden');
    var celebrationEl = document.getElementById('puzzle-celebration');
    if (celebrationEl) {
      celebrationEl.classList.add('hidden');
      celebrationEl.setAttribute('aria-hidden', 'true');
      celebrationEl.innerHTML = '';
    }
    document.getElementById('puzzle-celebration-next')?.classList.add('hidden');
    document.querySelector('.puzzle-wrapper')?.classList.remove('hidden');

    for (var i = 0; i < PUZZLE_SIZE; i++) {
      var slot = document.createElement('div');
      slot.className = 'puzzle-slot';
      slot.dataset.index = String(i);
      slot.dataset.filled = 'false';
      slot.dataset.segment = '';
      var clip = 'url(#jigsaw-' + i + ')';
      slot.style.clipPath = clip;
      slot.style.webkitClipPath = clip;
      puzzleBoard.appendChild(slot);
    }

    var segments = [];
    for (var s = 0; s < PUZZLE_SIZE; s++) segments.push(s);
    segments = shuffleArray(segments);

    var selectedPieceIndex = null;

    for (var i = 0; i < PUZZLE_SIZE; i++) {
      var segment = segments[i];
      var piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.draggable = true;
      piece.dataset.index = String(i);
      piece.dataset.segment = String(segment);
      setPieceImage(piece, segment, puzzleImageUrl);
      piece.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', this.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('dragging');
      });
      piece.addEventListener('dragend', function () { this.classList.remove('dragging'); });
      piece.addEventListener('click', function () {
        if (this.classList.contains('placed')) return;
        puzzlePiecesContainer.querySelectorAll('.puzzle-piece').forEach(function (p) { p.classList.remove('selected'); });
        selectedPieceIndex = selectedPieceIndex === parseInt(this.dataset.index, 10) ? null : parseInt(this.dataset.index, 10);
        if (selectedPieceIndex !== null) this.classList.add('selected');
      });
      puzzlePiecesContainer.appendChild(piece);
    }

    function placePiece(slot, pieceIndex) {
      if (slot.dataset.filled === 'true') return;
      var piece = puzzlePiecesContainer.querySelector('.puzzle-piece[data-index="' + pieceIndex + '"]');
      if (!piece || piece.classList.contains('placed')) return;
      var segment = parseInt(piece.dataset.segment, 10);
      slot.dataset.filled = 'true';
      slot.dataset.segment = String(segment);
      setSlotImage(slot, segment, puzzleImageUrl);
      slot.classList.add('filled');
      piece.classList.add('placed');
      piece.classList.remove('selected');
      selectedPieceIndex = null;
      placedPieces++;
      if (typeof gsap !== 'undefined') gsap.fromTo(slot, { scale: 1.1 }, { scale: 1, duration: 0.3 });
      if (placedPieces >= PUZZLE_SIZE) {
        var solved = true;
        puzzleBoard.querySelectorAll('.puzzle-slot').forEach(function (s) {
          if (s.dataset.segment !== s.dataset.index) solved = false;
        });
        if (solved) {
          setTimeout(function () {
            document.querySelector('.puzzle-wrapper')?.classList.add('hidden');
            document.getElementById('puzzle-tryagain')?.classList.add('hidden');
            var celebrationEl = document.getElementById('puzzle-celebration');
            if (celebrationEl) {
              celebrationEl.classList.remove('hidden');
              celebrationEl.setAttribute('aria-hidden', 'false');
              triggerPuzzleCelebration();
            }
            var nextWrap = document.getElementById('puzzle-celebration-next');
            if (nextWrap) nextWrap.classList.remove('hidden');
          }, 400);
        } else {
          var tryAgainEl = document.getElementById('puzzle-tryagain');
          if (tryAgainEl) {
            tryAgainEl.classList.remove('hidden');
            if (typeof gsap !== 'undefined') gsap.fromTo(tryAgainEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
          }
        }
      }
    }

    function unplacePiece(slot) {
      if (slot.dataset.filled !== 'true') return;
      var segment = slot.dataset.segment;
      slot.dataset.filled = 'false';
      slot.dataset.segment = '';
      slot.classList.remove('filled');
      slot.innerHTML = '';
      var piece = puzzlePiecesContainer.querySelector('.puzzle-piece.placed[data-segment="' + segment + '"]');
      if (piece) {
        piece.classList.remove('placed');
        placedPieces--;
      }
      if (placedPieces < PUZZLE_SIZE) {
        document.querySelector('.puzzle-wrapper')?.classList.remove('hidden');
        document.getElementById('puzzle-tryagain')?.classList.add('hidden');
      }
    }

    var slots = puzzleBoard.querySelectorAll('.puzzle-slot');
    slots.forEach(function (slot) {
      slot.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        slot.classList.add('highlight');
      });
      slot.addEventListener('dragleave', function () { slot.classList.remove('highlight'); });
      slot.addEventListener('drop', function (e) {
        e.preventDefault();
        slot.classList.remove('highlight');
        var idx = parseInt(e.dataTransfer.getData('text/plain'), 10);
        placePiece(slot, idx);
      });
      slot.addEventListener('click', function () {
        if (slot.dataset.filled === 'true') {
          unplacePiece(slot);
        } else if (selectedPieceIndex !== null) {
          placePiece(slot, selectedPieceIndex);
        }
      });
    });

    setTimeout(function () {
      if (!hintShown && placedPieces === 0) {
        puzzleHint.classList.remove('hidden');
        hintShown = true;
      }
    }, 8000);
  }

  document.getElementById('lovemeter-next-btn')?.addEventListener('click', () => showSection('flower-quiz'));

  document.getElementById('flower-quiz-next-btn')?.addEventListener('click', () => showSection('puzzle'));

  document.getElementById('puzzle-celebration-next-btn')?.addEventListener('click', () => showSection('proposal'));

  function triggerPuzzleCelebration() {
    var container = document.getElementById('puzzle-celebration');
    if (!container) return;
    container.innerHTML = '';
    var hearts = ['💐', '💗', '❤️', '💖', '🌷', '💝', '🌸', '🪳', '🌺'];
    var count = 50;
    for (var i = 0; i < count; i++) {
      var h = document.createElement('div');
      h.className = 'puzzle-celebration-heart';
      h.textContent = hearts[i % hearts.length];
      h.style.cssText = 'position: absolute; left: 50%; top: 50%; font-size: ' + (18 + Math.random() * 24) + 'px; pointer-events: none; z-index: 1;';
      container.appendChild(h);
      var angle = (Math.PI * 2 * i) / count + Math.random() * 2;
      var dist = 80 + Math.random() * 280;
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          h,
          { x: 0, y: 0, opacity: 1, scale: 0.3, rotation: 0 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 80,
            opacity: 0.7,
            scale: 1,
            rotation: Math.random() * 360,
            duration: 1.2 + Math.random() * 0.8,
            ease: 'power2.out',
            onComplete: function () { h.remove(); },
          }
        );
      }
    }
  }

  // Show puzzle when section is shown
  const puzzleSection = document.getElementById('section-puzzle');
  if (puzzleSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.classList.contains('active')) initPuzzle();
      });
    });
    observer.observe(puzzleSection, { attributes: true, attributeFilter: ['class'] });
  }
  if (puzzleSection?.classList.contains('active')) initPuzzle();

  // ===== Flower Quiz Logic =====
  const flowerQuizSection = document.getElementById('section-flower-quiz');
  const flowerOptions = document.querySelectorAll('.flower-option');
  const flowerFeedback = document.getElementById('flower-quiz-feedback');
  const flowerNextWrap = document.getElementById('flower-quiz-next-wrap');
  const CORRECT_FLOWER = "Bougainvillea";
  let quizSolved = false;

  function initFlowerQuiz() {
    quizSolved = false;
    flowerNextWrap?.classList.add('hidden');
    flowerFeedback?.classList.add('hidden');
    if (flowerFeedback) flowerFeedback.textContent = '';
    flowerOptions.forEach(opt => {
      opt.classList.remove('correct', 'wrong', 'selected');
    });
  }

  flowerOptions.forEach(option => {
    option.addEventListener('click', function () {
      if (quizSolved) return;

      const answer = this.dataset.answer;

      // Reset others
      flowerOptions.forEach(opt => opt.classList.remove('selected', 'wrong'));
      this.classList.add('selected');

      if (answer === CORRECT_FLOWER) {
        quizSolved = true;
        this.classList.add('correct');
        if (flowerFeedback) {
          flowerFeedback.textContent = "Yay! You remembered! That was so special... 💕";
          flowerFeedback.classList.remove('hidden');
        }
        flowerNextWrap?.classList.remove('hidden');
        // Confetti effect
        if (typeof triggerConfetti === 'function') triggerConfetti();
      } else {
        this.classList.add('wrong');
        if (flowerFeedback) {
          flowerFeedback.textContent = "Hmm, not that one... remember the second time? 🫠";
          flowerFeedback.classList.remove('hidden');
        }
      }
    });
  });

  if (flowerQuizSection) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.target.classList.contains('active')) initFlowerQuiz();
      });
    });
    observer.observe(flowerQuizSection, { attributes: true, attributeFilter: ['class'] });
  }

  // ===== Tic Tac Toe Mini-Game Logic =====
  const tttBoard = document.getElementById('tictactoe-board');
  const tttCells = document.querySelectorAll('.ttt-cell');
  const tttStatus = document.getElementById('ttt-status');
  const tttRestartBtn = document.getElementById('ttt-restart-btn');
  const tttRevealBtn = document.getElementById('ttt-reveal-btn');
  const tttContainer = document.getElementById('tictactoe-container');
  const tttSelection = document.getElementById('ttt-selection');
  const tttGameBoardWrap = document.getElementById('ttt-game-board-wrap');
  const finalQuestionContainer = document.getElementById('final-question-container');
  const emojiChoiceBtns = document.querySelectorAll('.emoji-choice-btn');

  let boardState = Array(9).fill(null);
  let playerEmoji = '🐷';
  let computerEmoji = '🪳';
  let currentPlayer = 'player';
  let gameActive = true;

  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  function initTicTacToe() {
    tttSelection?.classList.remove('hidden');
    tttGameBoardWrap?.classList.add('hidden');
    tttRestartBtn?.classList.add('hidden');
    tttRevealBtn?.classList.add('hidden');
    boardState = Array(9).fill(null);
    gameActive = true;
    tttCells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('filled');
    });
    tttContainer.classList.remove('hidden');
    finalQuestionContainer.classList.add('hidden');
  }

  function startWithEmoji(emoji) {
    playerEmoji = emoji;
    computerEmoji = emoji === '🐷' ? '🪳' : '🐷';
    currentPlayer = 'player';

    tttSelection?.classList.add('hidden');
    tttGameBoardWrap?.classList.remove('hidden');
    tttStatus.textContent = `Your turn, ${playerEmoji}!`;
    tttStatus.style.color = "var(--pink-deep)";
  }

  emojiChoiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      startWithEmoji(emoji);
    });
  });

  function handleCellClick(e) {
    const cell = e.target;
    const index = cell.getAttribute('data-index');

    if (boardState[index] !== null || !gameActive || currentPlayer !== 'player') return;

    makeMove(index, 'player');

    if (gameActive) {
      tttStatus.textContent = `${computerEmoji} is thinking...`;
      setTimeout(computerMove, 600);
    }
  }

  function makeMove(index, mover) {
    const emoji = mover === 'player' ? playerEmoji : computerEmoji;
    boardState[index] = mover;
    tttCells[index].textContent = emoji;
    tttCells[index].classList.add('filled');

    if (checkWin(mover)) {
      if (mover === 'player') {
        endGame(`You won! ${playerEmoji}❤️`, 'win');
      } else {
        endGame(`${computerEmoji} won! 🫣`, 'loss');
      }
    } else if (boardState.every(cell => cell !== null)) {
      endGame("It's a draw! 🤝", 'draw');
    } else {
      currentPlayer = mover === 'player' ? 'computer' : 'player';
      if (currentPlayer === 'player') {
        tttStatus.textContent = `Your turn, ${playerEmoji}!`;
      }
    }
  }

  function computerMove() {
    if (!gameActive) return;

    // Simple AI: Try to win, then block, then random
    const move = findBestMove('computer') || findBestMove('player') || getRandomMove();

    if (move !== null) {
      makeMove(move, 'computer');
    }
  }

  function findBestMove(mover) {
    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      const values = [boardState[a], boardState[b], boardState[c]];
      const count = values.filter(v => v === mover).length;
      const nullCount = values.filter(v => v === null).length;

      if (count === 2 && nullCount === 1) {
        if (boardState[a] === null) return a;
        if (boardState[b] === null) return b;
        if (boardState[c] === null) return c;
      }
    }
    return null;
  }

  function getRandomMove() {
    const availableMoves = boardState.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (availableMoves.length === 0) return null;
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  function checkWin(mover) {
    return winningConditions.some(condition => {
      return condition.every(index => boardState[index] === mover);
    });
  }

  function endGame(message, result) {
    gameActive = false;
    tttStatus.textContent = message;

    if (result === 'win') {
      tttStatus.style.color = "#4CAF50";
      // Show reveal button on win
      setTimeout(() => {
        tttRevealBtn?.classList.remove('hidden');
        gsap.fromTo(tttRevealBtn, { scale: 0 }, { scale: 1, duration: 1.0, ease: 'back.out' });
      }, 1000);
    } else {
      tttStatus.style.color = "#f44336";
      // Show restart button on loss/draw
      setTimeout(() => {
        tttRestartBtn?.classList.remove('hidden');
        gsap.fromTo(tttRestartBtn, { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out' });
      }, 800);
    }
  }

  tttCells.forEach(cell => cell.addEventListener('click', handleCellClick));
  tttRestartBtn?.addEventListener('click', initTicTacToe);

  tttRevealBtn?.addEventListener('click', () => {
    const blackout = document.getElementById('blackout-screen');

    // 1. Start Blackout
    blackout?.classList.remove('hidden');
    setTimeout(() => blackout?.classList.add('active'), 10);

    // 2. Transition during blackout
    setTimeout(() => {
      // Switch categories / states
      tttContainer.classList.add('hidden');
      finalQuestionContainer.classList.remove('hidden');
      proposalOverlay.classList.add('theater-mode');

      // Animate the question in on the black background
      gsap.fromTo(finalQuestionContainer,
        { opacity: 0, scale: 0.85, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 2.5, ease: 'power3.inOut' }
      );

      triggerConfetti();
    }, 1800); // Wait for blackout to be fully opaque
  });

  // Updated Proposal Pop-up flow
  function openProposalPopup() {
    proposalOverlay.classList.remove('hidden');
    proposalOverlay.classList.add('visible');
    spawnPopupHearts();
    spawnSparkles();
    initTicTacToe(); // Start with the game
  }

  function spawnPopupHearts() {
    const container = document.getElementById('popup-hearts');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const h = document.createElement('span');
      h.className = 'popup-heart';
      h.textContent = '💕';
      h.style.left = Math.random() * 100 + '%';
      h.style.top = Math.random() * 100 + '%';
      h.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(h);
    }
  }

  function spawnSparkles() {
    const container = document.getElementById('popup-sparkles');
    if (!container) return;
    container.innerHTML = '';
    const chars = ['✨', '⭐', '💫'];
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'popup-sparkle';
      s.textContent = chars[Math.floor(Math.random() * chars.length)];
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 1.5 + 's';
      container.appendChild(s);
    }
  }

  document.getElementById('open-proposal-popup')?.addEventListener('click', openProposalPopup);

  // Proposal page: "Ready?" bar fills when hovering the Open button
  var proposalReadyFill = document.getElementById('proposal-ready-fill');
  if (proposalTrigger && proposalReadyFill) {
    proposalTrigger.addEventListener('mouseenter', function () {
      proposalReadyFill.style.width = '100%';
    });
    proposalTrigger.addEventListener('mouseleave', function () {
      proposalReadyFill.style.width = '0%';
    });
  }

  // 💌 Send a virtual hug – heart burst animation
  var proposalHugBtn = document.getElementById('proposal-hug-btn');
  var proposalHugHearts = document.getElementById('proposal-hug-hearts');
  if (proposalHugBtn && proposalHugHearts) {
    proposalHugBtn.addEventListener('click', function () {
      proposalHugHearts.classList.remove('hidden');
      proposalHugHearts.innerHTML = '';
      var hugHearts = ['🫂', '❤️', '💝'];
      var count = 35;
      var btnRect = proposalHugBtn.getBoundingClientRect();
      var originX = btnRect.left + btnRect.width / 2 - proposalHugHearts.getBoundingClientRect().left;
      var originY = btnRect.top + btnRect.height / 2 - proposalHugHearts.getBoundingClientRect().top;
      for (var i = 0; i < count; i++) {
        var h = document.createElement('div');
        h.className = 'proposal-hug-heart';
        h.textContent = hugHearts[i % hugHearts.length];
        h.style.cssText = 'position: absolute; left: ' + originX + 'px; top: ' + originY + 'px; font-size: ' + (16 + Math.random() * 20) + 'px; pointer-events: none;';
        proposalHugHearts.appendChild(h);
        var angle = (Math.PI * 2 * i) / count + Math.random() * 2;
        var dist = 60 + Math.random() * 180;
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(h, { x: 0, y: 0, opacity: 1, scale: 0.5 }, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 60,
            opacity: 0.7,
            scale: 1,
            duration: 1 + Math.random() * 0.5,
            ease: 'power2.out',
            onComplete: function () { h.remove(); }
          });
        }
      }
      setTimeout(function () {
        proposalHugHearts.classList.add('hidden');
        proposalHugHearts.innerHTML = '';
      }, 2000);
    });
  }

  // 🌹 Hover on rose – petals fall
  var proposalRose = document.getElementById('proposal-rose');
  var proposalPetals = document.getElementById('proposal-petals');
  var rosePetalsInterval = null;
  if (proposalRose && proposalPetals) {
    function spawnPetal() {
      var p = document.createElement('span');
      p.className = 'proposal-petal';
      p.textContent = ['🌸', '🌺'][Math.floor(Math.random() * 2)];
      var dx = (Math.random() - 0.5) * 80;
      p.style.setProperty('--petal-dx', dx + 'px');
      p.style.left = '50%';
      p.style.top = '0';
      p.style.animationDuration = (2.2 + Math.random() * 1.2) + 's';
      proposalPetals.appendChild(p);
      p.addEventListener('animationend', function () { p.remove(); });
    }
    proposalRose.addEventListener('mouseenter', function () {
      if (rosePetalsInterval) return;
      rosePetalsInterval = setInterval(spawnPetal, 180);
    });
    proposalRose.addEventListener('mouseleave', function () {
      if (rosePetalsInterval) {
        clearInterval(rosePetalsInterval);
        rosePetalsInterval = null;
      }
    });
  }

  // 💝 Hover on gift – hearts float up
  var proposalGift = document.getElementById('proposal-gift');
  var proposalGiftHearts = document.getElementById('proposal-gift-hearts');
  var giftHeartsInterval = null;
  if (proposalGift && proposalGiftHearts) {
    function spawnGiftHeart() {
      var h = document.createElement('span');
      h.className = 'proposal-gift-heart';
      h.textContent = ['💕', '💗', '❤️', '💖', '💝'][Math.floor(Math.random() * 5)];
      var dx = (Math.random() - 0.5) * 60;
      h.style.setProperty('--gift-dx', dx + 'px');
      h.style.left = '50%';
      h.style.top = '50%';
      h.style.animationDuration = (2 + Math.random() * 1) + 's';
      proposalGiftHearts.appendChild(h);
      h.addEventListener('animationend', function () { h.remove(); });
    }
    proposalGift.addEventListener('mouseenter', function () {
      if (giftHeartsInterval) return;
      giftHeartsInterval = setInterval(spawnGiftHeart, 200);
    });
    proposalGift.addEventListener('mouseleave', function () {
      if (giftHeartsInterval) {
        clearInterval(giftHeartsInterval);
        giftHeartsInterval = null;
      }
    });
  }

  document.getElementById('proposal-yes')?.addEventListener('click', () => {
    proposalOverlay.classList.remove('visible');
    proposalOverlay.classList.remove('theater-mode');
    yesOverlay.classList.remove('hidden');
    yesOverlay.classList.add('visible');
    triggerConfetti();
    if (typeof gsap !== 'undefined') {
      const content = yesOverlay.querySelector('.response-content');
      if (content) gsap.fromTo(content, { scale: 0.85, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 2.5, ease: 'power3.inOut' });
    }
  });

  document.getElementById('proposal-no')?.addEventListener('click', () => {
    proposalOverlay.classList.remove('visible');
    proposalOverlay.classList.remove('theater-mode');
    noOverlay.classList.remove('hidden');
    noOverlay.classList.add('visible');
    if (typeof gsap !== 'undefined') {
      const content = noOverlay.querySelector('.response-content');
      if (content) gsap.fromTo(content, { scale: 0.85, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 2.5, ease: 'power3.inOut' });
    }
  });

  function closeResponseOverlay(overlay) {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.add('hidden'), 500);
    // Also clear blackout if it's active
    const blackout = document.getElementById('blackout-screen');
    if (blackout) {
      blackout.classList.remove('active');
      setTimeout(() => blackout.classList.add('hidden'), 1500);
    }
  }

  yesOverlay?.querySelector('.overlay-close')?.addEventListener('click', () => closeResponseOverlay(yesOverlay));
  noOverlay?.querySelector('.overlay-close')?.addEventListener('click', () => closeResponseOverlay(noOverlay));

  proposalOverlay?.querySelector('.proposal-close')?.addEventListener('click', () => {
    proposalOverlay.classList.remove('visible');
    proposalOverlay.classList.remove('theater-mode');
    const blackout = document.getElementById('blackout-screen');
    if (blackout) {
      blackout.classList.remove('active');
      setTimeout(() => blackout.classList.add('hidden'), 1500);
    }
  });

  // Final Surprise Button - Video Player
  const videoOverlay = document.getElementById('video-overlay');
  const surpriseVideo = document.getElementById('surprise-video');
  const videoCloseBtn = videoOverlay?.querySelector('.video-close');

  document.getElementById('final-surprise-btn')?.addEventListener('click', () => {
    if (videoOverlay && surpriseVideo) {
      // Hide the yes-overlay first for a cleaner transition
      if (yesOverlay) {
        yesOverlay.classList.remove('visible');
        setTimeout(() => yesOverlay.classList.add('hidden'), 500);
      }

      videoOverlay.classList.remove('hidden');
      setTimeout(() => videoOverlay.classList.add('show'), 10);
      surpriseVideo.currentTime = 0; // Reset to start
      surpriseVideo.play().catch(() => { }); // Play with error handling
    }
  });

  // Close video overlay
  videoCloseBtn?.addEventListener('click', () => {
    if (videoOverlay && surpriseVideo) {
      videoOverlay.classList.remove('show');
      surpriseVideo.pause();
      setTimeout(() => {
        videoOverlay.classList.add('hidden');
        surpriseVideo.currentTime = 0;
      }, 500);
    }
  });

  // Close on background click
  videoOverlay?.addEventListener('click', (e) => {
    if (e.target === videoOverlay) {
      videoCloseBtn?.click();
    }
  });

  // Close on video end and return to proposal
  surpriseVideo?.addEventListener('ended', () => {
    if (videoOverlay && surpriseVideo) {
      videoOverlay.classList.remove('show');
      surpriseVideo.pause();

      // Navigate back to proposal section
      if (typeof showSection === 'function') {
        showSection('proposal');
      }

      // Clear the blackout screen
      const blackout = document.getElementById('blackout-screen');
      if (blackout) {
        blackout.classList.remove('active');
        setTimeout(() => blackout.classList.add('hidden'), 1500);
      }

      setTimeout(() => {
        videoOverlay.classList.add('hidden');
        surpriseVideo.currentTime = 0;
      }, 500);
    }
  });

  function triggerConfetti() {
    const container = document.getElementById('yes-confetti');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#ff9ec5', '#e91e8c', '#c9a0dc', '#e8c547', '#fff'];
    const shapes = ['💕', '💗', '❤️', '✨', '🌸'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'confetti-piece';
      c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      c.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        font-size: ${14 + Math.random() * 16}px;
        color: ${colors[Math.floor(Math.random() * colors.length)]};
        pointer-events: none;
        z-index: 10;
      `;
      container.appendChild(c);
      const angle = (Math.PI * 2 * i) / 60 + Math.random();
      const dist = 100 + Math.random() * 200;
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          c,
          { x: 0, y: 0, opacity: 1, rotation: 0 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist - 100,
            opacity: 0,
            rotation: Math.random() * 360,
            duration: 1.5 + Math.random(),
            ease: 'power2.out',
            onComplete: () => c.remove(),
          }
        );
      }
    }
  }

  // ===== Floating Hearts (background emoji animation on every page) =====
  function spawnFloatingHeartsIn(container, customEmojis = null) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;
    el.innerHTML = '';

    // Default emojis if none provided
    const emojiSet = customEmojis || ['💕', '💗', '❤️', '💖'];
    // Higher count for the blackout screen
    const count = container === 'floating-hearts-blackout' ? 25 : 15;

    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'floating-heart';
      h.textContent = emojiSet[i % emojiSet.length];
      h.style.left = Math.random() * 100 + '%';
      h.style.top = Math.random() * 100 + '%';
      h.style.animationDelay = Math.random() * 5 + 's';
      h.style.animationDuration = (5 + Math.random() * 5) + 's';

      // Make them slightly larger and more visible for the blackout
      if (container === 'floating-hearts-blackout') {
        h.style.fontSize = (1.5 + Math.random() * 1.5) + 'rem';
        h.style.opacity = '0.7';
      }

      el.appendChild(h);
    }
  }

  const configurations = [
    { id: 'floating-hearts-home', emojis: ['💕', '✨', '🌸', '💖'] },
    { id: 'floating-hearts-lovemeter', emojis: ['🔥', '❤️', '💘', '💯'] },
    { id: 'floating-hearts-flower-quiz', emojis: ['🌸', '🌺', '🌷', '🌹'] },
    { id: 'floating-hearts-puzzle', emojis: ['🧩', '✨', '💫', '💖'] },
    { id: 'floating-hearts-proposal', emojis: ['💍', '🌹', '✨', '💖'] },
    { id: 'floating-hearts-blackout', emojis: ['💍', '✨', '👰‍♀️', '🤵‍♂️', '💖', '🌹', '🤍'] }
  ];

  configurations.forEach(config => {
    spawnFloatingHeartsIn(config.id, config.emojis);
  });
})();
