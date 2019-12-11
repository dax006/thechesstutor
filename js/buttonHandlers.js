



//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& button handlers &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&//



//start new game

$('#startBtn').on('click', function(){



  board.start();//reset board



  //reset history

  plies = 0;

  gameHistory.FEN.length = 1

  gameHistory.moves.length = 0;



  //clear internal representation

  game.reset();



  //remove highlights

  boardEl.find('.square-55d63').removeClass('highlight-white');  //remove all previous highlights

  boardEl.find('.square-55d63').removeClass('highlight-black');  //remove all previous highlights







});





//$('#clearBtn').on('click', board.clear);





// If Next button clicked, move forward one



  $('#nextBtn').on('click', function() {

    

    plies += 1;

    if (plies >= gameHistory.FEN.length) {

      plies = gameHistory.FEN.length-1;

    }

    board.position(gameHistory.FEN[plies]);

    game.load(gameHistory.FEN[plies]);  //set the internal engine

    

  });



  // 4. If Prev button clicked, move backward one

  $('#prevBtn').on('click', function() {

    

    //game.undo();  //needed to set whose move it is?

    console.log(plies);

    console.log(gameHistory);

    

    plies -= 1;

    if (plies < 0) {

      plies = 0;

    }



    board.position(gameHistory.FEN[plies]);  //set the graphics

    game.load(gameHistory.FEN[plies]);  //set the internal engine

    

  });



 // 5. If Start button clicked, go to start position

  $('#beginningBtn').on('click', function() {

    board.position(gameHistory.FEN[0]);

    game.load(gameHistory.FEN[plies]);  //set the internal engine

    //board.start();

    plies = 0;

  });



  // 6. If End button clicked, go to end position

  $('#endBtn').on('click', function() {

    board.position(gameHistory.FEN[gameHistory.FEN.length -1]);

    game.load(gameHistory.FEN[plies]);  //set the internal engine

    plies = gameHistory.FEN.length-1;

  });



  $('#toggleEngineOutput').on('click', function() {

    console.log("Toggle clicked!");

    $( "#engineoutput" ).toggle();  //hide/show the div



  });





  $('#doMove').on('click', function() {

    getBestMoves(callbackFunction);  //must pass in the name of a function that will be the callback when moves are available

  });



  $('#whiteComputer').on('click', function() {

    console.log("White clicked");

    whiteComputer = !whiteComputer ;   //toggle it

  });

  $('#blackComputer').on('click', function() {

    console.log("black clicked");

    blackComputer = !blackComputer ;   //toggle it

  });





// //load a game with history

// //http://sam-koblenski.blogspot.com/2017/06/a-barely-adequate-guide-to-displaying.html

//   // 1. Load a PGN into the game

//   var pgn = '1.e4 e5 2.Nf3 Nf6 3.Nc3 d5 4.exd5 Nxd5 5.Bc4 Nf4 6.O-O e4 7.Re1 Kd7 8.Rxe4 Qg5 9.Nxg5 f6 10.Qg4+ Ne6 11.Qxe6+ Kd8 12.Qe8#  1-0';

//   game.load_pgn(pgn);

//   $('#pgn5').html(pgn);



//   // 2. Get the full move history

//   var history = game.history();

//   game.reset();

//   var i = 0;



//   // 3. If Next button clicked, move forward one

//   $('#nextBtn5').on('click', function() {

//     game.move(history[i]);

//     board.position(game.fen());

//     i += 1;

//     if (i > history.length) {

//       i = history.length;

//     }

//   });



//   // 4. If Prev button clicked, move backward one

//   $('#prevBtn5').on('click', function() {

//     game.undo();

//     board.position(game.fen());

//     i -= 1;

//     if (i < 0) {

//       i = 0;

//     }

//   });



//  // 5. If Start button clicked, go to start position

//   $('#startPositionBtn5').on('click', function() {

//     game.reset();

//     board.start();

//     i = 0;

//   });



//   // 6. If End button clicked, go to end position

//   $('#endPositionBtn5').on('click', function() {

//     game.load_pgn(pgn);

//     board.position(game.fen());

//     i = history.length;

//   });



