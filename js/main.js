//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ functions @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@//



///////////////////////////////////////////// Showing hints ///////////////////////////////////////////////////


//Gets the current hint, removes it from available hints, stores it in viewed hints
function printHint(str) {

    if(str != undefined){  //if they passed in a specific string, print that
        //printToOutput(str);
        printToAvatar(str);
        return true;
    }

    //get the next hint in the _curHints list
    if (_curHints != undefined && _curHints.length > 0) {
        var nextHint = _curHints[0];
        if (nextHint != undefined) {
            //remove it from current hints array, store it in viewed array
            //printToOutput(nextHint);
            printToAvatar(nextHint);
            _hintsViewed.push(_curHints.shift());  //get the first one and remove it from array
            
            if(_curHints.length == 0){
                
                hintBtnOff(); //no more hints after this.  diable hints button.
            }
            return true;
        }

    }
    //printToOutput("No hints available");  //got annoying
    hintBtnOff(); //no hints to show.  diable hints button.
    return false; //no hints to give
}


function printToAvatar(str, avatar){
   //if its an array then it has meta data with the string
   if(avatar == undefined) avatar = PAWN;  //default is pawn
    if(Array.isArray(str)){
        avatar = str[1];
        str = str[0];
    }
    str = avatarSays(str,avatar);  //puts the string into a <div> with fancy colors and all that.
    printToOutput(str);
}


function avatarSays(str,avatar){

    var border, imgFile;
    if(avatar == PAWN){
        border = "yellowborder";
        imgFile ="img/happy-pawn.png";
    }else if(avatar == KNIGHT){
        border = "redborder";
        imgFile ="img/angry-knight2.png";
    }else if(avatar == KING){
        border = "blueborder";
        imgFile ="img/smug-king1.png";
    }

    var html = '<div class="avatarbox '+border+' "><img class="avatar" src="'+imgFile+'" /><div class="hintText">' + str + '<div class="clear"></div></div></div>';

    return html;

}

//actually display the string on the output div
function printToOutput(str) {
    //  document.getElementById("output").innerHTML += str + '<br>';

    str = '<div class ="outputText">' + str + '</div>';  //why is it putting huge gaps
    _tutorOutput.push(str);
    document.getElementById("output").innerHTML = _tutorOutput.join(''); //https://stackoverflow.com/questions/18393981/append-vs-html-vs-innerhtml-performance
    

    // //scroll to bottom
    // var objDiv = document.getElementById("scrollBarOnLeft"); //https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div?rq=1
    // objDiv.scrollTop = objDiv.scrollHeight;  //scroll to bottom.. not working.. hmm..

    // var objDiv = document.getElementById("output"); //https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div?rq=1
    // objDiv.scrollTop = objDiv.scrollHeight;  //scroll to bottom.. not working.. hmm..

    // var objDiv = document.getElementById("LTR"); //https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div?rq=1
    // objDiv.scrollTop = objDiv.scrollHeight;  //scroll to bottom.. not working.. hmm..

    var sb = document.getElementById("scrollBarOnLeft");
    if(sb){
        $('#scrollBarOnLeft').stop().animate({
          scrollTop: $('#scrollBarOnLeft')[0].scrollHeight  //kinda works when debugging pane isnt open...
        }, 800);
    }

    var sb = document.getElementById("output");
    if(sb){
        $('#output').stop().animate({
          scrollTop: $('#output')[0].scrollHeight  //kinda works when debugging pane isnt open...
        }, 800);
    }
}


///////////////////////////////// button on/off ////////////////////////////////////////////////

function undoConfirmMovesOff() {
    
    if(document.getElementById("undoBtn")){
        document.getElementById("undoBtn").disabled = true;
        document.getElementById("confirmBtn").disabled = true;
        //enable board inputs 
        //onDragStart = origDragStart; ///can move pieces
        _waitingForConfirm = false;

        $("#undoBtn").removeClass('pop');
        $("#confirmBtn").removeClass('pop');

    }
}

function undoConfirmMovesOn() {

    if (!_confirmMoves) return;  // if they selected confirm moves off, then never enable this button

    //L("turning buttons on");
    document.getElementById("undoBtn").disabled = false;
    document.getElementById("confirmBtn").disabled = false;
    //we need to disable board inputs so they can't move black
    //onDragStart = function() {return false;}; ///can't move pieces  //doesnt work
    _waitingForConfirm = true;

    //make them pop briefly to remind them they need to click one of these
    $("#undoBtn").addClass('pop');
    $("#confirmBtn").addClass('pop');

}

function hintBtnOff() {
    document.getElementById("hintBtn").disabled = true;
}

function hintBtnOn() {
    document.getElementById("hintBtn").disabled = false;
}

////////////////////////////////////////////// computer makes moves ////////////////////////////////////////////


function computerMove() {
    // L(" computermove().  Calling delayed(). game.turn():"+game.turn());
    // L(game.ascii());
    // setTimeout(computerMoveDelayed, COMPUTERDELAY); //the computer was moving too fast


    if (isComputerTurn()) { //will the computer make a move automatically?
        if (_difficulty == 0) {
            var move = getRandomMove();
            applyComputerMove([move]);
        } else {
            getBestMoves(applyComputerMove); //must pass in the name of a function that will be the callback when moves are available
        }
    }else{  //the computer is not moving, so show advice for human
        getAdvice();
    }
}

function isComputerTurn(){
    var turn =  game.turn();
    if(turn === 'w' && _whiteComputer){
        return true;
    }
    if(turn === 'b' && _blackComputer){
        return true;
    };
}

// function computerMoveDelayed() { //cuz it was moving uncannily fast
//     //if playing against computer, computer moves
//     //L("delay: "+COMPUTERDELAY);
//     L("ComputermoveDelayed(). game.turn():"+game.turn());
//     L(game.ascii());
//     if ((game.turn() === 'w' && _whiteComputer) || (game.turn() === 'b' && _blackComputer)) { //will the computer make a move automatically?
//         if (_difficulty == 0) {
//             var move = getRandomMove();
//             applyComputerMove([move]);
//         } else {
//             getBestMoves(applyComputerMove); //must pass in the name of a function that will be the callback when moves are available
//         }
//     }else{  //the computer is not moving, so show advice for human
//         getAdvice();
//     }

