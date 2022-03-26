$(document).ready(function () {
	
	window.WebSocket = window.WebSocket || window.MozWebSocket;
	
	var connection;
	var route;
	var ballSpeed = $('#ballSpeed');
	var msgBody = $('#msgBody');
	var msgModal = $('#messageModal');
	var readyButton = $('#readyButton');
	$('label').hide();
	ballSpeed.hide();
	readyButton.hide();

  const host = window.location.hostname;
  const socketProtocal = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketServer = `${socketProtocal}://${host}:8080`;
  

  connection = new WebSocket(socketServer);
  route = window.location.pathname;

  var joystick = nipplejs.create({
    zone: document.getElementById('joystickWrapper'),
    color: 'white',
    mode: 'semi',
  });

  var canvas = document.getElementById('pongTable');
  var ctx = canvas.getContext('2d');
  var currentPlayer;
  var keyUp = false;
  var keyDown = false;
  var player1Score = 0;
  var player2Score = 0;
  ctx.strokeStyle = 'white';
  ctx.rect(375, 240, 10, 10);
  ctx.rect(0, 225, 10, 50);
  ctx.rect(740, 225, 10, 50);
  ctx.stroke();

  readyButton.on('click', function () {
    var ballSpeedVote = ballSpeed.val();
    connection.send(route + ' ready ' + currentPlayer + ' ' + ballSpeedVote);
    readyButton.hide();
    ballSpeed.hide();
    $('label').hide();
  });

  $('#joinButton').on('click', function () {
    connection.send(route + ' join');
    $('#joinButton').hide();
    readyButton.show();
    ballSpeed.show();
    $('label').show();
  });

  // keyboard controls
  window.onkeydown = function (e) {
    if (e.keyCode === 38) {
      keyUp = true;
    }
    if (e.keyCode === 40) {
      keyDown = true;
    }
  };

  window.onkeyup = function (e) {
    if (e.keyCode === 38) {
      keyUp = false;
    }
    if (e.keyCode === 40) {
      keyDown = false;
    }
  };

  // mobile joystick controls
  joystick.on('dir:up dir:down', function (evt, data) {
    if (evt.type == 'dir:up') {
      keyDown = false;
      keyUp = true;
    }
    if (evt.type == 'dir:down') {
      keyUp = false;
      keyDown = true;
    }
  });

  joystick.on('start end', function (evt, data) {
    if (evt.type == 'end') {
      keyUp = false;
      keyDown = false;
    }
  });

  connection.onmessage = function (message) {
    if (keyUp) {
      connection.send(route + ' ' + currentPlayer + ' up');
    } else {
      connection.send(route + ' ' + currentPlayer + ' up false');
    }
    if (keyDown) {
      connection.send(route + ' ' + currentPlayer + ' down');
    } else {
      connection.send(route + ' ' + currentPlayer + ' down false');
    }
    if (message.data.length === 1) {
      // if message data length is 1 then we are receiving player join info
      currentPlayer = message.data;
    } else if (message.data.substring(0, 5) === route && message.data.substring(6, 13) === 'message') {
      //if (message.data.substring(6, 13) === "message") {
      writeMsg(message.data.substring(14, message.data.length));
      //}
    } else if (message.data.substring(0, 1) == '{') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      var gameObjs = JSON.parse(message.data);
      if (gameObjs[route] != undefined) {
        console.log(gameObjs[route].puck);
        ctx.rect(gameObjs[route].puck.x, gameObjs[route].puck.y, gameObjs[route].puck.w, gameObjs[route].puck.h);
        if (gameObjs[route].puck.y <= 0 || gameObjs[route].puck.y >= 490) {
          var audio = new Audio('/audio/Glass_Error1.wav');
          audio.play();
        }
        if (gameObjs[route].puck.x === 100) {
          var audio = new Audio('/audio/Glass_Done5.wav');
          audio.play();
        }
        ctx.rect(
          gameObjs[route].leftpaddle.x,
          gameObjs[route].leftpaddle.y,
          gameObjs[route].leftpaddle.w,
          gameObjs[route].leftpaddle.h
        );
        ctx.rect(
          gameObjs[route].rightpaddle.x,
          gameObjs[route].rightpaddle.y,
          gameObjs[route].rightpaddle.w,
          gameObjs[route].rightpaddle.h
        );
        ctx.stroke();
        if (gameObjs[route].leftpaddle.score !== player1Score || gameObjs[route].rightpaddle.score !== player2Score) {
          $('#player1Score').empty();
          $('#player2Score').empty();
          $('#player1Score').append(gameObjs[route].leftpaddle.score);
          $('#player2Score').append(gameObjs[route].rightpaddle.score);
          player1Score = gameObjs[route].leftpaddle.score;
          player2Score = gameObjs[route].rightpaddle.score;
        }
        if (gameObjs[route].leftpaddle.score === 11) {
          readyButton.show();
        }
        if (gameObjs[route].rightpaddle.score === 11) {
          readyButton.show();
        }
      }
    }
  };
	
	msgModal.dialog({
		autoOpen: false,
		show: { effect: "slide", duration: 400 },
		hide: { effect: "slide", duration: 400 },
		draggable: false,
		height: 100
	});
	
	function writeMsg(message) {
		msgBody.empty();
		msgBody.append(message);
		msgModal.dialog('open');
		setTimeout(function(){
			msgModal.dialog('close');
		}, 3000);
	}
	
	writeMsg("Welcome to Game <em>" + route + "</em> !");
	
	$(window).on('unload', function(e) {
		if (currentPlayer < 3) {
			connection.send(route + ' ' + currentPlayer + ' disconnect');
		}
		else if (currentPlayer == 3 || currentPlayer == undefined) {
			connection.send(route + ' disconnect');
		}
	});
});