$(document).ready(function () {
//chạm trên -> cham.wav
//thắng 1 điểm -> thang1diem.wav
//thua 1 điểm -> thua1diem.wav
//thắng 1 set -> thang1set.wav
//thua 1 set -> thua1set.wav
//thắng game -> thang.wav
//thua game -> thua.wav (edited)

function cham()
{
	var audio = new Audio('/audio/cham.wav');
			audio.play();
}

function thang1diem()
{
	var audio = new Audio('/audio/thang1diem.wav');
			audio.play();
}

function thua1diem()
{
	var audio = new Audio('/audio/thua1diem.wav');
			audio.play();
}

function thang1set()
{
	var audio = new Audio('/audio/thang1set.wav');
			audio.play();
}

function thua1set()
{
	var audio = new Audio('/audio/thua1set.wav');
			audio.play();
}

function thang()
{
	var audio = new Audio('/audio/thang.wav');
			audio.play();
}

function thua()
{
	var audio = new Audio('/audio/thua.wav');
			audio.play();
}

});