// }

function applyComputerMove(bestmoves) {
    // L("applyComputerMove HANDLER RETURNED!");
    // L("bestmoves");
    // L(bestmoves);


    var theMove;
    var blen = bestmoves.length - 1;
    if(_difficulty == 1){
        theMove = bestmoves[blen];
    }else if(_difficulty == 2){
        theMove = bestmoves[3];
    }else if(_difficulty == 3){
        theMove = bestmoves[2];
    }else if(_difficulty == 4){
        theMove = bestmoves[1];  //2nd best
    }else if(_difficulty == 5){
        theMove = bestmoves[0];  //the best
    }else{  //default
        theMove = bestmoves[0];  //the best
    }

    if (theMove == "-(none)" || theMove == undefined || bestmoves.length == 0){
        
        printToOutput("The game is over.  Feel free to rewind the game or start a new game.");
        document.getElementById("forceMoveBtn").value = "None";
        return;
    }

    //computer moving too fast!
    setTimeout(function(){
        computerMoveDelayed(theMove);  //https://stackoverflow.com/questions/1190642/how-can-i-pass-a-parameter-to-a-settimeout-callback
    }, COMPUTERDELAY); //the computer was moving too fast


}


function computerMoveDelayed(move){  //because its' moving too fast!
    //L("update game with move:"+theMove);
    //L("prev fen:"+ game.fen());
    //L("applying move.  game.turn()"+game.turn());
    game.move(move, { sloppy: true }); //update internal state
    //L("post fen:"+ game.fen());
    //L("applyed move.  game.turn()"+game.turn());

    chessboard.position(game.fen()); //redraw chessboard 
    addMoveHighlight(move); //remove the highlights left by the previous move
    updateHistory(move); //so forward/back work properly  //do this after game makes the move to get most up to date chessboard

    //check if computer moves other side - more efficient than looping constantly
    //L("calling computermove().  game.turn():"+game.turn());
    computerMove();

}

// function applyHumanMove(move) {  //see onDrop
//     //L("HANDLER RETURNED!");
//     L(bestmoves);
//     var theMove = bestmoves[0];
//     game.move(theMove, { sloppy: true }); //update internal state
//     //chessboard.position(game.fen()); //redraw chessboard  //is this required? 
//     updateHistory(theMove); //so forward/back work properly  //do this after game makes the move to get most up to date chessboard
//    //check if computer moves other side - more efficient than looping constantly
//     computerMove();
// }
function getRandomMove() { //handler is the function that is called to return the best moves
    var moves = game.moves({verbose:true});
    //var moves = _CACHE.moves[game.turn()];
    var move = moves[Math.floor(Math.random() * moves.length)];
    //L("random move " + move);
    return move;
}

function updateHistory(move) {
    //L("Update History");
    //L("Plies:"+plies);
    //L(_gameHistory);
    plies += 1;
    _gameHistory.FEN.length = plies; //if we rewond the history and make a move, delete all future history
    _gameHistory.moves.length = plies - 1
    _gameHistory.FEN.push(game.fen()); //add new move
    _gameHistory.moves.push(move);
    //L(game.fen());
}

//////////////////////////////////////////// getting feedback or advice /////////////////////////////////////////////////////////


function reloadCache(){
    //calls all major functions that gets data, and puts all that data in one spot.
    //should be called every ply
    //careful do not reset all of _CACHE, because some data is only called per move (good/bad classifications)
    _CACHE.attackedSquares = {};
    _CACHE.seenSquares = {};
    _CACHE.seenSquares.w = getSeenSquares('w');
    _CACHE.seenSquares.b = getSeenSquares('b');
    _CACHE.attackedSquares['w'] = getAttackedSquares('w');
    _CACHE.attackedSquares['b'] = getAttackedSquares('b');
    _CACHE.unprotected = {};
    _CACHE.unprotected['w'] = getUnprotected('w');
    _CACHE.unprotected['b'] = getUnprotected('b');
    _CACHE.moves = {};
    //_CACHE.moves['w'] = game.moves({verbose:true});
    _CACHE.moves['w'] = getMoves('w');  
    _CACHE.moves['b'] = getMoves('b');  

    _curHints=[];//clear the current hints list
    _hintsViewed = [];

}


//gets feedback for move (see data.js)
function getFeedback(move) {


    //return;// turn off feedback for now

    //for the move:
    //look for hand-coded feedback for that move

    //if they moved knight/bishop out, congratulate them

    //if they controlled the center 

    reloadCache();  //get all info for everything and store it in one place

    //hintBtnOn(); //hint button on
    //load hints
    //checkStrategies(move);  // Attempt to automate function calls and feedback

    if(_begMidEndGame == BEGINNING){


        genericGoodBadFeedback(move);  //generic 'this was a good/bad/losing move' - should be first.  Advice should go from most general to most specific

        //the hand-coded Hints
        var specificFeedback = feedback.moves[(move.from + move.to)];
        if(specificFeedback != undefined){
            _curHints = _curHints.concat(specificFeedback);
        }


        if(isControlCenter(move) || isCastle(move)){
            _curHints.push("This move controls the center!  Great job!");
         
        }else if(!isCapture(move)){  // it doesnt control the center and isn't a capture
            _curHints.push(['This move does not help control the center.',KING]);
        }

        if(isKnightBishopOut(move)){
            _curHints.push("Nice!  Keep getting your knights and bishops out." );
        }
        if(isCastle(move)){

            _curHints.push(["There's almost never a bad time to castle.",PAWN]);
            _curHints.push(["Castling is a good way to protect your king and get your rook to the middle.",KING]);
        }

        if(isQueen(move)){
            _curHints = _curHints.concat(feedback.earlyQueen);   
        }


        // }else{
        //    _curHints.push(["The beginning of the game is over.  I have no more hints.",KING]);
        // }

        
        //check if they captured something
            //check if it was free
            //check if it was greater/lesser value

        //check if move prevented/moved out of check/attack/pin? 


    }
    printHint();
    highlightAttacks();





}

