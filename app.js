// Setup all the server stuff, http, express, and socket.io. You'll need to `npm install express socket.io` (http is included with Node)
var express = require('express');
var app = express();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);


/****** CONFIGURE EXPRESS ******/
app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'hjs'); // I'm using Hogan.js because I like Mustache, use whatever templating language you like. `npm install hogan` to get Hogan, though.
	app.use(express.favicon(__dirname + '/public/img/favicon.ico')); 
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use( express.static(__dirname + '/public') );
});

/****** CONFIGURE FOURSQUARE ******/
// My Foursquare API Key. Get your own at: http://developer.foursquare.com
var fourquareConfig = {
	'secrets' : {
		'clientId' : 'APP_CLIENT_ID',
		'clientSecret' : 'APP_CLIENT_SECRET',
		'redirectUrl' : 'REDIRECT_URL'
	}
};

// Require the Node module node-foursquare and populate it with my information. `npm install node-foursquare` to get started here.
var foursquare = require('node-foursquare')(fourquareConfig);

// Nextup, since this app is only for me, I load in my personal access token. (To get this you need to go through Foursquare's OAuth Flow.)
var foursquareAccessToken = 'MY_FOURSQUARE_ACCESS_TOKEN';

/****** CONFIGURE SENDGRID ******/
// Require the Official SendGrid Node module sendgrid. `npm install sendgrid` to get started here.
var SendGrid = require('sendgrid').SendGrid;

// Here, I load my API key into the SendGrid module.
var sendgrid = new SendGrid("SENDGRID_USERNAME", "SENDGRID_PASSWORD");


/****** GET THE PAGES READY ******/

// The main page is where all this data is displayed, so we'll grab Foursquare data when someone GETs /
app.get('/', function (req, res) {
	// Here we load my most recent checkin (to figure out where I am)
	foursquare.Users.getCheckins("self", { 'limit' : 1 }, foursquareAccessToken, function (err, checkins) {
		if(err) throw new Error(err);
		
		// Grab the location information of my most recent Foursquare checkin
		var location = checkins.checkins.items[0].venue.location;

		// Determine what we're asking Foursquare for.
		var attributes = {
			// Burgers sound good, let's get one of those. You could change this to a restaurant, hotel, tattoo parlor, or anything else you can think of.
			'query': 'burgers',
			// I decided to limit my search to five places, so folks didn't have too much to choose from, but you can make this whatever you like.
			'limit' : 5
		};

		// Get a list of venues from Foursquare, based upon my most recent checkin's location and the attributes set above.
		foursquare.Venues.explore(location.lat, location.lng, attributes, foursquareAccessToken, function (err, venues){

			// Extract the list of venues from all the data Foursquare returns.
			var venueList = venues.groups[0].items;

			// Since we're going to be voting on these, I need to give them some nice visual identifiers, I chose letters A-Z.
			for (var i = 0; i < venueList.length; i++) {
				venueList[i].visualId = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i];
			};

			// Prepare the information for rendering.
			var templateInformation = {
				'venues' : venueList
			};

			// Render!
			res.render('index', templateInformation);
		});
	});
});

// The webhook will POST emails to whatever endpoint we tell it, so here we setup the endpoint /email
app.post('/email', function (req, res) {
	
	// SendGrid gives us a lot of information, however, here we only need the person's email (to make sure they don't vote twice) and the subject which serves as their vote.
	// Note: Make sure you configure your app to use Express' Body Parse by doing: app.use(express.bodyParser());
	var email = {
		'from' : req.body.from,
		'subject': req.body.subject
	};

	// We send this information via Socket.io to the frontend which will tally the votes while it's open.
	// Note: Socket.io must be included and run, when you're starting your app.
	io.sockets.emit('email', email);
	
	// Extract the ONLY the email from the from field (e.g. remove "Nick Quinlan" from "Nick Quinlan <nick@sendgrid.com>")
	if(potentialFrom = req.body.from.match(/<(.+)>/)){
		var from = potentialFrom[1];
	}else{
		var from = req.body.from;
	}

	// Finally, I want to thank everyone who voted, luckily SendGrid also will send email for me. I just need to tell it what to send.
	sendgrid.send({
		to: from,
		from: 'nick@sendgrid.com',
		fromname: 'Nick Quinlan (SendGrid)',
		subject: 'Thanks for Helping Me Decide the Best Burger Place!',
		text:	'Hi!\n' +
				'Thanks for helping me pick where I should get a burger! Please let me know if you need any help with SendGrid!\n' +
				'--\n' +
				'Nick Quinlan'
	}, function(success, message) {
		// Note: The SendGrid doesn't give the typical (err, data) parameters of Node, and instead gives (success, message)

		if(!success) throw new Error(message);
	});
});


server.listen(app.get('port'), function(){
  console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});