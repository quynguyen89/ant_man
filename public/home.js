$(document).ready(function () {

	const host = window.location.host;
	
	var totalGames = 0;
	var totalPlayers = 0;
	var route = "";
	
	function makeid() {
     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
     for (var i = 0; i < 5; i++) {
        route += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    }
	
	function populateGameList() {
		$.ajax({
			url: "/games",
			type: 'GET',
			success: function(data) {
				$('#games').empty();
				$('#games').append(`
					<div class="table-head">
						<p class="col-1">Game ID</p>
						<p class="col-2">Players</p>
						<p class="col-3">Join / Spectate</p>
						<p class="col-3">Link Invite</p>
					</div>`);
        $('#games').append(`<div class="table-body">`);
        Object.keys(data).forEach(game => {
          var joinSpectate;
          totalGames++;
          totalPlayers += data[game].players;

          if (data[game].players > 1) joinSpectate = 'Spectate';
          else joinSpectate = 'Join';

          $('#games').append(`
						<div class="table-tr">
							<p class="col-1">${game}</p>
							<p class="col-2">(${data[game].players}/2)</p>
							<p class="col-3"><button class="btn btn-style-2 gameJoin" data-index=${game}>${joinSpectate}</button></<td>
							<p class="col-3"><button class="btn btn-style-2 linkJoin" data-index=${game}>Copy Link</button></<td>
						</tr>`);
        });
        // close table body
        $('#games').append(`</div>`);
				$('#status').empty();
				// $('#status').append(`Total number of games: ${totalGames} <br>
				// 					Players currently playing: ${totalPlayers}`);
				
				$('.gameJoin').each(function() {
					$(this).on("click", function(event){
						event.preventDefault();
						var gameRoute = $(this).data('index');
						window.location.href = '/' + gameRoute;
						//console.log(gameNum);
					});
				});

				$('.linkJoin').each(function() {
					$(this).on("click", function(event){
						event.preventDefault();
						var gameRoute = $(this).data('index');
						
						var text = `${host}/${gameRoute}`;

						  const textInput = document.createElement('textarea');
						  textInput.innerHTML = text;
						  
						var	parentEl = document.body;
						  
						  parentEl.appendChild(textInput);
						  textInput.select();
						  document.execCommand('copy');
						  parentEl.removeChild(textInput);

						  $(this).text('Copied');
					});
				});
			}
		});
	}
	
	populateGameList();
	
	setInterval(function(){ 
		populateGameList();
	}, 60000);
	
	
	$('#createGame').on('click', function() {
		makeid();
		window.location.href = '/' + route;
	});
});