function isQueen(move){
    if(move.piece == 'q'){
        return true;
    }
    return false;
}

function genericGoodBadFeedback(move){

    var amove = move.from+move.to;
    L("your move is:" + amove);
    L("san:"+move.san);

    //How to verify that data is up-to-date?.. hmm.. i guess we will have to store last move, and update it when all scores are completed?  //todo
    if(!_CACHE.moveScores) return;


    var ratings = _CACHE.moveRatings;
    var score = _CACHE.moveScores[amove]
    L("move score:" + score);
    L("Current score:"+_curSFscore);
    L("difference of:"+ ( score - _curSFscore) + " from current score.");
    L("difference of:"+ ( score - ratings.bestScore) + " from best move " + ratings.bestMove);
    L("all scores:");
    L(_CACHE.moveScores);

    

    //say if move was good, bad, best
    if  (score == "mate"){
        _curHints.push("This move is Checkmate!  Woo Hoo!");
    }else if(amove == ratings.bestMove){
        _curHints.push("You made the best move!");
    }else if(ratings.good.indexOf(amove) >= 0){
        _curHints.push("That move was one of the best moves.");
    }else if(ratings.neutral.indexOf(amove) >= 0){
        _curHints.push("This is an ok move.  Not great.  Just ok.");
    }else if(ratings.bad.indexOf(amove) >= 0){
        _curHints.push(["There is a much better move out there..",KING]);
    }else if(ratings.losing.indexOf(amove) >= 0){
        _curHints.push(["Whoa!  There is a much, much better move out there.",KNIGHT]);
        // TODO I need to explain why
    }


    //L("just scores:");
    //L(_CACHE.scoreChanges);
    // L("best move score:" + ratings.best[1]);
    // L(ratings);

}

function getAdvice() { //opponent just moved.. now show advice - use the same _curHints array

    if(game.in_checkmate()){
        printToOutput("Checkmate.");
        alert("Checkmate")
    }
    if(game.in_stalemate()){
        printToOutput("Stalemate.");
        alert("Stalemate")
    }

    if(game.turn() == 'b') return;  //our advice only works for if you are playing white


    reloadCache();



    
    var in_check = game.in_check();
    //_CACHE.in_check = in_check;
    var iCP = isCastlePossible();
    //_CACHE.iCP = iCP;
    var ccn = canCastleNow();
    //_CACHE.ccn = ccn;


    if(game.in_check()){  //check has priority
        printToOutput("Check.");
    }


    printToOutput("It is your turn.");
    //L("getAdvice()");
    // //first always check check
    // //always check what's under attack
    // //if there is something, check if its defended.
    // //if its under attack by two+ things, check if youve got two+ things defending it, or a pawn
    // //if no threats, check what can *you* attack
    // //if its free, take it
    // //else
    // //get bish/knights out
    // //castle
    // //get rooks towards middle
    // //see what is unprotected - try to attack it
    // //see what is weak - try to gang up on it
    // //find a way to create a pin



    _isUnderAttack = false;  //not sure what this is for.. we are alwayts under attack?

    hintBtnOn(); //hint button on

    var moves = getMoves('w');
    //L(moves);

    curScore(curSFscoreCallback);  //sets the global _curSFscore
  // /// generic good bad moves available - data saved for feedback
    scoreMoves(moves, scoreMovesCallback);

    var iKBO;
    var unprotected;

    
    //check if in check
    if(in_check){  //check has priority
        
        _curHints = _curHints.concat(advice.inCheck);

    }else{


        //check whats under attack
        //var unprotected = getUnprotected('w');// out of a list of pieces that are under attack, find which ones are not defended.
        unprotected = _CACHE.unprotected['w'];
        var unequal = unequalAttacked('w');
        //L(unprotected);
        
        if(unprotected.length > 0){
            _curHints = _curHints.concat(advice.unprotected);          
    //          _isUnderAttack = true;  //so we dont print weaker hints
          
        }else{
            //nothing was under attack.. now see what we can attack
          //unprotected = getUnprotected('b');// out of a list of pieces that are under attack, find which ones are not defended.
          unprotected = _CACHE.unprotected['b'];
          
          if(unprotected.length > 0){
            //if(_highlightCanAttack) addHighlights(unprotected,'supergreen');    
            _curHints = _curHints.concat(advice.canAttack);          
            
          }
        

       // if(!_isUnderAttack){

            //check if center needs controlling (ie. is it still beginning of game
            if(_begMidEndGame == BEGINNING){
                
                iKBO = isKnightsBishopsOut();  //boolean
                _CACHE.iKBO = iKBO;
                //check if knights/bishops need getting out
                if(!iKBO){
                    _curHints.push("Get your knights and bishops out.");
                }else{
                    _curHints = _curHints.concat(advice.knightBishopOut);                  
                }

                _curHints.push("Try to control the center of the board.");

            }


            //if knights bishops out and can castle, then urge them to castle
            if(iKBO && iCP){

                _curHints = _curHints.concat(advice.castlePossible);

                
            } //if castle possible but just not right now then something is preventing the castle
            if(iKBO && iCP && !ccn){
                _curHints = _curHints.concat(advice.castleBlocked);            
                
            }
            //check if can castle, regardless of whether kngiths and bishops are out
            if(ccn){
                _curHints.push("Castling is a good way to protect your king and get your rook into the action.");
            }
            
            //if middle game
            if(iKBO && !iCP && _begMidEndGame == BEGINNING){
                //TODO
                _begMidEndGame = MIDDLE;  //allpices are out and they castled - set game state to middle game (no longer check if control center or knights out
                _curHints = _curHints.concat(advice.midGame);    
                _curHints.push("This is the end of the lesson.")
            }
        }
    }
        


  

    printHint();  //give the first move for free

    highlightAttacks();





 
}

function genericGoodBadAdvice(){

    var ratings = _CACHE.moveRatings;
    var moveScores = _CACHE.moveScores;

    //what feedback can we generate from this data...  hmm... brainstorm..

    var bestMove = ratings.bestMove;
    var bestScore = moveScores[bestMove];
    if(bestScore > 500){
        _curHints.push("I see an AMAZING move!");
    }else if(bestScore > 200){
        _curHints.push("I see a really good move!");
    }else if(ratings["good"].length > 3){
        _curHints.push("You have a bunch of good moves.");
    }else if(ratings["good"].length == 1){
        _curHints.push("Be careful.. you only have one good move.");
    }else if(ratings["neutral"].length > 4){
        _curHints.push("A lot of moves are about the same.");
    }

}



