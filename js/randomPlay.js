/*
//requres


  <link rel="stylesheet" href="css/chessboard.css" />
</head>

<style type="text/css">
.highlight-white {
  -webkit-box-shadow: inset 0 0 3px 3px yellow;
  -moz-box-shadow: inset 0 0 3px 3px yellow;
  box-shadow: inset 0 0 3px 3px yellow;  
}
.highlight-black {
  -webkit-box-shadow: inset 0 0 3px 3px blue;
  -moz-box-shadow: inset 0 0 3px 3px blue;
  box-shadow: inset 0 0 3px 3px blue;  
}
</style>
<script src="js/json3.min.js"></script>
<script src="js/jquery-1.10.1.min.js"></script>
<script src="js/chessboard.js"></script>
<script src="js/chess.js"></script>


<div id="randomboard" style="width: 400px"></div>

*/




var randomboard,
  randomboardEl = $('#randomboard'),
  randomgame = new Chess(),
  squareClass = 'square-55d63',
  squareToHighlight,
  colorToHighlight;

var makeRandomMove = function() {
  var possibleMoves = randomgame.moves({
    verbose: true
  });

  // exit if the randomgame is over
  if (randomgame.game_over() === true ||
    randomgame.in_draw() === true ||
    possibleMoves.length === 0) return;

  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  var move = possibleMoves[randomIndex];

  if (move.color === 'w') {
    randomboardEl.find('.' + squareClass).removeClass('highlight-white');
    randomboardEl.find('.square-' + move.from).addClass('highlight-white');
    randomboardEl.find('.square-' + move.to).addClass('highlight-white');
  }
  else {
    randomboardEl.find('.square-55d63').removeClass('highlight-black');
    randomboardEl.find('.square-' + move.from).addClass('highlight-black');
    randomboardEl.find('.square-' + move.to).addClass('highlight-black');
    
  }

  randomgame.move(possibleMoves[randomIndex].san);
  randomboard.position(randomgame.fen());

  window.setTimeout(makeRandomMove, 1200);
};


var cfg = {
  position: 'start',

};
randomboard = ChessBoard('randomboard', cfg);

window.setTimeout(makeRandomMove, 500);