//******************************************** event handlers ******************************************************//



function onDragStart(source, piece) {
    // do not pick up pieces if the game is over
    // or if it's not that side's turn

    //L("onDragStart. " + source + " , " + piece);

    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }


    //if ((game.turn() === 'w' && _whiteComputer) || (game.turn() === 'b' && _blackComputer)) { //will the computer make a move automatically?
    if (isComputerTurn()) { //will the computer make a move automatically?
        return false;  //disable user playing with it if computer is playing - not that it breaks, but it's just.. not intuitive
    }

    //don't allow dragging other peices if they made a move and are waiting to confirm or undo it
    if (_waitingForConfirm){
        return false;
    }

    // //disable global scrolling, for mobile  //doesnt work on mobile :(
    // $("body").css("overflow", "hidden");
    //disableScroll();  //also doesn't work on mobile


};


var onMouseoverSquare = function(square, piece) {
    //console.log("onMouseoverSquare");
    // get list of possible moves for this square


    //if ((game.turn() === 'w' && _whiteComputer) || (game.turn() === 'b' && _blackComputer)) return false;
    if (isComputerTurn()) return false;

    if (_waitingForConfirm){
        return false;
    }


    var moves2 = game.moves({
        square: square,
        verbose: true
    });
    // exit if there are no moves available for this square
    if (moves2.length === 0) return;
    // highlight the square they moused over
    //greenSquare(square);
    setBackground(square,'lightgreen');
    // highlight the possible squares for this piece
    for (var i = 0; i < moves2.length; i++) {
        //greenSquare(moves2[i].to);
        setBackground(moves2[i].to,'lightgreen');
    }
};
var onMouseoutSquare = function(square, piece) {
    //removegreenSquares();
    removeBackgrounds('lightgreen');
};
var onSnapEnd = function() {

    chessboard.position(game.fen());
};
// var removeHighlights = function(color) {
//     _chessboardEl.find('.square-55d63')
//         .removeClass('highlight-' + color);
// };

var onDrop = function(source, target, piece) {

    //console.log("onDrop.");
    //removegreenSquares();  //green showed legal moves
    removeBackgrounds('lightgreen');
    // see if the move is legal
    //update the internal chess.js game
    var move = game.move({  
        from: source,
        to: target,
        piece: piece.charAt(1).toLowerCase(),
        color: piece.charAt(0),
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });
    // illegal move

    if (move === null) return 'snapback';

    L("applyed human move. game.turn():"+game.turn());

    addMoveHighlight(move);  //remove the highlights left by the previous move
    removeHighlights('red');
    removeHighlights('green');
    removeBackgrounds('red');
    
    updateHistory(move); //so forward/back work properly
    



    // //only white moves need confirmation
    if (game.turn() === 'b'){  // 'b' because white just moved
        undoConfirmMovesOn();  //enable it
        getFeedback(move)  //populates the _curHints  //feedback is AFTER the move is done.  advice is before.
        //printHint();  // show first hint
        if(!_confirmMoves) {
            computerMove();  //override the confirmation step
        }
    }else{

        computerMove();  //see if computer's turn to move
        //getAdvice();//populates the _curHints  //advice is *before* the users (white) move.  //done in computerMove
    }

    // //enable global scrolling, for mobile  //doesnt work on mobile :(
    // $("body").css("overflow", "auto");


};

var onMoveEnd = function(){
    console.log("onMoveEnd!  Why don't you work when I move!");
}



