

MAX_BOMBAS = 10;
//CORES
POSICAO_LIMPA = "#EFEFEF"
POSICAO_PADRAO = "#AEAEAE"
qtdPosicoesSemBombas = 81 - MAX_BOMBAS
posicoesLimpas = 0;
bombasPosicionadas = 0;
array = [];
board = new Map([]);
refresh = false;

//mapFlaggedMines armazena a quantidade de bombas ao redor de uma posicao
// que acabou de ser marcada com a bandeira...
flaggedMines = 0;
mapFlaggedMines = new Map([]);

arrayPosicoesReveladas = [];


function getNumberOfBombs(){
	MAX_BOMBAS = document.getElementById("numberOfBombs").value;
}


function flag(id){
	if (arrayPosicoesReveladas.includes(id)){
		//ignora posição ja revelada
	}else if (board.get(id) != "flag"){
		mapFlaggedMines.set(id, board.get(id));
		board.set(id, "flag");
		flaggedMines++;
		document.getElementById(id).style.backgroundImage = "url('./images/safeFlag.png')"
	}else{
		board.set(id, mapFlaggedMines.get(id));
		document.getElementById(id).style.backgroundImage = "";
		document.getElementById(id).style.backgroundColor = POSICAO_PADRAO;
	}
}

//id = posicao no tabuleiro a1 - i9;
function game(id){
	gameStatus = document.getElementById("gameStatus").innerText;

	if (gameStatus == "Boa sorte..."){
		acaoJogador(id);
	}else if (gameStatus == "Perdeu" || gameStatus == "Vitória!"){
		if(refresh){
			document.location.reload(true);
		}
		refresh = true;
	}
}

//id = posicao no tabuleiro a1 - i9;
function acaoJogador(id){
	bombaEncontrada = findBomb(id);
	nearBombs = board.get(id);

	//Clicou em uma bandeira
	if(nearBombs == "flag"){
		//ignore

	//Clicou em uma bomba
	}else if (bombaEncontrada){
		//Bomba neste local...
		lose(id);
		showGame();

	//Clicou em uma posicao ja revelada
	}else if(arrayPosicoesReveladas.includes(id)){
		mayReveal(id);

	//Clicou em uma posicao sem bomba e com alguma bomba por perto
	}else if(!bombaEncontrada && nearBombs != 0){
		showPosition(id);

	//Clicou em uma posicao que não há nenhuma bomba por perto e ainda não foi revelada
	}else if(nearBombs == 0){
		mayReveal(id)
	}
	if(arrayPosicoesReveladas.length == (81 - MAX_BOMBAS)){
		document.getElementById("gameStatus").innerText = "Vitória!";
	}
}

function mayReveal(id){
	rtrn = flagsAround(id);
	flags = rtrn[0];
	safePositions = rtrn[1];
	console.log(board.get(id) == flags);
	if(board.get(id) == flags){
		if(verifyFlags(safePositions)){
			console.log("entrei")
			safePositions.forEach(showSafePositions);
		}
	}
}

function flagsAround(id){
	nearFlags     = 0;
	safePositions = [];
	safeCounter   = 0
	firstLine     = id.charCodeAt(0) - 1;
	firstColumn   = parseInt(id.substring(1,2)) - 1;
	posicaoAtual  = String.fromCharCode(firstLine) + firstColumn;
	rtrn = [];
	bombPositions = [];
	bmbCounter = 0;
	
	for(line = 0; line < 3; line++){
		for(column = 0; column < 3; column++){
			try{

				console.log(board.get(posicaoAtual).match(/[0-8]/gi));
				
				console.log("--- " + board.get(posicaoAtual));
				if(board.get(posicaoAtual) == "flag" && posicaoAtual != id){
					nearFlags++;
				}else if(board.get(posicaoAtual) == "bomb"){
					safePositions[safeCounter] = posicaoAtual;
					safeCounter++;
				}else{
					console.log("ignorado: " + posicaoAtual);
				}
			}catch(TypeError){
				safePositions[safeCounter] = posicaoAtual;
				safeCounter++;
				console.log("ignoraado1: " + posicaoAtual);
			}
			firstColumn++;
			posicaoAtual = String.fromCharCode(firstLine) + firstColumn;	
		}
		firstLine++;
		firstColumn -= 3;
		posicaoAtual = String.fromCharCode(firstLine) + firstColumn;
	}
	rtrn[0] = nearFlags;
	rtrn[1] = safePositions;

	console.log(nearFlags);
	return rtrn;
}

function verifyFlags(safePositions){
	safe = true;
	safePositions.forEach(function(position){

		console.log(board.get(position))
		if(board.get(position) == "bomb"){
			lose(position);
			safe = false;
		}
	});
	return safe;
}