function curScore(handler) {
    //console.log("curScore()");
    //console.log(handler);
    stockfish.onmessage = handler;
    stockfish.postMessage('position fen ' + game.fen()); //set board for stockfish to analyse
    stockfish.postMessage('eval');  //prints out that big ol list
    printToEngineoutput('position fen ' + game.fen());
    printToEngineoutput('eval');
}

function curSFscoreCallback(event) {
    printToEngineoutput(event.data);
    var s = event.data.substring(0, 16);
    if (s == "Total Evaluation") {
        s = event.data.substring(18, 24);
        //L(s);
        _curSFscore = 100 * parseFloat(s); //characters 18 through 24 hold the score

        L("new _curSFscore:" + _curSFscore);
    }
}


function scoreMovesCallback(moveScores) {
    //L("scoremovesCallback().  ALL moves finished scoring.");
    //L(results);
    //returns dict of moves: score

    // L(game.moves());
    // L(results);

    _CACHE.moveScores = moveScores;
//   classifyMoves(moveScores);
    _CACHE.moveRatings = classifyMoves(moveScores);

    
}

function classifyMoves(moveScores) {
    //label moves as good, bad, nuetral, best, losing
    //do statistical analysis ?

    // L("moveScores");
    // L(moveScores);

    // // Analysis of stockfish's numbers
    // the 'best' move usually keeps the score about even, assuming the opponent has a counter
    // a good move can lose up to -100 and still be one of the top moves
    // an ok, average move like pinning a knight against the queen can lose more
    // sometimes the computer sees you don't have to take a piece *now* and penalizes you for taking a free piece
    // a simple 2 pawns move where the order doesnt matter can penalize -50 for moving in the 'wrong' order
    // so yes you can give away a free pawn and that can get the same score as a 'good' move




    

    //https://stackoverflow.com/questions/25500316/sort-a-dictionary-by-value-in-javascript
    // Create items array
    var items = Object.keys(moveScores).map(function(key) {
      return [key, moveScores[key]];
    });

    // Sort the array based on the second element
    items.sort(function(first, second) {
      return second[1] - first[1];
    });

    //L(items);

    var ilen = items.length;
    var i, movescore,score;
    var bestmove,bestScore;
    var goodMoves = [];
    var neutralMoves = [];
    var badMoves = [];
    var losingMoves = [];
    var scoreChanges = [];  //for debugging
    var curScore = _curSFscore;  //hopefully this is up to date... :)

    L("sorted moves")
    L(items)

    //sift out best, then good, then neutral, then bad moves - this is very subjective and only gets simple scenarios
    for(i = 0;i < ilen;i++){
        if(i==0){   //since they are sorted the first one is the best move
             bestMove = items[0][0];  //don't store scores here.  If we need scores then refer to master CACHE.moveScores
             bestScore = items[0][1];  //use best score to determine worth of all the other moves
         }

        movescore = items[i][1];  //current item
        if(movescore == 'mate') {
            bestMove = items[i][0]
            goodMoves.push(items[i][0]);
            L("something must be done about mating moves");
            continue;
        }
        diffCur = movescore - curScore;  // Difference between current score
        scoreChanges.push("Difference from current score:" + diffCur);

        diffBest = movescore - bestScore;  // Doesnt work if there is one super good move like a mate - other good moves will be seen as 'bad'.
        
        if(diffCur > -100 || scoreChanges){   //within 100 of the current score
            goodMoves.push(items[i][0]);
        }else if(diffCur > -200){  //within 100 of the best move
            neutralMoves.push(items[i][0]);
        }else if(diffCur > -300){  // a bishop or more
            badMoves.push(items[i][0]);
        }else{  //should catch 'nan', which is what happened when we try to turn 'mate' into a number.  But that's bad.  It will find a mate a losing move.
            losingMoves.push(items[i][0]);
        }
    }

    _CACHE.scoreChanges=scoreChanges;  //for testing

    //for use in the 'feedback' section
    ratings = {};
    ratings["bestMove"] = bestMove;
    ratings["bestScore"] = bestScore;
    ratings["good"] = goodMoves;
    ratings["neutral"] = neutralMoves;
    ratings["bad"] = badMoves;
    ratings["losing"] = losingMoves;
    //L(ratings);
    //get average
    //get mean
    //get std

    return ratings;
}


////////////////////////////////////////////////// specific tactics or strategies /////////////////////////////////////////////////////////

function isCapture(move){
    if(move.flags.indexOf('c') >= 0) {  //c means capture
        return true;
    }
    return false;
}

function isCastlePossible(){ //checks whether castle is stil possible now or in future
    
    //just look at fen string - fastest I think
    var fen = game.fen();
    var tokens = fen.split(" ");
    var ct =  tokens[2];  //castle token
    if (ct.indexOf("K") >= 0 || ct.indexOf("Q") >= 0){  //kingside or queenside
        return true;
    }
    return false;  

}

function canCastleNow(){ //checks if player can castle NOW
    
    if (!isCastlePossible()) return false;  //faster than looping through each move?
    var i;
    //var moves = game.moves({verbose:true});
    var moves = _CACHE.moves['w'];
    var mlen = moves.length;
    var flags;
    for(i = 0; i < mlen ; i++){
        flags = moves[i].flags;
        if(flags == 'k') return true;

    }
    return false;  // no king castle move was found
}

function getUnprotected(color){

    //var attackedSquares = getAttackedSquares(color);  //gets all squares opponents can attack, gets all squares You can attack, see if any exist in one list that aint in the other
    //L(squares);
    var attackedSquares = _CACHE.attackedSquares[color];
    var SS = _CACHE.seenSquares[color];

    //now find out if they are unprotected
    var unprotected = [];
    var found = false;
    //var AC = getSeenSquares(color);  //attack counts
    

    L("Attack squares, Seens quares:");
    L(attackedSquares);
    L(SS);

    var square1;
    for(square1 in attackedSquares){
      if(!SS[square1]){   //if none of our pieces can see this square
        unprotected.push(square1);
      }
    }

  //L(unprotected);
  return unprotected;
}

