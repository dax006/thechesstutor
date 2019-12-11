//stockfish eval code. parsed/ported for thechesstutor
//https://hxim.github.io/Stockfish-Evaluation-Guide/

SEG.showboard = function() {
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
            if (SEG.data[showindex].squares || SEG.data[showindex].highlight > 0) {
                try {
                    sqeval = func(pos, { x: x, y: y });
                    if (SEG.data[showindex].forwhite) sqevalblack = func(colorflip(pos), { x: x, y: 7 - y });
                } catch (e) {}
            }
            elem.appendChild(div);
        }
}

SEG.bounds = function(x, y) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
}

SEG.board = function(pos, x, y) {
    if (x >= 0 && x <= 7 && y >= 0 && y <= 7) return pos.b[x][y];
    return "x";
}

SEG.colorflip = function(pos) {
    var board = new Array(8);
    for (var i = 0; i < 8; i++) board[i] = new Array(8);
    for (x = 0; x < 8; x++)
        for (y = 0; y < 8; y++) {
            board[x][y] = pos.b[x][7 - y];
            var color = board[x][y].toUpperCase() == board[x][y];
            board[x][y] = color ? board[x][y].toLowerCase() : board[x][y].toUpperCase();
        }
    return { b: board, c: [pos.c[2], pos.c[3], pos.c[0], pos.c[1]], e: pos.e == null ? null : [pos.e[0], 7 - pos.e[1]], w: !pos.w, m: [pos.m[0], pos.m[1]] };
}

SEG.sum = function(pos, func, param) {
    var sum = 0;
    for (var x = 0; x < 8; x++)
        for (var y = 0; y < 8; y++) sum += func(pos, { x: x, y: y }, param);
    return sum;
}

 SEG.parseFEN = function(fen) {
        var board = new Array(8);
        for (var i = 0; i < 8; i++) board[i] = new Array(8);
        var a = fen.replace(/^\s+/, '').split(' '),
            s = a[0],
            x, y;
        for (x = 0; x < 8; x++)
            for (y = 0; y < 8; y++) {
                board[x][y] = '-';
            }
        x = 0, y = 0;
        for (var i = 0; i < s.length; i++) {
            if (s[i] == ' ') break;
            if (s[i] == '/') {
                x = 0;
                y++;
            } else {
                if (!this.bounds(x, y)) continue;
                if ('KQRBNP'.indexOf(s[i].toUpperCase()) != -1) {
                    board[x][y] = s[i];
                    x++;
                } else if ('0123456789'.indexOf(s[i]) != -1) {
                    x += parseInt(s[i]);
                } else x++;
            }
        }
        var castling, enpassant, whitemove = !(a.length > 1 && a[1] == 'b');
        if (a.length > 2) {
            castling = [a[2].indexOf('K') != -1, a[2].indexOf('Q') != -1,
                a[2].indexOf('k') != -1, a[2].indexOf('q') != -1
            ];
        } else {
            castling = [true, true, true, true];
        }
        if (a.length > 3 && a[3].length == 2) {
            var ex = 'abcdefgh'.indexOf(a[3][0]);
            var ey = '87654321'.indexOf(a[3][1]);
            enpassant = (ex >= 0 && ey >= 0) ? [ex, ey] : null;
        } else {
            enpassant = null;
        }
        var movecount = [(a.length > 4 && !isNaN(a[4]) && a[4] != '') ? parseInt(a[4]) : 0,
            (a.length > 5 && !isNaN(a[5]) && a[5] != '') ? parseInt(a[5]) : 1
        ];
        return { b: board, c: castling, e: enpassant, w: whitemove, m: movecount };
    }



/************************************ my code **************************************/
//programmatically fill the 'skills' details
function getGroups() {
    //get groups for skill
    var mySet = new Set();
    var dlen = SEG.data.length;
    var i;
    var group;
    for (i = 0; i < dlen; i++) {
        group = SEG.data[i].group;
        if (group !== "") {
            mySet.add(group);
        }
    }
    return mySet;
}

function createGroups(mySet) {
    //add the groups to the <details> html
    //  console.log(mySet);
    var arr = Array.from(mySet); //convert to array
    var alen = arr.length;
    for (i = 0; i < alen; i++) {
        funcname = safeStr(arr[i]);
        $('#skills').append("<details id='skills" + funcname + "' open> <summary>" + arr[i] + "<summary> </details>");
    }
}

