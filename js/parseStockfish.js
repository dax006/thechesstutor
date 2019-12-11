//GLOBALS
var _allSFoutput = [];

var _callbackHandler; //stores function name for callback for getBestMoves

var _moves = [];  // a generic global to save values between message handlers
var _scores = {};  //make global
var _movesCounter = 0;
var _gameCopy = new Chess();  //for scoring moves



//################################################################## functions start #################################################################################//


var onSFMessage = function(event){
   printToEngineoutput(event.data);
}



function printToEngineoutput(str){
    
    var eo = document.getElementById("engineoutput");
    if(eo){
        //document.getElementById("engineoutput").innerHTML += "<pre>" + str + "</pre>"; //pre is there so the 'd' command (draw board) appears properly 
        _engineOutput.push("<pre>"+str+"</pre>");
        eo.innerHTML = _engineOutput.join('');//https://stackoverflow.com/questions/18393981/append-vs-html-vs-innerhtml-performance
        //https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div?rq=1
        eo.scrollTop = eo.scrollHeight;  //always scroll to bottom
    }
}


////////////////////////////////////////// get best moves /////////////////////////////////////////////

function getBestMoves(handler) { //handler is the function that is called to return the best moves
    
    stockfish.onmessage = bestMovesOnmessage;
    _callbackHandler = function(input) { //sends control back to the main page, using the name of the function the user passed in
        handler(input);
    }
    var fen = game.fen();
    stockfish.postMessage('position fen ' + fen); //set board for stockfish to analyse
    stockfish.postMessage('go depth ' + _difficulty);
    printToEngineoutput('position fen ' + fen);
    printToEngineoutput('go depth ' + _difficulty); //EDIT as necessary    

}
 
var bestMovesOnmessage = function(event) { //the message handler
    //console.log(event.data);
    printToEngineoutput("<i>"+event.data+"</i>");
    var bestMoves = getBestMovesCont(event.data);
    if (bestMoves != undefined) { //remember, it only spits out the best moves at the END of the analysis
        
        _callbackHandler(bestMoves);
    }
};

function getBestMovesCont(str) { //stores all stockfish data, when the final line (bestmove) is found, start the analysis
    _allSFoutput.push(str); //store everything
    var words = str.split(" ");
    var bestmoves;
    //analysis complete, get top moves, clear data structures
    if (words[0] == 'bestmove') { //doesnt always work.  Results come back asyncronously with other searches!  make sure not to run multiple searches at the same time
        if (_numBestMoves == 1) {
            bestmoves = [words[1]];
        } else {
            bestmoves = parseMoves(_allSFoutput);
            if(bestmoves.length == 0){  //for initial moves (book?) stockfish doesn't do analysis, just spits out best move, and parseMoves() wont work.
                bestmoves = [words[1]];
            }
            bestmoves.reverse(); //from best to worst
        }
        _allSFoutput = []; //empty array
        //bestmoves = s2cbjs(bestmoves);
    }
    return bestmoves;
}

function parseMoves(_allSFoutput) { //loop backwards through _allSFoutput to find best numMoves moves
    var i, j, line;
    var bestmoves = []; //initialize array;
    var bestlines = topMoves(_allSFoutput);
    var blen = bestlines.length;
    //parse the bestlines to find the best moves
    //bestlines.forEach(function(line) { //search best lines for the best single move
    for(i = 0; i < blen; i++){
        line = bestlines[i];
        if(line == undefined) {
            continue;
        }
        words = line.split(" ");
        var index = words.indexOf('pv'); //find the keyword pv.
        var bestmove = words[index + 1];
        bestmoves.push(bestmove); //add it to our array
    };
    return bestmoves; //these are ordered worst to best
}



function topMoves(_allSFoutput) { //get the top X moves, X = numMoves
    var bestlines = []; //initialize array;
    var alen = _allSFoutput.length;
    for (i = alen - 1; i > -1; i--) { //loop backwards
        line = _allSFoutput[i]; //get a single line
        if (line == null) continue; //happens sometimes, not sure why.  Just skip it
        words = line.split(" "); //get words in the line
        if (words[1] == "depth") { //look for 'info depth'
            //get numMoves lines of engine output
            for (j = 0; j < _numBestMoves; j++) {
                bestlines.push(_allSFoutput[i - j]); //add line to array
            }
            break; //exit loop
        }
    }
    return bestlines;
}


