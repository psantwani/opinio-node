require('dotenv');
var Pusher = require('pusher');

var pusher = new Pusher({
    appId: process.env.appId,
	key: process.env.key,
	secret: process.env.secret,
	cluster: 'ap1',
	encrypted: true
});

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 61616;
var boys_array = [];
var lat_inc = 0.0001;
var long_inc = 0.0001;
var delay = 5000;
var keepCalling = true;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen(port, function(){
	console.log("Listening at port " + port);
});

app.get('/go', function(req, res){
	var start_lat = req.body.latitude;
	var start_long = req.body.longitude;
	var identifier = 0;
	var r = 7000/111300;
	for(var i = 0 ; i < 10; i++){
		var u = Math.random();
		var v = Math.random();
		w = r * Math.sqrt(u);
		t = 2 * Math.PI * v;
		x = w * Math.cos(t);
		y = w * Math.sin(t);
		x_corrected = x / Math.cos(start_lat);
		var newLat = start_lat + x_corrected;
		var newLon = start_long + y;
		boys_array.push([i+1,newLat, newLon]);
	}
	
	setTimeout(function () {
		keepCalling = false;
	}, 120*1000);

			
	for(var j = 0; j < boys_array.length; j++){
		start(boys_array[j]);
		if(j == boys_array.length - 1){
			res.send('Simulation started');
		}
	}

});


function start(boy_details){
	var coordinates = {
		latitude : Math.abs(boy_details[1]),
		longitude : Math.abs(boy_details[2]),
		time : Date.now() + 330*60000,
		identifier : boy_details[0]
	};
	pusherCall(coordinates);
}

function pusherCall(coordinates){
	pusher.trigger('lastlocation', 'data', {"message": coordinates});
	var timer = setTimeout(function(){
		if(keepCalling){
			tracker(coordinates);
		}
		else{
			clearInterval(timer);
		}
	},
	delay);
}

function tracker(coords){
	var new_lat = parseFloat(coords['latitude']) + lat_inc;
	var new_long = parseFloat(coords['longitude']) + long_inc;
	var identifier = coords['identifier'];
	var coordinates = {
		latitude : new_lat.toFixed(4),
		longitude : new_long.toFixed(4),
		time : Date.now() + 330*60000,
		identifier : identifier
	};
	pusherCall(coordinates);
}