function unequalAttacked(color){
    // if a pawn is attacking a knight, it doesn't matter if its protected.  Its still gonna take it.
    var unequal = [];
    var AS = _CACHE.attackedSquares[color];  //attacked squares
    for(square in AS){

        var attackedPiece = getPieceAt(square);
        loss = getCost(attackedPiece);
        var attackingPieces = AS[square];  //usually just one
        for(attackingPiece in attackingPieces){
            gain = getCost(attackingPiece);
            if(loss>gain){
                unequal.push(square);
                break;  //dont count it twice if it is attacked by two things
            }
        }

    }
    return unequal;

}

function getCost(piece){

    //L(typeof piece);
    if(typeof piece === 'object'){
        piece = piece.type;
    }

    if(piece == 'p') return 1;
    if(piece == 'n') return 3;
    if(piece == 'b') return 3;
    if(piece == 'r') return 5;
    if(piece == 'q') return 9;


}


/*
function checkStrategies(move) { //loops through all data in strategies array, executes each function name, and success/fail code/messages
    var i, strat;
    var slen = strategiesToCheck.length;
    for (i = 0; i < slen; i++) {
        strat = strategiesToCheck[i];
        //L(strat.name);
        //create a function variable to execute the string
        eval("func = " + strat.name + "; ");
        var result = func(move); //execute the function
        if (result) { //if true
            if (strat.successMsg) {
                printToAvatar(strat.successMsg,PAWN);
            }
            if (strat.successCode) {
                //execute the code
                L(strat.successCode);
                eval("func = function $$(){" + strat.successCode + "}");
                //L(func);
                func();
            }
        } else {
            if (strat.failMsg) {
                printToAvatar(strat.failMsg,KNIGHT);
            }
            if (strat.failCode) {
                //execute the code
                //L(strat.failCode);
                eval("func = function $$(){" + strat.failCode + "}");
                //L(func);
                func();
            }
        }
    }
}
*/



function isControlCenter(...args) {  //checks to see if move controlled the center
    // L("dosmovecontrolcenter");
    // L(args);
    // L(arguments);  //https://stackoverflow.com/questions/2141520/javascript-variable-number-of-arguments-to-function
    var move = args[0];
    var to = move.to;
    var p = move.piece;
    //L(to);
    if (p == "p") { //just check if the 'to' position is on or next to the center (we can't test valid moves because that changes depending on opponent location
        //L(to.charAt(0)+","+to.charAt(1));        
        var match1 = "cdef".indexOf(to.charAt(0)) >= 0;
        var match2 = "34".indexOf(to.charAt(1)) >= 0;
        var match3 = to == "d5";
        var match4 = to == "e5";
        //L(match1)
        //L(match2)
        if ((match1 && match2) || match3 || match4) {
            //L("pawn controls center");
            return true;
        }
    } else { //k,q,r,b,n
        //create an empty board with one piece on it and evaluate all its moves
        var emptyGame = new Chess();
        emptyGame.clear();
        emptyGame.put({ type: p, color: move.color }, to); //put a single piece on it
        //L(emptyGame.ascii());
        var moves2 = emptyGame.moves({
            square: to,
            verbose: true //verbose means separate the move from the piece - otherwise it has the starting piece and maybe promotion value?
        });
        //L(moves2);
        //separate all moves out of moves2
        var moves3 = [];
        var i;
        var mlen = moves2.length;
        for (i = 0; i < mlen; i++) {
            moves3.push(moves2[i].to);
        }
        //see if any of those moves attack the center squares
        //L(moves3);
        //https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript
        var centerSquares = ['d4', 'd5', 'e4', 'e5'];
        var isMatch = centerSquares.some(fruit => moves3.includes(fruit)) ||  centerSquares.indexOf(to) >= 0;  //its either moving to or in a center square
        //L(isMatch);
        return isMatch
    }
    return false;
}

function isKnightBishopOut(...args) {
    var move = args[0];
    var to = move.to;
    var from = move.from;
    var piece = move.piece;
    //L("to:"+to+" from:"+ from +" piece:"+piece);
    var match1 = from.charAt(1) == "1";  //starting from the first row
    var match2 = "nb".indexOf(piece) >= 0;  //is it a knight or bishop
    var match3 = to.charAt(1) != "1"; //make sure they're not going back to the start
    if (match2 && !match3) {
        _curHints.push("You shouldn't be moving to your back row unless you absoutely have to.");
        _curHints.push("You spent a move to move forward, and now you spent a move to move it backwards?  That sounds like wasted moves to me...");
    }
    //L("isKnightBishopOut:"+match1+","+match2);
    if (match1 && match2 && match3) {
        return true;
    }
    return false;
}

function isKnightsBishopsOut(...args) {
    var x, y, square;
    var pos = game.board();
    for (x = 0; x < 8; x++) {
        square = pos[7][x]; //just check the bottom row 
        if (!square) continue; //empty space
        if ("nb".indexOf(square.type) >= 0 && square.color == 'w') { //we found a night or bishup
            return false;
        }
    };
    //no N or B found on last rank
    return true;
}

function isCastle(move){
    //L(move);
    if('kq'.indexOf(move.flags) >=0){

        return true;
    }
    
    return false;
}


function getMoves(color) {
    if (color == game.turn()) {
        return game.moves({ verbose: true });
    } else { ////unbelievebly there's no way to get the opponents moves in chess.js so I rolled my own
        var gameCopy = getFlippedGame();
        var moves = gameCopy.moves({ verbose: true });
        return flipMoves(moves);
    }
}

