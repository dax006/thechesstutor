// function fromTo2move(from, to) { //takes in from,to and finds matching game.move (which has info like piece, color, promotion, captures, etc
//     var moves = game.moves({ verbose: true });
//     var i;
//     var mlen = moves.length;
//     var move1;
//     for (i = 0; i < mlen; i++) {
//         move1 = moves[i];
//         if (move1.from == from && move1.to == to) { //is it a match
//             return move1;
//         }
//     }
//     L("error, no matching move found," + from + " " + to);
// }

function highlightAttacks() {

    highlightUnderAttacks();
    highlightCanAttacks();
}

function highlightUnderAttacks() {
    removeHighlights('red');
    removeHighlights('superred');
    //if (_highlightUnderAttack) {
    if (document.getElementById("highlightUnderAttack").checked){
        //var attackedSquares = getAttackedSquares('w');
        var attackedSquares = Object.keys(_CACHE.attackedSquares['w']);  //https://stackoverflow.com/questions/8763125/get-array-of-objects-keys
        addHighlights(attackedSquares, 'red'); //white pieces under attack are highlighted red
        //check whats under attack
        //var unprotected = getUnprotected('w'); // out of a list of pieces that are under attack, find which ones are not defended.
        var unprotected = _CACHE.unprotected['w'];
        if (unprotected.length > 0) {
            addHighlights(unprotected, 'superred');
        }
    }
}

function highlightCanAttacks() {
    //CLEAR old squares
    removeHighlights('green');
    removeHighlights('supergreen');
    //if (_highlightCanAttack) {
    if (document.getElementById("highlightCanAttack").checked){
        //var attackedSquares = getAttackedSquares('b');
        var attackedSquares = Object.keys(_CACHE.attackedSquares['b']);
        addHighlights(attackedSquares, 'green'); //black pieces under attack are highlighed green
        //var unprotected = getUnprotected('b'); // out of a list of pieces that are under attack, find which ones are not defended.
        var unprotected = _CACHE.unprotected['b'];
        if (unprotected.length > 0) {
            addHighlights(unprotected, 'supergreen');
        }                          
    }
}

function addMoveHighlight(move) {
    //console.log("addMoveHighlights and add current");
    //console.log(typeof move);
    // move = move2obj(move);  //if it was a string turn it into a dict object
    try {
        if (game.turn() === 'b') {
            //if(move.color == 'w'){
            removeHighlights('white');
            addHighlights(move.from,'white');
            addHighlights(move.to,'white');
            //_chessboardEl.find('.square-' + move.from).addClass('highlight-white');
            //_chessboardEl.find('.square-' + move.to).addClass('highlight-white');
        } else {
            removeHighlights('black');
            //_chessboardEl.find('.square-' + move.from).addClass('highlight-black');
            //_chessboardEl.find('.square-' + move.to).addClass('highlight-black');
            addHighlights(move.from,'black');
            addHighlights(move.to,'black');
        }
    } catch (e) {
        L(e.stack);
        L("move:");
        L(move);
    }
}

function highlightLatestMoves(plies) {  //re-add attack and other highlights when using history buttons
    removeHighlights('red');
    removeHighlights('green');
    removeHighlights('supergreen');
    removeHighlights('superred');
    var move1 = _gameHistory.moves[plies - 1];
    var move2 = _gameHistory.moves[plies - 2];
    if (move1 != undefined) addMoveHighlight(move1);
    if (move2 != undefined) addMoveHighlight(move2);
}

function removeAllHighlights() {
    removeHighlights('black');
    removeHighlights('white');
    removeHighlights('red');
    removeHighlights('green');
    removeHighlights('supergreen');
    removeHighlights('superred');
}

function addHighlights(squares, color) {  //add whatever css defined color to whatever square
    if (!squares) return;

    // L("squares:");
    // L(squares);
    // L("squares typeof:" + typeof squares);

    // var isarr = Array.isArray(squares);  //not reliable.  Will be true if there are arrays in the dict
    // L("squares isarray():"+isarr);


    if(typeof squares === 'string'){
        _chessboardEl.find('.square-' + squares).addClass('highlight-' + color);
        return;
    }

    // }else if( isarr){  //its an array

     
    // }else{  //its a dictionary object
    //     squares = Object.keys(squares);

    // }

    var slen = squares.length;
    var i;
    for (i = 0; i < slen; i++) {
        //$('#chessboard .square-' + squares[i]).addClass('highlight-' + color);
        _chessboardEl.find('.square-' + squares[i]).addClass('highlight-' + color);
    }

}

function removeHighlights(color) {
    if (typeof color == 'string') { //else it could be an array?
        _chessboardEl.find('.square-55d63').removeClass('highlight-' + color);
    }
}

function removeBackgrounds(color) {
    if (typeof color == 'string') { //else it could be an array?
        _chessboardEl.find('.square-55d63').removeClass('background-' + color);
    }
}

function setBackground(squares, color) {
    if (!squares) return;
    if (typeof squares === 'string') { //just a lonely square
        //$('#chessboard .square-' + squares).addClass('background-' + color);
        _chessboardEl.find('.square-' + squares).addClass('background-' + color);
        
    } else {
        var slen = squares.length;
        var i;
        for (i = 0; i < slen; i++) {
            //$('#chessboard .square-' + squares[i]).addClass('background-' + color);
            _chessboardEl.find('.square-' + squares[i]).addClass('background-' + color);
        }
    }
}
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% end functions %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%//
