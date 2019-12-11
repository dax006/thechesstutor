//stockfish eval parsed for thechesstutor



////////////// global functions
    function showBoard() {
        var showindex = 0;
        //var pos = parseFEN(document.getElementById('fen').innerHTML);

  
        var elem = document.getElementById('chessboard1');
        while (elem.firstChild) elem.removeChild(elem.firstChild);
        
        for (var x = 0; x < 8; x++)
            for (var y = 0; y < 8; y++) {
                var div = document.createElement('div');
                div.style.left = x * 28 + "px";
                div.style.top = y * 28 + "px";
                div.className = ((x + y) % 2 ? "d" : "l");
                
                div.className += " " + pos.b[x][y];
                var sqeval = 0,
                    sqevalblack = 0;
                if (data[showindex].squares || data[showindex].highlight > 0) {
                    try {
                        sqeval = func(pos, { x: x, y: y });
                        if (data[showindex].forwhite) sqevalblack = func(colorflip(pos), { x: x, y: 7 - y });
                    } catch (e) {}
                }
     
                elem.appendChild(div);
            
            }
       
    }




//////////////////////////////////////////////////////////// data /////////////////////////////////////////////////////////////////////////////////
var data = [], curindex = null;
data.push({"name":"Main evaluation","group":"","text":"<b>$</b>. An evaluation function is used to heuristically determine the relative value of a positions used in general case when no specialized evaluation or tablebase evaluation is available. In Stockfish it is never applied for positions where king of either side is in check. Resulting value is computed by combining [[Middle game evaluation]] and [[End game evaluation]]. We use <a class=\"external\" href=\"https://www.chessprogramming.org/Tapered_Eval\">Tapered Eval</a>, a technique used in evaluation to make a smooth transition between the phases of the game. [[Phase]] is a coeficient of simple linear combination. Before using  [[End game evaluation]] in this formula we also scale it down using [[Scale factor]].","code":"function $$(pos) {\n  var mg = $middle_game_evaluation(pos);\n  var eg = $end_game_evaluation(pos);\n  var p = $phase(pos), t = $tempo(pos);\n  eg = eg * $scale_factor(pos, eg) / 64;\n  return ((((mg * p + eg * (128 - p)) << 0) / 128) << 0) + t;\n}","links":[["https://www.chessprogramming.org/Evaluation","Evaluation in cpw"],["https://www.chessprogramming.org/Tapered_Eval","Tapered Eval in cpw"],["https://www.chessprogramming.org/Game_Phases","Game Phases in cpw"],["https://www.chessprogramming.org/Tempo","Tempo in cpw"]],"eval":true,"squares":0,"highlight":0,"forwhite":false});



/////////////////////////////////// main /////////////////////////////////////////

pos = {// chessboard
       b: [["-","-","-","-","-","-","P","R"],
           ["r","-","-","-","-","-","-","-"],
           ["-","p","b","n","-","Q","-","-"],
           ["q","-","p","N","-","B","P","-"],
           ["r","b","p","-","-","P","-","-"],
           ["-","n","p","-","-","N","P","R"],
           ["-","-","-","p","-","B","P","K"],
           ["k","p","-","-","-","-","P","-"]],

       // castling rights
       c: [true,true,false,false],

       // enpassant
       e: false,

       // side to move
       w: true,

       // move counts
       m: [0,10]}

   showBoard();