function getFlippedGame() {
    //unbelieveably just changing the 'turn' in the FEN doesn't work, chess.js detects its invalid
    //so I instead turn all white pieces to black, black to white, and flip positions.  THEN we can apply moves().  The only problem is it returns moves from whites perspective!  Lol  so I have to flip those back
    var fen = game.fen();
    var tokens = fen.split(' ');
    var firstStr = tokens[0];
    //var reversed = firstStr.split('').reverse().join('');  //https://stackoverflow.com/questions/958908/how-do-you-reverse-a-string-in-place-in-javascript
    //L(firstStr);
    var cs = firstStr.split(''); //  separate it into characters in an array
    var i;
    var clen = cs.length;
    var c;
    //change black to white, white to black.
    for (i = 0; i < clen; i++) {
        c = cs[i];
        if (c == c.toUpperCase()) { //if changing the case did nothing then apply the other case
            cs[i] = c.toLowerCase();
        } else {
            cs[i] = c.toUpperCase();
        }
    }
    //L(cs.join(''));
    //now reverse the string
    tokens[0] = cs.reverse().join('');
    var newFen = tokens.join(' ');
    var gameCopy = new Chess(newFen);
    //L(newFen);
    //L(gameCopy.ascii());
    //L(gameCopy.moves({verbose:true}));
    return gameCopy;
}

function flipMoves(moves) {
    var i, mlen = moves.length;
    var move;
    var to, from;
    for (i = 0; i < mlen; i++) {
        move = moves[i];
        to = move.to;
        from = move.from;
        move.to = flipSquare(to);
        move.from = flipSquare(from);
        move.color = oppColor(move.color); //flip color
        moves[i] = move;
    }
    return moves;
}

function flipSquare(square) {
    // var letters = 'abcdefgh';
    // var letter = square.charAt(0);
    // var num = square.charAt(1);
    // var index = letters.indexOf(letter);
    var letters = 'abcdefgh';
    var xy = sq2xy(square);
    var index = (7 - xy.x);
    var letter = letters.charAt(index);
    var num = xy.y + 1; //Math assumes base 0 , chessboards do not
    var newsquare = letter + num;
    //L("old:"+ square+ " newsquare:"+newsquare);
    return newsquare;
}

function sq2xy(square) {
    //turns a square string into its x,y coordinates (0 based)
    var letters = 'abcdefgh';
    var letter = square.charAt(0);
    var x = letters.indexOf(letter);
    var y = 7 - (square.charAt(1) - 1);
    return { x: x, y: y };
}

function xy2sq(xy) { //takes in zero-based {x:x, y:y} and spits out a 2 char string
    var letters = 'abcdefgh';
    var letter = letters.charAt(xy.x);
    var num = (7 - xy.y) + 1;
    return letter + num;
}

function getPieceAt(square) { //possibly same as SEG.board()
    var s = game.get(square);
    return s;
}

function oppColor(color) { //gets the opposite color
    if (color == 'w') return 'b';
    if (color == 'white') return 'black';
    if (color == 'b') return 'w';
    if (color == "black") return "white";
}




function getSeenSquares(color) {
    //gets the squares that are seen by all pieces
    //inneficient - i could return it for ALL colors at once
    
    //L("getSeenSquares().  color:" + color);
    var attackCounts = {};
    var attacks_from = {};
    var xy;
    var sq;
    var pos = SEG.parseFEN(game.fen());  //load up the SEG interal board
    
    for (x = 0; x < 8; x++) for (y = 0; y < 8; y++) {  //loop through all squares
            xy = { x: x, y: y };
            sq = xy2sq(xy);  //turn into string
            attacks_from = attack_from(pos, xy, color);  //get all attacks on that square, by what, from where
            //dont add if theres no attacks on that square
            if (Object.keys(attacks_from).length > 0) { //https://stackoverflow.com/questions/3337367/checking-length-of-dictionary-object
                attackCounts[sq] = attacks_from;  //store them for all squares
            }
        }

    return attackCounts;
}

function attack_from(pos, square, color) { //rewriting SEG.attack to include locations of attack
    var squares;
    var froms = {};
    squares = pawn_attack_from(pos, square, color);
    if (squares.length > 0) froms["p"] = squares;
    squares = king_attack_from(pos, square, color);
    if (squares.length > 0) froms["k"] = squares;
    squares = knight_attack_from(pos, square, color);
    if (squares.length > 0) froms["n"] = squares;
    squares = bishop_xray_attack_from(pos, square, color);
    if (squares.length > 0) froms["b"] = squares;
    squares = rook_xray_attack_from(pos, square, color);
    if (squares.length > 0) froms["r"] = squares;
    squares = queen_attack_from(pos, square, color);
    if (squares.length > 0) froms["q"] = squares;
    return froms;
}

function pawn_attack_from(pos, square,color) { //rewriting SEG.pawn_attack to include locations of attack
    //if (square == null) return sum(pos, pawn_attack);
    var x1, y1;
    var froms = [];
    x1 = square.x - 1;
    y1 = square.y + 1;
    var piece = 'P';
    if(color == 'b'){
       piece = 'p';
        y1 = square.y - 1;
     }
    if (SEG.board(pos, x1, y1) == piece) {
        
          froms.push(xy2sq({ x: x1, y: y1 }));
        
    }
    x1 = square.x + 1;
    if (SEG.board(pos, x1, y1) == piece) {
        
          froms.push(xy2sq({ x: x1, y: y1 }));
        
    }
    return froms;
}

function king_attack_from(pos, square,color) { //rewriting SEG.king_attack to include locations of attack
    //if (square == null) return sum(pos, king_attack);
    var x1, y1;
    var froms = [];
    var piece = 'K';
    if(color == 'b') piece = 'k';
    for (var i = 0; i < 8; i++) {
        var ix = (i + (i > 3)) % 3 - 1;
        var iy = (((i + (i > 3)) / 3) << 0) - 1;
        x1 = square.x + ix;
        y1 = square.y + iy;
        if (SEG.board(pos, x1, y1) == piece) {
            
              froms.push(xy2sq({ x: x1, y: y1 }));
            
        }
    }
    return froms;
}