function showSafePositions(position, index, safePositions){
	try{
		if(board.get(position) == "bomb"){
			lose(position);
		}else{
			showPosition(position);
		}
	}catch(TypeError){
		//ignore
	}
}
 

function showPosition(id){
	document.getElementById(id).innerText = board.get(id);	
	document.getElementById(id).style.backgroundColor = POSICAO_LIMPA;
	putArrayPosicoesReveladas(id);
}

function putArrayPosicoesReveladas(id){
	if(!arrayPosicoesReveladas.includes(id)){
		arrayPosicoesReveladas[posicoesLimpas] = id;
		posicoesLimpas++;
	}
}




function lose(id){	
	board.set(id, "boom");
	document.getElementById(id).style.backgroundColor = "#990000";
	document.getElementById("gameStatus").innerText = "Perdeu";
	document.getElementById("gameStatus").disabled = false;
	showGame();
}

function showGame(){
	for (var [key, value] of board){
		if (value == "bomb"){
			document.getElementById(key).style.backgroundImage = "url('./images/bomb.jpg')";
		}else if(value == "boom"){
			document.getElementById(key).style.backgroundImage = "url('./images/redBomb.png')";
		}else if (value == "flag"){
			//ignore
		}else{
			document.getElementById(key).innerText = value;
		}
	}
}

function hideBomb(position){
	if(position != null){
		document.getElementById(position).style.backgroundImage = "";
	} 
}


function findBomb(id){
	bombaEncontrada = false;
	i = 0;
	while (i < MAX_BOMBAS){
		if (array[i] == id){
			bombaEncontrada = true;
		}
		i++;
	}
	return bombaEncontrada;
}


function placeRandomBomb(){
	if(board.size != 0){
		resetGame();
	}
	line   = String.fromCharCode(Math.floor(Math.random() * (105 - 97 + 1)) + 97);
	column = Math.floor(Math.random() * 9) + 1;
	id     = line + String(column);
	placeBomb(id);
	if (bombasPosicionadas < MAX_BOMBAS){
		placeRandomBomb();
	}
	document.getElementById("gameStatus").innerText = "Boa sorte...";
	document.getElementById("gameStatus").disabled = true;
	loadGame();
}

function placeBomb(id){
	if (bombasPosicionadas == MAX_BOMBAS){
		i = 0;
		while (i < MAX_BOMBAS){
			hideBomb(array[i]);
			i++;	
		}
	}else{
		bombaEncontrada = findBomb(id);
		if (!bombaEncontrada){
			//document.getElementById(id).style.backgroundImage = "url('./images/bomb.jpg')";
			array[bombasPosicionadas] = id;
			bombasPosicionadas++;
		}
	}
}

function loadGame(){
	currentPosition = "a1";

	for(i = 0; i < 81; i ++){	
		line        = currentPosition.substring(0,1);//a
		nextLineAsc = line.charCodeAt(0) + 1;//b
		column      = parseInt(currentPosition.substring(1,2));//1  - a1
		if (array.includes(currentPosition)){
			board.set(currentPosition, "bomb");
		}else{
			if(currentPosition == "j1"){
				break;
			}
			lookAround(currentPosition);
		}
		
		if(column < 9){
			currentPosition = String(line) + String((column + 1));
		}else{
			currentPosition =  String.fromCharCode(nextLineAsc) + "1"; 
		}
	}
}

//id é formado por uma letra e um número
//letra any-1: numero -1,  numero, numero +1
//letra any  : numero -1,  numero, numero +1
//letra any+1: numero -1,  numero, numero +1
function lookAround(id){
	//EXEMPLO: B2
	nearBombs   = 0;
	firstLine   = id.charCodeAt(0) - 1;//B - 1 = A
	currentLine = firstLine;
	lastLine = firstLine + 2;
	firstColumn = parseInt(id.substring(1,2)) - 1;//2 - 1 = 1
	currentColumn = firstColumn;
	do{
		for (j = 0; j < 3; j++){
			posicao = String.fromCharCode(currentLine) + 
						currentColumn;
			
			if (array.includes(posicao)){
				nearBombs++;
			}
			currentColumn++;
		}
		currentColumn = firstColumn;
		currentLine++;
		console.log(posicao + " = " + board.get(posicao))
	}while(currentLine <= lastLine);
	board.set(id, nearBombs);
}


function resetGame(){
	board.forEach(function(position){
		if(position != null){
			document.getElementById(position).innerText = "";
			document.getElementById(position).style.backgroundColor = POSICAO_PADRAO;
		}
	})
	board.clear();
}