function fillGroups() {
    //put each skill into the matching <details> group, with click handlers and titles
    var dlen = SEG.data.length;
    var i;
    var group, name, text, code, html;
    //dlen = 1;
    for (i = 0; i < dlen; i++) {
        group = SEG.data[i].group;
        funcGroup = safeStr(group);
        name = SEG.data[i].name;
        text = SEG.data[i].text;
        code = SEG.data[i].code;
        //code = code.replace("$" + n2 + "(", "$g-" + n2 + "(").replace("$" + n2 + "(", "$g-" + n2 + "(");  //? from graphGroupList?
        // while (i != midindex && i != endindex && maincode.indexOf("$" + n + "(") >= 0) {
        //       maincode = maincode.replace("$" + n + "(", "(function(){return " + eval("$" + n + "(pos)") + ";})(");   //this seems to replace $strings with the actual code
        //   }
        //text = text.replace(/\[\[/g, "<a onclick=\"golink(this);\">").replace(/\]\]/g, "</a>");  //replace [[ ]] with a link to something else?
        funcname = safeStr(name);
        //build the html
        html = "<label title='" + text + "' \
        onclick = 'doEval(\"" + funcname + "\");'   >  \
            <input type='checkbox' id='skill" + funcname + "' index='" + i + "' />   \
            " + name + "   \
            </label> <br>";
        $('#skills' + funcGroup).append(html);
    }
}

function safeStr(str) {
    return str.toLowerCase().replace(/ /g, "_");
}

function doEval(funcname) {
    var x, y;
    var checkbox = document.getElementById("skill" + funcname);
    if (!checkbox.checked) { //hide and show, show and hide
        removeAllHighlights();
        return;
    }
    //create Pos from chessboard.js board (not the Stockfish Evaluation board)
    var fen = game.fen();
    console.log(fen);
    pos = parseFEN(fen);
    flippedPos = colorflip(pos);
    eval("func = $" + funcname + ";  "); //turning a string into a  callable function.  clever.
    //initialize empty array
    var blackSquaresResults = new Array(8);
    var whiteSquaresResults = new Array(8);
    for (x = 0; x < 8; x++) {
        blackSquaresResults[x] = new Array(8);
        whiteSquaresResults[x] = new Array(8);
    }
    //run the function on each square    
    for (x = 0; x < 8; x++) {
        for (y = 0; y < 8; y++) {
            whiteSquaresResults[x][y] = func(pos, { x: x, y: 7 - y }); //executes the function
            blackSquaresResults[x][y] = func(flippedPos, { x: x, y: y }); //executes the function
        }
    }
    var alpha = "abcdefgh"; //convert number to letter (for algebraic notation)
    var whiteresult, blackresult;
    var x1, y1, squareName;
    //show results as highlights
    for (x = 0; x < 8; x++) {
        for (y = 0; y < 8; y++) {
            whiteresult = whiteSquaresResults[x][y];
            blackresult = blackSquaresResults[x][y];
            if (whiteresult == 0 && blackresult == 0) continue; //no results for this square
            x1 = alpha.charAt(x);
            y1 = y + 1;
            squareName = "square-" + x1 + y1;
            if (whiteresult) {
                $("." + squareName).addClass('highlight-white');
            }
            if (blackresult) {
                $("." + squareName).addClass('highlight-black');
            }
            //console.log(squareName + " : " + result);
        }
    }
}

function code2vars() {
    //turn all stored code into strings in memory of the form $pinned, or $knight_evaluation.  required to execute functions within functions.  Its a lot of memory (the original code does it per function, as needed), but, eh.
    var dlen = SEG.data.length;
    var i, name, code, funcname;
    var skills = [];
    //dlen = 1;
    for (i = 0; i < dlen; i++) {
        name = SEG.data[i].name;
        code = SEG.data[i].code;
        funcname = safeStr(name);
        eval("$" + funcname + " = " + SEG.data[i].code + ";"); //store code as a dynamic variable 
    }
}
/////////////////////////////////// main /////////////////////////////////////////
//populates html <details> with skills
var groups = getGroups();
createGroups(groups);
fillGroups();
code2vars();  //turns code into executable functions
// pos = {// chessboard
//        b: [["-","-","-","-","-","-","P","R"],
//            ["r","-","-","-","-","-","-","-"],
//            ["-","p","b","n","-","Q","-","-"],
//            ["q","-","p","N","-","B","P","-"],
//            ["r","b","p","-","-","P","-","-"],
//            ["-","n","p","-","-","N","P","R"],
//            ["-","-","-","p","-","B","P","K"],
//            ["k","p","-","-","-","-","P","-"]],
//        // castling rights
//        c: [true,true,false,false],
//        // enpassant
//        e: false,
//        // side to move
//        w: true,
//        // move counts
//        m: [0,10]}
//    showboard();  //makes a little blue and white board