function knight_attack_from(pos, square,color) { //rewriting SEG.knight_attack to include locations of attack
    //if (square == null) return sum(pos, knight_attack);
    var froms = [];
    var x1, y1;
    var piece = 'N';
    if(color == 'b') piece = 'n';
    for (var i = 0; i < 8; i++) {
        var ix = ((i > 3) + 1) * (((i % 4) > 1) * 2 - 1);
        var iy = (2 - (i > 3)) * ((i % 2 == 0) * 2 - 1);
        x1 = square.x + ix;
        y1 = square.y + iy;
        var b = SEG.board(pos, x1, y1);
        if (b == piece) {
            
              froms.push(xy2sq({ x: x1, y: y1 }));
            
        }
    }
    return froms;
}

function bishop_xray_attack_from(pos, square, color) { //rewriting SEG.attack to include locations of attack
    //  if (square == null) return sum(pos, bishop_xray_attack);
    var froms = [];
    var x1, y1;
    var piece = 'B';
    if(color == 'b') piece = 'b';
    for (var i = 0; i < 4; i++) {
        var ix = ((i > 1) * 2 - 1);
        var iy = ((i % 2 == 0) * 2 - 1);
        for (var d = 1; d < 8; d++) {
            x1 = square.x + d * ix;
            y1 = square.y + d * iy;
            var b = SEG.board(pos, x1, y1);
            if (b == piece) {
                var dir = $pinned_direction(pos, { x: x1, y: y1 });
                if (dir == 0 || Math.abs(ix + iy * 3) == dir) {
                    
                      froms.push(xy2sq({ x: x1, y: y1 }));
                    
                }
            }
            if (b != "-" && b != "Q" && b != "q") break;
        }
    }
    return froms;
}

function rook_xray_attack_from(pos, square, color) { //rewriting SEG.attack to include locations of attack
    //if (square == null) return sum(pos, rook_xray_attack);
    var froms = [];
    var x1, y1;
    var piece = 'R';
    if(color == 'b') piece = 'r';
    for (var i = 0; i < 4; i++) {
        var ix = (i == 0 ? -1 : i == 1 ? 1 : 0);
        var iy = (i == 2 ? -1 : i == 3 ? 1 : 0);
        for (var d = 1; d < 8; d++) {
            x1 = square.x + d * ix;
            y1 = square.y + d * iy;
            var b = SEG.board(pos, x1, y1);
            if (b == piece) {
                var dir = $pinned_direction(pos, { x: x1, y: y1 });
                if (dir == 0 || Math.abs(ix + iy * 3) == dir) {
                      froms.push(xy2sq({ x: x1, y: y1 }));
                };
            }
            if (b != "-" && b != "R" && b != "Q" && b != "q") break;
        }
    }
    return froms;
}

function queen_attack_from(pos, square, color) { //rewriting SEG.attack to include locations of attack
    // if (square == null) return sum(pos, queen_attack);  //?
    var froms = [];
    var x1, y1;
    var piece = 'Q';
    if(color == 'b') piece = 'q';
    for (var i = 0; i < 8; i++) {
        var ix = (i + (i > 3)) % 3 - 1;
        var iy = (((i + (i > 3)) / 3) << 0) - 1;
        for (var d = 1; d < 8; d++) {
            x1 = square.x + d * ix;
            y1 = square.y + d * iy;
            var b = SEG.board(pos, x1, y1);
            if (b == piece) {
                var dir = $pinned_direction(pos, { x: x1, y: y1 });
                if (dir == 0 || Math.abs(ix + iy * 3) == dir) {
                    
                        froms.push(xy2sq({ x: x1, y: y1 }));
                    
                }
            }
            if (b != "-") break;
        }
    }
    return froms;
}

function getPiecesAt(color){
//returns dictionary of all pieces and their locations
  var piecesAt = {};
  var sq;
  var piece;
  var x,y;
  for(x=0;x<8;x++) for(y=0;y<8;y++){  //loop through all squares
    sq = xy2sq({x:x,y:y});  //turn xy coords into square
    piece = getPieceAt(sq);  //get the piece at
    if(piece){  //if there is a pice there
      if(!color || color == piece.color){  //if color was passed in then use it, else include everything
        piecesAt[sq] = piece;  //store all pieces at what square they were ate
      }
    }
  }
  return piecesAt;
}

function getAttackedSquares(color){

  var PA = getPiecesAt(color);  //Pieces At  //get location of all pieces
  //var Battacks = getSeenSquares(oppColor(color));   //get all opponents attacks
  var Battacks = _CACHE.seenSquares[oppColor(color)];

  //see if the same square exists in both lists
  var attacked = [];
  var square1,square2;
  for(square1 in PA){

    //for(square2 in Battacks){
      //if(square1 == square2){  //a piece exists at a square, and the opponent can attack that square
        //attacked.push(Battacks[square1]);  //therefore save it as attacked  
        //}


      if(Battacks[square1]){
        
        attacked[square1] = Battacks[square1];//save what is attacking it too
      }
    
  }
  //L(attacked);
  return attacked;
}

function welcomeScript(){
    printToAvatar(["Welcome!  You are in the beginning, or opening, of the game.",PAWN]);
    printToAvatar(["Your mission is to control the center of the board.",KING]);
    printToAvatar(["Press 'Hint' at any time to see more hints.",PAWN]);
    _curHints.push("Those four squares in the middle of the board are the center.");
    _curHints.push("Move your pawns into or near the center.");
    _curHints.push("Then get your knights and bishops out.");
    _curHints.push("Then you should castle.");
    _curHints.push("After you do all that, you are in the middle of the game, or mid-game.");
    _curHints.push("Go on.  Give it a try.  Move a pawn into the center.");

}


