//loadChessBoard.js





// Highlight Legal Moves from   https://chessboardjs.com/examples#5003  //



var removegreenSquares = function() {

  $('#board .square-55d63').css('background', '');

};



var greenSquare = function(square) {

  var squareEl = $('#board .square-' + square);

  

  var background = '#69d969';

  // if (squareEl.hasClass('black-3c85d') === true) {  //multiple colors is just too distracting

  //   background = '#69d969';  

  // }



  squareEl.css('background', background);

};



var onDragStart = function(source, piece) {

  // do not pick up pieces if the game is over

  // or if it's not that side's turn

  if (game.game_over() === true ||

      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||

      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {

    return false;

  }

};



var onDrop = function(source, target, piece) {





  removegreenSquares();



  // see if the move is legal

  //update the internal chess.js game

  var move = game.move({

    from: source,

    to: target,

    promotion: 'q' // NOTE: always promote to a queen for example simplicity

  });





  // illegal move

  if (move === null) return 'snapback';





  updateHistory(source+"-"+target);  //so forward/back work properly





  if (move.color === 'w') {

    boardEl.find('.square-55d63').removeClass('highlight-white');  //remove all previous highlights

    boardEl.find('.square-' + move.from).addClass('highlight-white');

    boardEl.find('.square-' + move.to).addClass('highlight-white');

    

  }

  else {

    boardEl.find('.square-55d63').removeClass('highlight-black');

    boardEl.find('.square-' + move.from).addClass('highlight-black');

    boardEl.find('.square-' + move.to).addClass('highlight-black');

  }

};



function updateHistory(move){





	plies += 1;

	gameHistory.FEN.length = plies;  	//if we rewond the history and make a move, delete all future history

	gameHistory.moves.length = plies-1

	gameHistory.FEN.push(game.fen());  //add new move

	gameHistory.moves.push(move);

	console.log(game.fen());

}





var onMouseoverSquare = function(square, piece) {

  // get list of possible moves for this square

  var moves2 = game.moves({

    square: square,

    verbose: true

  });



  // exit if there are no moves available for this square

  if (moves2.length === 0) return;





  // highlight the square they moused over

  greenSquare(square);



  // highlight the possible squares for this piece

  for (var i = 0; i < moves2.length; i++) {

    greenSquare(moves2[i].to);

  }

};



var onMouseoutSquare = function(square, piece) {

  removegreenSquares();

};



var onSnapEnd = function() {

  board.position(game.fen());

};





var removeHighlights = function(color) {

  boardEl.find('.square-55d63')

    .removeClass('highlight-' + color);

};









//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% end functions %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%//



	//for keeping track of history







var board,

  boardEl = $('#board'),   //boardElement  .

  game = new Chess();





var cfg = {

  draggable: true,

  position: 'start',

  onDragStart: onDragStart,

  onDrop: onDrop,

  onMouseoutSquare: onMouseoutSquare,

  onMouseoverSquare: onMouseoverSquare,

  onSnapEnd: onSnapEnd,



  showErrors: 'alert'

};





//end highlight moves//

board = ChessBoard('board',cfg);



	var plies = 0;  //keep track of number of plies (half moves) in the game

	var gameHistory={FEN:[],moves:[]};  //stores each board position and move as a complete FEN

	gameHistory.FEN.push(game.fen());

	console.log(gameHistory.FEN);

