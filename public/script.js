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

  const host = window.location.host;
  const socketProtocal = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socketServer = `${socketProtocal}://${host}`;

  connection = new WebSocket(socketServer);
  route = window.location.pathname.replace('/', '');

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
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 225, 10, 50);
  ctx.fillRect(740, 225, 10, 50);

  ctx.fillStyle = "#fcf803";
  ctx.fillRect(375, 240, 10, 10);

  var dot = new Image();
  dot.src = '/img/dot.png';
  var reddot = new Image();
  reddot.src = '/img/reddot.png';
  //   ctx.drawImage(dot , 25, 485, 8, 8);
  //         ctx.drawImage(dot , 60, 485, 8, 8);
  //         ctx.drawImage(dot , 95, 485, 8, 8);
  //         ctx.drawImage(dot , 130, 485, 8, 8);
  //         ctx.drawImage(dot , 165, 485, 8, 8);
  //         ctx.drawImage(dot , 200, 485, 8, 8);
  //         ctx.drawImage(dot , 235, 485, 8, 8);
  //         ctx.drawImage(dot , 270, 485, 8, 8);
  //         ctx.drawImage(dot , 305, 485, 8, 8);
  //         ctx.drawImage(dot , 340, 485, 8, 8);
  //         //ctx.drawImage(dot , 375, 485, 8, 8);
  //         ctx.drawImage(dot , 405, 485, 8, 8);
  //         ctx.drawImage(dot , 440, 485, 8, 8);
  //         ctx.drawImage(dot , 475, 485, 8, 8);
  //         ctx.drawImage(dot , 510, 485, 8, 8);
  //         ctx.drawImage(dot , 545, 485, 8, 8);
  //         ctx.drawImage(dot , 580, 485, 8, 8);
  //         ctx.drawImage(dot , 68, 485, 8, 8);
  //         ctx.drawImage(dot , 650, 485, 8, 8);
  //         ctx.drawImage(dot , 685, 485, 8, 8);
  //         ctx.drawImage(dot , 720, 485, 8, 8);

  ctx.stroke();

  var player1Total = 0;
  var player2Total = 0;

  var h = new Image();
  h.src = '/img/h.png';
  var a = new Image();
  a.src = '/img/a.png';
  var t = new Image();
  t.src = '/img/t.png';

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
    if(message.data.substring(0, 5) === route && message.data.substring(6, 13) === 'message' && message.data.substring(14, message.data.length) === 'Player 1 wins!'){
        showIronManDung();
        return;
    }
    if(message.data.substring(0, 5) === route && message.data.substring(6, 13) === 'message' && message.data.substring(14, message.data.length) === 'Player 2 wins!'){
        showIronManNam();
        return;
    }

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
        ctx.fillStyle = "#fcf803";
        ctx.fillRect(gameObjs[route].puck.x, gameObjs[route].puck.y, gameObjs[route].puck.w, gameObjs[route].puck.h);
        if (gameObjs[route].puck.y <= 0 || gameObjs[route].puck.y >= 490) {
          var audio = new Audio('/audio/Glass_Error1.wav');
          audio.play();
        }
        if (gameObjs[route].puck.x === 100) {
          var audio = new Audio('/audio/Glass_Done5.wav');
          audio.play();
        }

        ctx.fillStyle = "#fff";
        ctx.fillRect(
          gameObjs[route].leftpaddle.x,
          gameObjs[route].leftpaddle.y,
          gameObjs[route].leftpaddle.w,
          gameObjs[route].leftpaddle.h
        );
        ctx.fillRect(
          gameObjs[route].rightpaddle.x,
          gameObjs[route].rightpaddle.y,
          gameObjs[route].rightpaddle.w,
          gameObjs[route].rightpaddle.h
        );
        ctx.stroke();
        if (gameObjs[route].leftpaddle.score !== player1Score || gameObjs[route].rightpaddle.score !== player2Score) {
          // $('#player1Score').empty();
          // $('#player2Score').empty();
          // $('#player1Score').append(gameObjs[route].leftpaddle.score);
          // $('#player2Score').append(gameObjs[route].rightpaddle.score);

          //huy - detect if player1 gains one point 
          if(gameObjs[route].leftpaddle.score === (player1Score + 1) && currentPlayer===1){
            //play audio thang 1 diem
            thang1diem();
          } 
          else {
            //play audio thua 1 diem
            thua1diem();
          }

          //huy - detect if player2 gains one point 
          if(gameObjs[route].rightpaddle.score === (player2Score + 1) && currentPlayer===2){
            //play audio thang 1 diem
            thang1diem();
          } 
          else {
            //play audio thua 1 diem
            thua1diem();
          }	

          player1Score = gameObjs[route].leftpaddle.score;
          player2Score = gameObjs[route].rightpaddle.score;
        }
        $('#total').empty();
        var totalString = `<span>${gameObjs[route].leftpaddle.total}</span><span class="strick"> - </span><span>${gameObjs[route].rightpaddle.total}</span>`;
        $('#total').append(totalString);
        if (gameObjs[route].leftpaddle.score === 11) {
          // $('#total').empty();
          // var totalString = `<span>${gameObjs[route].leftpaddle.total}</span><span class="strick"> - </span><span>${gameObjs[route].rightpaddle.total}</span>`;
          // $('#total').append(totalString);
          readyButton.show();
        }
        if (gameObjs[route].rightpaddle.score === 11) {
          // var totalString = `<span>${gameObjs[route].leftpaddle.total}</span><span class="strick"> - </span><span>${gameObjs[route].rightpaddle.total}</span>`;
          // $('#total').append(totalString);
          readyButton.show();
        }
      }
    }

    draw(player1Score, player2Score);
  };

  msgModal.dialog({
    autoOpen: false,
    show: {effect: 'slide', duration: 400},
    hide: {effect: 'slide', duration: 400},
    draggable: false,
    height: 100,
  });

  function writeMsg(message) {
    msgBody.empty();
    msgBody.append(message);
    msgModal.dialog('open');
    setTimeout(function () {
      msgModal.dialog('close');
    }, 3000);
  }

  //writeMsg('Welcome to Game <em>' + route + '</em> !');

  $(window).on('unload', function (e) {
    if (currentPlayer < 3) {
      connection.send(route + ' ' + currentPlayer + ' disconnect');
    } else if (currentPlayer == 3 || currentPlayer == undefined) {
      connection.send(route + ' disconnect');
    }
  });

  function draw(score1, score2) {
    var ax = (score1 * 300) / 11;
    var tx = 690 - (score2 * 280) / 11;
    ctx.drawImage(a, ax, 400, 50, 100);
    ctx.drawImage(t, tx, 380, 50, 120);
    ctx.drawImage(h, 350, 400, 64, 100);

    ctx.drawImage(reddot, 27, 485, 12, 12);
    ctx.drawImage(reddot, 54, 485, 12, 12);
    ctx.drawImage(reddot, 81, 485, 12, 12);
    ctx.drawImage(reddot, 109, 485, 12, 12);
    ctx.drawImage(reddot, 136, 485, 12, 12);
    ctx.drawImage(reddot, 163, 485, 12, 12);
    ctx.drawImage(reddot, 190, 485, 12, 12);
    ctx.drawImage(reddot, 218, 485, 12, 12);
    ctx.drawImage(reddot, 245, 485, 12, 12);
    ctx.drawImage(reddot, 272, 485, 12, 12);
    ctx.drawImage(reddot, 300, 485, 12, 12);

    ctx.drawImage(dot, 450, 485, 12, 12);
    ctx.drawImage(dot, 477, 485, 12, 12);
    ctx.drawImage(dot, 504, 485, 12, 12);
    ctx.drawImage(dot, 531, 485, 12, 12);
    ctx.drawImage(dot, 558, 485, 12, 12);
    ctx.drawImage(dot, 585, 485, 12, 12);
    ctx.drawImage(dot, 612, 485, 12, 12);
    ctx.drawImage(dot, 639, 485, 12, 12);
    ctx.drawImage(dot, 666, 485, 12, 12);
    ctx.drawImage(dot, 693, 485, 12, 12);
    ctx.drawImage(dot, 720, 485, 12, 12);
  }
});


const showIronManDung = () => {
    $('.container').hide();
    $('#iron-man-dung').fadeIn(2000);
  };
  
  const showIronManNam = () => {
    $('.container').hide();
    $('#iron-man-nam').fadeIn(2000);
  };

  //huy - audio play function
function cham()
{
  var audio = new Audio('./audio/cham.wav');
      audio.play();
}

function thang1diem()
{
  var audio = new Audio('./audio/thang1diem.wav');
      audio.play();
}

function thua1diem()
{
  var audio = new Audio('./audio/thua1diem.wav');
      audio.play();
}

function thang1set()
{
  var audio = new Audio('./audio/thang1set.wav');
      audio.play();
}

function thua1set()
{
  var audio = new Audio('./audio/thua1set.wav');
      audio.play();
}

function thang()
{
  var audio = new Audio('./audio/thang.wav');
      audio.play();
}

function thua()
{
  var audio = new Audio('./audio/thua.wav');
      audio.play();
}