//https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
var keys = {37: 1, 38: 1, 39: 1, 40: 1};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}
//http://detectmobilebrowsers.com/
(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

// function disableScroll() {
//   if (window.addEventListener) // older FF
//       window.addEventListener('DOMMouseScroll', preventDefault, false);
//   document.addEventListener('wheel', preventDefault, {passive: false}); // Disable scrolling in Chrome
//   window.onwheel = preventDefault; // modern standard
//   window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
//   window.ontouchmove  = preventDefault; // mobile
//   document.onkeydown  = preventDefaultForScrollKeys;
// }

// function enableScroll() {
//     if (window.removeEventListener)
//         window.removeEventListener('DOMMouseScroll', preventDefault, false);
//     document.removeEventListener('wheel', preventDefault, {passive: false}); // Enable scrolling in Chrome
//     window.onmousewheel = document.onmousewheel = null; 
//     window.onwheel = null; 
//     window.ontouchmove = null;  
//     document.onkeydown = null;  
// }


// #################################### END FUNCTIONS ##########################################

const BEGINNING = 0;
const OPENING = 0;
const MIDDLE = 1;
const END = 2;


const COMPUTERDELAY = 1000; //1000 = 1 second
const origDragStart = onDragStart;  //for when we disable dragging pieces
_difficulty = 0;  //master difficulty for computer.  custom.  range 0-5
_confirmMoves = false; //bypass the confirm button
_confirmMoves = true;
L = console.log;  //i got sick of typing console.log
_curSFscore = 0.00;  //SF evaluation of board
_tutorOutput = []; //see //https://stackoverflow.com/questions/18393981/append-vs-html-vs-innerhtml-performance
_isUnderAttack = false;
ratings = {best:[],good:[],neutral:[],bad:[],losing:[]};  //rate each move as good, bad, losing, etc
_begMidEndGame = BEGINNING;
_curHints = [];
_hintsViewed = [];
_numBestMoves = 6-_difficulty; //difficulty 1 takes the 5th best move, difficulty 2 takes the 4rd best,3 = 3nd best, etc
_engineOutput = [] //  must read     //https://stackoverflow.com/questions/18393981/append-vs-html-vs-innerhtml-performance
_CACHE = {};  //stores things like moves, underattack, other large data.  Changes every move.

//  L(game.ascii()); //this is way better than stockfish 'd'  
//  // stockfish.postMessage('go movetime 10');
// //send startup script
//stockfish.onMessage = printToEngineoutput;
var stockfish = new Worker('js/stockfish.js'); //load the stockfish engine
var _SMworker = new Worker('js/stockfish.js'); //Score Moves worker - a separate instance of stockfish 
stockfish.onMessage = onSFMessage; //the default - printToOutput to engine output
stockfish.postMessage('uci');
stockfish.postMessage('isready');
_SMworker.postMessage('uci');
_SMworker.postMessage('isready');
stockfish.postMessage('setoption name MultiPV value '+_numBestMoves);
stockfish.postMessage('ucinewgame');
stockfish.postMessage('position fen N7/P3pk1p/3p2p1/r4p2/8/4b2B/4P1KP/1R6 w - - 0 34'); //an example
stockfish.postMessage('d');
stockfish.postMessage('eval'); // see https://hxim.github.io/Stockfish-Evaluation-Guide/
//  // stockfish.postMessage('quit');
var game = new Chess();


var _whiteComputer, _blackComputer;

// _whiteComputer = true;
// _blackComputer = true;
_whiteComputer = false;
_blackComputer = true;
// _highlightUnderAttack = true;
// _highlightCanAttack = false;
_waitingForConfirm = false;

//set checkbox values
$('#blackComputer').prop('checked', _blackComputer);
$('#whiteComputer').prop('checked', _whiteComputer);
$('#highlightUnderAttack').prop('checked', true);
$('#highlightCanAttack').prop('checked', true);
$('#confirmMoves').prop('checked', _confirmMoves);
//setTimer
//var myTimer = setInterval(mainLoop, 1000);
// var disableundoConfirmMoves = true;
//$(".scrollBarOnLeft").wrap("<div class='scroll'></div>");
_chessboardEl = $('#chessboard'); //chessboardElement  .
var plies = 0; //keep track of number of plies (half moves) in the game
var _gameHistory = { FEN: [], moves: [] }; //stores each chessboard position and move as a complete FEN
_gameHistory.FEN.push(game.fen());
//L(_gameHistory.FEN);
// var w = $('#board').find('.square-a1').width();
// $('.hl:before').width(w);
// _chessboardEl.find('.square-a1').addClass('hl');
var cfg = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    //onMoveEnd: onMoveEnd,  //only works for computer moves
    onSnapEnd: onSnapEnd,
    showErrors: 'alert'
};
var chessboard = new ChessBoard('chessboard', cfg);
$(window).resize(chessboard.resize);  //https://codepen.io/willangles/pen/JdByo
//  L(chessboard.position());
//scoreMoves(game.moves(), scoreMovesCallback);
// var scrollTop     = $(window).scrollTop(),
//   elementOffset = $('#optionsDiv').offset().top,
//   distance      = (elementOffset - scrollTop);
// L("distance:"+distance);
// L("winHeight:"+ $(window).height());
// L(game.SQUARES);
// L(game.ascii());
// L(game.board());
// var tacticsToCheck = []; //stores the names of the functions we want to execute 
// var strategiesToCheck = []; //what's a strategy, what's a tactic?  Eh, whatever.
// //strategiesToCheck.push({ name: "isKnightsBishopsOut", successMsg: "Great job!  You got all your knights and bishops out!", successCode: "", failCode: "_curHints.push('You need to get your knights and bishops out.');" });
// strategiesToCheck.push({ name: "isControlCenter", successMsg: "Great job!  This move controls the center!", successCode: "", failCode: "_curHints.push('This move does not help control the center.');" });
// strategiesToCheck.push({ name: "isKnightBishopOut", successMsg: "Great job!  Keep getting your knights and bishops out." });
// //  strategiesToCheck.push( {name:"underAttack"});
// //get height from top 
// //curScore(curSFscoreCallback);  //score is set globally
// getSeenSquares('b');


var pos = SEG.parseFEN(game.fen());
pos = SEG.colorflip(pos);
//L(pos.b);

function sqtest(x,y){
  
  xy = {x:x,y:y};
  sq = xy2sq(xy);
  L(x+","+y+": "+sq);
  L(pos.b[x][y]);
  xy = sq2xy(sq);
  L("reversed:"+xy.x+","+xy.y);
  sq1 = flipSquare(sq);
  L("flipped:"+sq1);
  L(" ");
}

// sqtest(3,0);
// sqtest(4,7);
// sqtest(5,7);
// sqtest(6,7);


// getSeenSquares('w');
// getSeenSquares('b');

undoConfirmMovesOff();
welcomeScript();
getAdvice();

