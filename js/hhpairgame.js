//
// Copyright 2021
// Balazs Szalai, szalabala@gmail.com, https://www.buymeacoffee.com/szalabala
// HHSWGM: Hangyas a Hidon Simple Web Game Module
// description: TBD
//
// see mypage.html tag expectation at the end of the file, might be generalized later

    var _name = "Nincs Kettő Négy Nélkül";
    var _version = '0.3.1';
    var gameDesc = { W: 6, H: 3
        , start_message: "<span style=\"color:blue;text-decoration:blink;\">" + "lovas" + "</span>"
        , restart_message: "<span style=\"color:blue;text-decoration:blink;\">Kattints a Puffinra az újrakezdéshez</span>"
        , tabla: "kincsaminincs-terkep1000d.jpg", tabla0: "images/nincs2header_46d.jpg", tabla_end: "ending.jpg"
        , tabla_w:"images/nincs2back_w.jpg", tabla_h:"images/nincs2back_h.jpg"
        , music: "audio/movin-cruisin-xylo.mp3", music0: "audio/movin-crusin-cover1.mp3"
        , figure_scale: 15 // % of table-height, cc 15vh
        , image: { imgClosed: 'images/door3a.png', imgOpen: 'images/door3b.png', imgEmpty:"data:," }
        , misc: { demo1: 'd1', demo2: 'd2' }
        , modes: [
            { id:1, match:'same', n1: 2, good: 8, pairs: [3, 17, 7, 9, 13, 15], name:"Bugsy", desc:"Tudod mi vagy Bugsy?" },
            { id:2, match:'same', n1: 3, good: 18, pairs: [2, 4, 5, 18, 7, 9, 10, 11, 12, 13, 15, 17], name:"Zsugabubus", desc:"Nem vagyok valami nagy játékos." },
            { id:3, match:'ab', n1: 3, good: 18, pairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 ], name:"Nimfas", desc: "Itt senki sem olyan nagy szám." },
            { id:4, match:'ab', n1: 4, good: 50, pairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], name:"Charlie" },
            { id:5, match:'ab', n1: 4, good: 40, pairs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], name:"Paragulis", desc:"Golyózott volna a szemed a trükkjeitől." }
        ]
        , messages: { intro: "Keresd a párját! Kettesével megnézheted a kártyákat.",
                      showMode: "Keresd a párokat!",
                      step1: "Kattints egy kártyára!", 
                      step2: "Válasz egy másik kártyát!", 
                      evalPass: "Ügyes vagy!",
                      evalFail: "Próbáld újra!",
                      win: "Gratulálok!" }
        , eval_good: [ "Fantasztikus! Egyszerűen hihetetlen.", "Ilyet a fecskék is csak akkor csinálnak, ha jó formában vannak.",
                "Az ajtók azért vannak, hogy bemenjünk rajtuk, nem tudtad?", "Hogy is mondjam, csak ez... olyan... mint... nem találok rá jelzőt.",
                "Önök uraim egy rendkívül alapos nyomozói munka eredményei.", "Tudod mit? Furfangos egy furkó vagy te!",
                "Te mondtad Főnök, olyan a szemem, mint a sasé!", "Egyet is nehéz találni, na de kettőt. És ilyen rövid idő alatt?" ]
        , eval_bad: [ "A te tudatalattid különleges tipikussággal jelentkezik.", "Elnézést a késésért, nem találták a cella kukcsát.", 
                "Attól tartok ezt a számot nem ismerem.", "Kábító! Valóban az.", "A kábítót ágy értettem elképesztő.",
                "Önök a mi szervezetünk remekművei.", "Úgy marad majd meg, mint ey zárójelbe tett bolondság, amit soha senki nem fog tudni megmagyarázni.",
                "Plátói? Mi a fenét jelent az, hogy plátói?" ]

    };
    var gameData = {
        steps: [], turn: 0, aktiv: 0, players: [], started: false, pics: [], gameModeIdx:0, 
        state: "menu",  // "menu", "wait4first", "zoomOut1st", "wait4second", "zoomOut2nd", "closing", "about", 
        state2: 0,
        targetList: [],  // { id, img_src, posid }
        totalPairs: 0,
        foundPairs: [],
        attempts: 0,
        startTime: 0,   // use new Date().getTime()
        endTime:0,
        selectA: 0,
        selectB: 0,
        isPairFound: false,
        cookieNumPlays: 0,
        cookieBest: 0
    };
    var cookies = {      // arrays indexed per difficulty level
        started: [],     // games started
        finished: [],
        bestMove: [],   // array of best moves per difficulty level
        bestTime: []
    };
    var gameUI = {
        mainAreaWidthPc: 80, mainAreaHeightPc: 90, // figureSizePc: 10,
        cardBackImg: "images/back.jpg",
        zoomedPosPc: 25, spinTimeMs:hhgui._shortMs, spinDeg:360,
        fullscr: 0, muted: false,
        cache: { imgSizePx: 100, offsetXPx:1, offsetYPx:1 }
    };

    function myLoad() {
        const queryString = window.location.search;
        console.log(`url params: ${queryString}`)
        if (queryString != '') {
            console.log(queryString);

            const urlParams = new URLSearchParams(queryString);
            if (urlParams.has('fast')) {
                _longMs = 100;
                _shortMs = 50;
                gameUI.spinTimeMs = 50;
            }

            if (urlParams.has('frameMs')) {
                frameMs = parseInt(urlParams.get('frameMs'))
            }
            if (urlParams.has('lvl')) {
                var lvl = parseInt(urlParams.get('lvl'));
                for  (var i = 0; i < lvl; i++) {
                    cookies.started[i] = Math.max(cookies.started[i], 1);
                    cookies.finished[i] = Math.max(cookies.finished[i], 1);
                }
            }
        }
    }

    function startOnce() {
        for (var i=1;i <= gameDesc.modes.length; i++ ) {
            addImgButton(i, 'selectModeDiv', i, '');
        }
        addImage(gameDesc.misc.demo1, gameDesc.image.imgEmpty);
        addImage(gameDesc.misc.demo2, gameDesc.image.imgEmpty);
        document.getElementById(gameDesc.misc.demo1).style.display = 'none';
        document.getElementById(gameDesc.misc.demo2).style.display = 'none';
        document.getElementById('tabla').style.filter = 'invert(25%)';
        document.getElementById('myaudio').volume = 0.2;
        restoreCookies();
        myLoad();
        start();
    }

    function start() {
        gameData.state = 'menu'
        document.getElementById('selectModeDiv').style.top = '10%';
        document.getElementById('selectModeDiv').style.display = 'inline';
        document.getElementById('restartbutton').style.display = 'none';
        document.getElementById(gameDesc.misc.demo1).style.display = 'none';
        document.getElementById(gameDesc.misc.demo2).style.display = 'none';
        hhgui.setMsg(_name, "bigtext");
        hhgui.setStatusMsg('A Hangyás-A-Hídon bemutatja...');

        setTimeout(hhgui.myResize, 10);  // do initial re-placement

        for (var i=1;i <= gameDesc.modes.length; i++ ) {
            var but = document.getElementById(`b${i}`);
            but.style.display = 'initial';
            //console.log(`sss ${i} ${cookies.finished} ${cookies.finished.length} ${cookies.finished[i-1]}`)
            if (i == 1 || (cookies.finished.length >= i && cookies.finished[i-2] > 0)) {
                but.disabled = false;
                but.src = gameDesc.image.imgOpen;
                hhgui.myBlink(but,false);
                setTimeout(hhgui.myBlink, i * Math.floor(hhgui._longMs/8) + 5, but);
            } else {
                but.disabled = true;
                but.style.color = 'pink';
            }
        }

        for (var i = 0; i < gameData.targetList.length; i++) {
            document.getElementById(gameData.targetList[i].id).remove();
        }
        gameData.targetList = [];
        /*
        for (var i=1;i < 2; i++ ) { // whatever
            //document.getElementById('p'+i).style.filter = 'invert(0%)';
            if (!(new URLSearchParams(window.location.search)).has('start')) {
                setTimeout(myBlink, 5 + i*200, "p"+i);
            }
        }
        */

        //myLoad();
        //restartGame();
    }

    function showAbout() {
        if (gameData.state != 'about') {
            gameData.state2 = gameData.state;
            gameData.state = 'about';
        }
        document.getElementById('selectModeDiv').style.display = 'none';
        document.getElementById('aboutDiv').style.display = 'inline';
        document.getElementById('tabla').style.display = 'none';
        var text = document.getElementById('texta');
        text.innerHTML = '<h1>Nincs kettő négy nélkül!</h1>'
                       + 'Egyszerű párkereső memóriajáték Bud Spencer és Terence Hill filmek rajongói számára.<br><br>'
                       + 'Játék terv, programozás, blablala: szalabala<br>'
                       + 'Zene: Sélley Szabolcs<br>'
                       + 'Köszönet: akik segítettek<br><br>';
        for (var i = 0; i < gameData.targetList.length; i++) {
            var pic = document.getElementById(gameData.targetList[i].id);
            var pos = hhgui.getPosPxOfPospc(hhgui.getPosPcOfPicIdx(i));
            pic.style.transition=`transform ${gameUI.spinTimeMs}ms ease-in-out`; // linear ease 
            pic.style.transform=`translate(${pos.x}px, ${pos.y}px) scale(0.5, 0.5)`; // size:enlarge .. rotate:flip
        }

        text.innerHTML += "<br>"
        for (var i = 0; i < gameDesc.modes.length; i++) {
            text.innerHTML += `${gameDesc.modes[i].name} mód: ${cookies.finished[i]} játék`
            if (cookies.finished[i] && cookies.finished[i] > 0) {
                text.innerHTML += `, legkevesebb lépés: ${cookies.bestMove[i]}, legjobb idő:${cookies.bestTime[i]}s`
            }
            text.innerHTML += ".<br>"
        }
        //disable all images
        // add some return button
        //windows.onClick = function() {}
    }
    function closeAbout() {
        gameData.state = gameData.state2;
        document.getElementById('aboutDiv').style.display = 'none';
        document.getElementById('tabla').style.display = 'inline';
        if (gameData.state == "menu") {
            document.getElementById('selectModeDiv').style.display = 'inline';
        } else if (gameData.state == "closing") {
            document.getElementById('selectModeDiv').style.display = 'inline';
        } else {
            for (var i = 0; i < gameData.targetList.length; i++) {
                var pic = document.getElementById(gameData.targetList[i].id);
                var pos = getPosPxOfPospc(getPosPcOfPicIdx(i));
                pic.style.transition=`transform ${gameUI.spinTimeMs}ms ease-in-out`; // linear ease 
                pic.style.transform=`translate(${pos.x}px, ${pos.y}px) scale(${pos.scale}, ${pos.scale}) rotateX(${pos.rotX}deg)`; // size:enlarge .. rotate:flip
            }
        }

    }

    function showSelectMode() {
        var d1 = document.getElementById(gameDesc.misc.demo1);
        var d2 = document.getElementById(gameDesc.misc.demo2);

        hhgui.setStatusMsg(gameDesc.messages.showMode);
        d1.src = 'images/1a.jpg';
        if (gameDesc.modes[gameData.gameModeIdx].match == 'same') {
            d2.src = 'images/1a.jpg';
        } else {
            d2.src = 'images/1b.jpg';
        }
        d1.style.display='inline';
        d2.style.display='inline';
        
        var pos1 = hhgui.getPosPxOfPospc(hhgui.getPosPcOfSpecial("selectA"));
        var pos2 = hhgui.getPosPxOfPospc(hhgui.getPosPcOfSpecial("selectB"));
        d1.style.transition=`transform ${gameUI.spinTimeMs}ms ease-in-out`; // linear ease 
        d1.style.transform=`translate(${pos1.x}px, ${pos1.y}px) scale(${pos1.scale},${pos1.scale}) rotateX(${pos1.rotX}deg)`; // size:enlarge .. rotate:flip
        d2.style.transition=`transform ${gameUI.spinTimeMs}ms ease-in-out`; // linear ease 
        d2.style.transform=`translate(${pos2.x}px, ${pos2.y}px) scale(${pos2.scale},${pos2.scale}) rotateX(${pos2.rotX}deg)`; // size:enlarge .. rotate:flip

        setTimeout(function() {
                d1.style.transform=`translate(${pos1.x}px, ${pos1.y}px)`;
                d2.style.transform=`translate(${pos2.x}px, ${pos2.y}px)`;
                d1.style.display='none';
                d2.style.display='none';
            }, hhgui._longMs + gameUI.spinTimeMs)
        /*
        d1.style.transition=`transform ${gameUI.spinTimeMs}ms ease-in-out`; // linear ease 
        zoomOutPic(gameDesc.misc.demo1, getPosPxOfPospc(getPosPcOfSpecial("selectA")));
        zoomOutPic(gameDesc.misc.demo2, getPosPxOfPospc(getPosPcOfSpecial("selectB")));
        setTimeout(zoomInPic,  _longMs + gameUI.spinTimeMs, gameDesc.misc.demo1, getPosPxOfPospc(getPosPcOfSpecial("selectA")));
        setTimeout(zoomInPic,  _longMs + gameUI.spinTimeMs, gameDesc.misc.demo2, getPosPxOfPospc(getPosPcOfSpecial("selectA")));
        */
    }

    function selectMode(n=1) {
        if (n == 1 || cookies.finished[n-2] > 0) {
            gameData.gameModeIdx = n - 1;
            for (var i=1;i <= 5; i++ ) {
                document.getElementById(`b${i}`).style.display = 'none';
            }
            showSelectMode();
            setTimeout(restartGame,  hhgui._longMs + gameUI.spinTimeMs);
        } else {
            document.getElementById(`b${n}`).style.animation=`closed ${hhgui._shortMs}ms ease 0s 1 normal both`;
            setTimeout(hhgui.myBlink, hhgui._shortMs, document.getElementById(`b${n}`), false )
        }
    }

    function restartGame() {
        gameData.targetList = [];  // creating a random list of number, the pictures to show
        var mode = gameDesc.modes[gameData.gameModeIdx];
        var N = mode.n1 * mode.n1;      // gameDesc.W * gameDesc.H;   //number of pairs to match
        var N2 = mode.pairs.length;     // Math.floor(N / 2 );   //number of pairs to match
        var list = mode.pairs.slice();  // creating a random list of number, the pictures to show
        var poslist = [];
        gameData.totalPairs = 0;
        gameData.attempts = 0;
        gameData.startTime = new Date().getTime();

        shuffle(list);

        for (var i = 0; i < 2*N; i++) { // random list of positions
            poslist.push(i);
        }
        shuffle(poslist);
        
        //console.log(`start ${list} x ${poslist}`);
        for (var i = 0; i < N; i++) {  // add tiles
            var img2sel = (mode.match == 'same') ? 'a' : 'b';
            gameData.targetList.push( { id: `p${1+2*i}`, pairId: i, src: `images/${list[i]}a.jpg`, posid: poslist[i*2] } );
            gameData.targetList.push( { id: `p${2+2*i}`, pairId: i, src: `images/${list[i]}${img2sel}.jpg`, posid: poslist[i*2+1] } );
        }
        gameData.foundPairs = [];
        gameData.totalPairs = N;
        
        for (var i = 0; i < 2*N; i++) {
            addImage(gameData.targetList[i].id, gameUI.cardBackImg);// gameData.targetList[i].src);
        }
        setTimeout(hhgui.myResize, 10);  // initial placement

        hhgui.setMsg("", "bigtext");
        hhstat.extendArray(cookies.started, gameData.gameModeIdx, 0);
        cookies.started[gameData.gameModeIdx] += 1;
        storeCookies();

        gameData.state = 'wait4first'
    }

    function onClickPic(id) {
        console.log(`click ${id}`);
        if (gameData.state == 'wait4first') {
            gameData.attempts += 1;
            gameData.selectA = id;
            gameData.state = "wait4second";
            gameData.isPairFound = false;
            hhgui.setStatusMsg(`${gameData.attempts}. lépés`);
            //zoomOutPic(id, getPosPxOfPospc( {x_pc:gameUI.zoomedPosPc, y_pc:50} ));
            hhgui.zoomOutPic(id, hhgui.getPosPxOfPospc(hhgui.getPosPcOfSpecial("selectA")));
        } else if (gameData.state == 'wait4second' && id != gameData.selectA) {
            gameData.selectB = id;
            gameData.state = "evaluate";
            //zoomOutPic(id, getPosPxOfPospc( {x_pc:(100-gameUI.zoomedPosPc), y_pc:50} ));
            hhgui.zoomOutPic(id, hhgui.getPosPxOfPospc(hhgui.getPosPcOfSpecial("selectB")));
            setTimeout(evaluateSelection(), hhgui._longMs * 2);
        //} else {
        }
    }
    function evaluateSelection() {
        //console.log(`evaluate ${gameData.selectA} ? ${gameData.selectB}`);

        const itemA = gameData.targetList.find(element => element.id == gameData.selectA);
        const itemB = gameData.targetList.find(element => element.id == gameData.selectB);

        if (itemA.pairId == itemB.pairId) {
            gameData.foundPairs.push(itemA.pairId);
            gameData.isPairFound = true;
            document.getElementById(gameData.selectA).onclick = "";
            document.getElementById(gameData.selectB).onclick = "";
        }

        if (gameData.foundPairs.length < gameData.totalPairs) {
            setTimeout(changeState, hhgui.longMs, "wait4first");
        } else {
            gameData.endTime = new Date().getTime();
            setTimeout(playClosing, hhgui._longMs);
        }
    }

    function changeState(newState) {
        if (newState == "wait4first") {
            if (gameData.selectA != '') {
                const picId = gameData.selectA;
                gameData.selectA = 0;
                hhgui.zoomInPic(picId);
            }
            if (gameData.selectB != '') {
                const picId = gameData.selectB;
                gameData.selectB = 0;
                hhgui.zoomInPic(picId);
            }

            gameData.isPairFound = false;

            if (gameData.gameModeIdx == 4 && gameData.attempts % 5 == 0) {
                hhgui.swapTwoCards();
            }
        } else if (newState == "wait4first") {
            var pic = document.getElementById(selectAid);
            pic.classList.remove("med");
            pic.classList.add("top");
        }
        gameData.state = newState;
    }

    function swapTwoCards() {
        var r1 = Math.floor(Math.random() * gameData.targetList.length);
        var r2 = Math.floor(Math.random() * gameData.targetList.length);
        //console.log(`swap ${r1} -- ${r2}`);
        var tmp = gameData.targetList[r1].posid;
        gameData.targetList[r1].posid = gameData.targetList[r2].posid;
        gameData.targetList[r2].posid = tmp;
        
        moveHomePic(gameData.targetList[r1].id);
        moveHomePic(gameData.targetList[r2].id);
    }
        

    function playClosing() {
        //console.log(`closing`)
        //document.getElementById('tabla').style.filter = 'invert(25%)';
        gameData.state = "closing";
        gameData.selectA = 0;
        gameData.selectB = 0;
        for (var i = 0; i < gameData.targetList.length; i++) {
            var pic = document.getElementById(gameData.targetList[i].id);
            var pos = getPosPxOfPospc(getEndingPosPcOf(gameData.targetList[i].posid));
            pic.style.transition=`transform ${gameUI.spinTimeMs}ms ease-in-out`; // linear ease 
            pic.style.transform=`translate(${pos.x}px, ${pos.y}px) scale(0.5, 0.5)`; // size:enlarge .. rotate:flip
        }

        var msgArr = gameDesc.eval_bad;
        if (gameData.attempts < gameDesc.modes[gameData.gameModeIdx].good) {
            msgArr = gameDesc.eval_good;
        }
        var r = Math.floor(Math.random() * msgArr.length);
        document.getElementById('selectModeDiv').style.top = '30%';
        setMsg(msgArr[r],"bigtext");
        document.getElementById('restartbutton').style.display = 'inline';

        cookies.finished[gameData.gameModeIdx] += 1;
        myUpdateStat(cookies.bestMove, gameData.gameModeIdx, gameData.attempts);
        myUpdateStat(cookies.bestTime, gameData.gameModeIdx, Math.floor((gameData.endTime - gameData.startTime)/1000));
        storeCookies();
    }



    function addImage(id, isrc, parent='toptable') {
        //console.log(` add ${id} of ${isrc}`);
        //<button id="b3" class="xl modebutton" onClick="selectMode(3)">3</button>
        var img = document.createElement('img'); 
        img.id = id;
        img.src = isrc;
        img.classList.add("mozgo");
        img.classList.add("med");
        img.style.borderRadius = "25%";
        img.style.maxWidth = "30vw";
        img.style.maxHeight = "30vh";
        img.style.border = '2px solid white';
        img.onclick = function() { onClickPic(id); };
        document.getElementById('toptable').appendChild(img);
    }

    function addImgButton(idx,parent,text,defstyle) {
        //console.log(` add ${idx}`);
        var but = document.createElement('img'); 
        but.id = `b${idx}`;
        but.src = gameDesc.image.imgClosed;
        but.style.maxWidth = "25vw";
        but.style.maxHeight = "30vh";
        but.onclick = function() { selectMode(idx); };
        /*
        but.classList.add("modebutton");
        but.style.border = '2px solid white';
        var but = document.createElement('button'); 
        but.classList.add("xl");
        but.innerHTML = text;
        */
        document.getElementById(parent).appendChild(but);
    }


    function shuffle(a) {
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    function storeCookies() {
        hhcookies.bake('gamesStarted', cookies.started);
        hhcookies.bake('gamesFinished', cookies.finished);
        hhcookies.bake('bestMove', cookies.bestMove);
        hhcookies.bake('bestTime', cookies.bestTime);
    }
    function restoreCookies() {
        cookies.started = hhcookies.read('gamesStarted');
        cookies.finished = hhcookies.read('gamesFinished');
        cookies.bestMove = hhcookies.read('bestMove');
        cookies.bestTime = hhcookies.read('bestTime');

        while (cookies.started.length <= gameDesc.modes.length) {
            cookies.started.push(0);
        }
        while (cookies.finished.length <= gameDesc.modes.length) {
            cookies.finished.push(0);
        }
    }

    
/*width:10%;height:10%;padding:0;display:inline-block;
display:inline-block;
<body onload="startOnce();" onresize="myResize();">
    <audio id="myaudio" src="sounds/nincs2intro.m4a" autoplay loop> </audio>
    <div id="toptable" style="position:absolute;width:100%;height:100%;padding:0;">
    <img id="tabla" class="back" src="images/nincs2back_w.jpg" style="position:absolute;float:left;left:0;padding:0;text-align:center;vertical-align:top;width:90%;height:90%;max-height:90vh;max-width:90vw;z-index:-1;object-fit:contain;object-position:center center;">
    <div style="position:relative;float:right;width:90%;text-align:right;vertical-align:top;">
    <p id='volume' style="text-align:right"><img src="images/volume2a.png" style="max-height:5vmin" onclick="toggleAudio()"><img id='fullscr' src="images/fullscr2a.png" style="max-height:5vmin" onclick="toggleFullScr()">
    <br><img src="images/about.png" style="max-height:10vmin" onclick="showAbout()"></p>
        </div>
        <div id="selectModeDiv" style="position:fixed;float:left;left:10%;top:10%;width:80%;padding:0;text-align:center;">
            <p id="bigtext" class="xl" style="text-align:center;font-stretch:semi-condensed">Nincs kettő négy nélkül!</p><br>
            <button id="restartbutton" class="xl modebutton" style="left:42%;border-color:blue;" onclick="start()"><img src="images/door_key.png" style="max-height:15vw;max-height:15vh"></button>
        </div>
        <div id="aboutDiv" style="position:fixed;float:left;left:10%;top:25%;width:80%;padding:0;text-align:center;display:none;">
            <button class="big modebutton" style="position:fixed;left:45%;top:45%;" onclick="closeAbout()">Vissza</button>
            <p id="texta" class="small" style="padding:0;text-align:left;font-stretch:semi-condensed;"></p>
        </div>
        <cite id="status" class="big" style="position:absolute;float:left;top:0%;text-align:left;"></cite>
        <div id='footer' style="position:absolute;float:left;left:0%;bottom:0%;width:100%;padding:0;margin:0;text-align:left;font-stretch:semi-condensed;">
            <a style="position:absolute;float:left;bottom:0%;" href="https://www.buymeacoffee.com/szalabala" target="_blank"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=szalabala&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"></a>
            <cite id="credit" class="medium" style="position:absolute;float:right;right:0%;bottom:0%;padding:0;margin:0;text-align:right;"><i>&copy; Copyright 2021 szalabala - grafika: TBD</i></cite>
        </div>
    </div>
    <!-- https://www.buymeacoffee.com/szalabala -->
</body>
*/