//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& button handlers &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//
//start new game
$('#startBtn').on('click', function() {
    chessboard.start(); //reset chessboard
    //reset history
    plies = 0;
    _gameHistory.FEN.length = 1
    _gameHistory.moves.length = 0;
    //clear internal representation
    game.reset();
    computerMove();
    //remove highlights
    removeAllHighlights();
    _tutorOutput = [];
    _engineOutput = [];
    _CACHE = {};
    document.getElementById("output").innerHTML = "";
    document.getElementById("engineoutput").innerHTML = "";
    _waitingForConfirm = false;
    undoConfirmMovesOff();
    computerMove();  //if computer is playing white, check that

});
//$('#clearBtn').on('click', chessboard.clear);
// If Next button clicked, move forward one
$('#nextBtn').on('click', function() {
    plies += 1;
    if (plies >= _gameHistory.FEN.length) {
        plies = _gameHistory.FEN.length - 1;
    }
    chessboard.position(_gameHistory.FEN[plies]);

    game.load(_gameHistory.FEN[plies]); //set the internal engine
    highlightLatestMoves(plies);
    
});
// 4. If Prev button clicked, move backward one
$('#prevBtn').on('click', function() {
    //game.undo();  //needed to set whose move it is?
    //console.log(plies);
    //console.log(_gameHistory);
    plies -= 1;
    if (plies < 0) {
        plies = 0;
    }
    chessboard.position(_gameHistory.FEN[plies]); //set the graphics
    game.load(_gameHistory.FEN[plies]); //set the internal engine
    highlightLatestMoves(plies);
});
// 5. If Start button clicked, go to start position
$('#beginningBtn').on('click', function() {
    plies = 0;
    chessboard.position(_gameHistory.FEN[0]);
    game.load(_gameHistory.FEN[plies]); //set the internal engine
    //chessboard.start();  //this erases history
    
    removeAllHighlights();
});
// 6. If End button clicked, go to end position
$('#endBtn').on('click', function() {
    chessboard.position(_gameHistory.FEN[_gameHistory.FEN.length - 1]);
    game.load(_gameHistory.FEN[plies]); //set the internal engine
    plies = _gameHistory.FEN.length - 1;
    
    highlightLatestMoves(plies);
});

//use the HTML5 <details> tag instead
// $('#toggleEngineOutput').on('click', function() {
//     console.log("Toggle clicked!");
//     $("#engineoutput").toggle(); //hide/show the div
// });
// $('#toggleOptions').on('click', function() {
//     console.log("Toggle clicked!");
//     $("#optionsDiv").toggle(); //hide/show the div
// });
 $('#forceMoveBtn').on('click', function() {
     //console.log("move clicked");
     getBestMoves(applyComputerMove); //must pass in the name of a function that will be the callback when moves are available
 });

$('#refreshAdviceBtn').on('click', function() {  //in case they were going through history or something
     //console.log("move clicked");
     //getBestMoves(applyComputerMove); //must pass in the name of a function that will be the callback when moves are available
     getAdvice(); 

 });

$('#whiteComputer').on('click', function() {
    //console.log("White clicked");
    _whiteComputer = !_whiteComputer; //toggle it
    if(game.turn() === 'w' && _whiteComputer){
        computerMove();
    }
});
$('#blackComputer').on('click', function() {
    //console.log("black clicked");
    _blackComputer = !_blackComputer; //toggle it
    if(game.turn() === 'b' && _blackComputer){
        computerMove();
    }
});

$('#highlightUnderAttack').on('click', function() {
    //_highlightUnderAttack = !_highlightUnderAttack;

    highlightUnderAttacks();

});
$('#highlightCanAttack').on('click', function() {
    //_highlightCanAttack = !_highlightCanAttack;

    highlightCanAttacks();

});

$('#confirmBtn').on('click', function() {
  //toggleundoConfirmMoves();
  //L("confirmBtn click. Calling computerMove.  Game.turn():"+game.turn());
  undoConfirmMovesOff();
  computerMove();//if playing against computer, computer moves

});
$('#undoBtn').on('click', function() {
    game.undo();  //undo move internally
    chessboard.position(game.fen());  //undo move on board
    undoConfirmMovesOff();  //turn off undo button
    removeHighlights('white');
    getAdvice();  //refresh the advice for the previous position

});
$('#hintBtn').on('click', function() {
  printHint();
});

$('#selectDiff').on('change', function() {

    _difficulty = document.getElementById("selectDiff").value;
    console.log("setting difficulty to "+_difficulty);
    _numBestMoves = 6-_difficulty; //difficulty 1 takes the 5th best move, difficulty 2 takes the 4rd best,3 = 3nd best, etc
    stockfish.postMessage('setoption name MultiPV value '+_numBestMoves);
    stockfish.postMessage('setoption name Skill Level value '+_difficulty);
    printToEngineoutput('setoption name MultiPV value '+_numBestMoves);
    printToEngineoutput('setoption name Skill Level value '+_difficulty);

 // console.log(e);

});

$('#confirmMoves').on('click', function() {
    L("confirmMoves click.");
    _confirmMoves = !_confirmMoves; //toggle it

    if(!document.getElementById("confirmMoves").checked){  //if we unchecked it
        undoConfirmMovesOff();
        computerMove(); //check if computers turn to move
    }
    
});

function changeFont(input){
    //console.log("RRAAH");
    //console.log(input);
    $("body").css("font-family",input);

}

//*************************************end functions**************************************************//