// function s2cbjs(bestmoves) { //converts from Stockfish To ChessBoardJS notation (it adds a - )
//     var cbjs = [];
//     bestmoves.forEach(function(move) {
//         var index = move.search(/\d/); //https://stackoverflow.com/questions/15682434/how-to-get-index-of-the-first-digit-in-string
//         var newmove = move.substring(0, index + 1) + "-" + move.substring(index + 1);
//         cbjs.push(newmove);
//     });
//     return cbjs;
// }

///////////////////////////////////////////////// score all moves /////////////////////////////////////////////////////


function scoreMoves(moves,handler){  //get the score of every move (depth 1);
    _moves = moves; //make it global for matching in the messageHandler
    _callbackHandler = handler;
    _SMworker.onmessage = scoreMovesOnmessage;
    _scores=[];  //reset scores
    _movesCounter = 0;
    requestScore(moves[_movesCounter]);  //only call once... the remaining calls are in the message handler, because there is no way to link the move we want to evaluate with the score.
    // scoreG = scoreGen(moves);  //the generator object, gets next value by calling .next();
    // scoreG.next(); //this should be enough to trigger the loop between requestScore and scoreOnmessage
    _SMworker.postMessage('setoption name MultiPV value 1');  //just search one, the best solution
    printToEngineoutput('setoption name MultiPV value 1');  //just search one, the best solution
    
}


//send the request to the engine.
function requestScore(move){
    try{
        printToEngineoutput("scoring move:" +(move.from +move.to));
    }catch(e){
        L("error.  move:");
        L(move);
        e.stack();
    }
        var fen = move2fen(move);

        _SMworker.postMessage('position fen ' + fen); //set board for stockfish to analyse
        _SMworker.postMessage('go depth 1'); //Search what the opponent would do - just one move ahead
        //console.log(game.ascii());
        _gameCopy.undo();

}

function move2fen(move){
    var fen = game.fen();
    _gameCopy.load(game.fen());  
    _gameCopy.move(move);  //accepts many formats
    fen = _gameCopy.fen();
    return fen;
}

var scoreMovesOnmessage = function(event){  //this recieves the scores *one at a time*, then calls 'request score' to get the next one
    var move,score;
    var line = event.data;
    printToEngineoutput(line);
    _allSFoutput.push(line);

    var words = line.split(" ");

    if(words[0] == "bestmove") {  //analysis is complete

        score = parseScore(_allSFoutput);
        _allSFoutput = [];  //clear it
        try{

            move = _moves[_movesCounter].from + _moves[_movesCounter].to;
        }catch(e){
            L("ERROR in scoring moves");
            console.log("movescounter:"+_movesCounter);
            console.log(_moves);
            L(_scores);
            L(e.stack);

        }
        // L(_moves);
        // L(_movesCounter);

        _scores[move] = score;


        _movesCounter++;
        if(_movesCounter >= _moves.length){  //we have all the scores we need

            _callbackHandler(_scores);

        }else{
            //get more scores
            //scoreG.next();  //this way does it without a recursive loop
            
            move = _moves[_movesCounter];  //get next move
            requestScore(move);  //evaluate it
        }
    }
}
function parseScore(_allSFoutput){
    //go back 2 lines
    var score;
    var line = _allSFoutput[_allSFoutput.length - 3];
    _allSFoutput = [];  // we only needed one line.  clear the array.
    printToEngineoutput("<br>");
    
    //console.log(line);
    words = line.split(" ");
    //var index = words.indexOf('cp'); //find the keyword pv.
    var index = words.indexOf('score'); //'cp' doesn't appear if its a mate move
    var cp = words[index + 1];
    if( cp == 'cp'){  //score is in centipawns
        score = words[index + 2];
        score = -Number(score).toFixed(2);  ////the scores are for black, because black moved last
    }else if (cp == 'mate'){
        score = 'mate';  //should i say mate or a bit negative number?
    }
    
    // if(score == 'mate'){
    //     score = -99999;  //just some really low number
    // }else{
    //     score = -Number(score).toFixed(2);  //the scores are for black, because black moved last  So i negate them and turn into decimals  //cannot turn into numbers, sometimes the score is 'mate'
    // }
return score;
}

