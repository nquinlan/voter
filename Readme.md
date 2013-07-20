# Voter - Social Voting By Email
A way to vote for a venue to get a burger (or anything else) by email. This app lends itself very well to presentations, but it could also be used on screens in offices (for where to get lunch) or for personal use.

People vote by sending emails to your app with the letter of the venue as the subject of the email.

## How To Use
To use, clone the repo to somewhere web accessable and:

	npm install
	node app.js

Then go to the [Parse Webhook section of the SendGrid control panel](). Enter your app's information (namely to POST data to `YOURDOMAIN.TLD/email`), and point your MX record to `mx.sendgrid.net`.

## Technology & Requirements
This app uses two APIs and a bunch of great open source software. It's been tested on Chrome OSX & Node.js (`0.10.13` and `0.9.12`).

### APIs

* [**SendGrid**](http://sendgrid.com/docs/) - Voter uses [SendGrid](http://sendgrid.com/) to [send](http://github.com/sendgrid/sendgrid-nodejs) and [recieve](http://sendgrid.com/docs/API_Reference/Webhooks/parse.html) email.
* [**Foursquare**](http://developer.foursquare.com/) - [Foursquare](http://foursquare.com) is used to get the user's [most recently shared location](https://developer.foursquare.com/docs/users/checkins) and a [list of suggested venues](https://developer.foursquare.com/docs/venues/explore).

### Open Source

* [**Express.js**](http://expressjs.com) - Express.js is an awesome Node.js framework that makes [creating webapps](http://expressjs.com/guide.html) easy.
* [**Socket.io**](http://socket.io) - Socket.io ferries recieved emails [from the backend to the frontend](http://socket.io/#how-to-use) of the app.
* [**Hogan.js**](twitter.github.io/hogan.js/) - Hogan allows for [Mustache templating](http://mustache.github.io/mustache.5.html) in Node.