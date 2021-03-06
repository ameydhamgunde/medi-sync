const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const bodyParser = require('body-parser');
const FitbitApiClient = require('fitbit-node');
const https = require('https');

var access_token, user_id, scope, token_type, expires_in;

const firebaseApp = firebase.initializeApp(functions.config().firebase);
const database = firebase.database();

const app = express();
const client = new FitbitApiClient({clientId: '22D59S', clientSecret: '593fa72b8cacede4644a48c0ff53f8dd', apiVersion: '1.2'});
app.use(express.static('views'));
app.use(express.static('node-modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('landing');
  // render a signup page instead?
});
app.get('/auth', (req, res) => {
  let url = 'https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22D59S&redirect_uri=https%3A%2F%2Fechacks-892cd.firebaseapp.com%2Fcallback&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800';
  res.redirect(url);
});
app.get('/callback', (req, res) => {
  res.render('callback');
});
app.get('/dashboard/*', (req, res) => {
  let userId = req.url.substring(11);
  let ref = database.ref('users/' + userId);
  ref.on('value', snapshot => {
    let data = snapshot.val();
    data.sleep.summary.totalMinutesAsleep = Math.floor(data.sleep.summary.totalMinutesAsleep/60);
    res.render('index', {'data': data, 'jsonstring': JSON.stringify(data)});
  });
});

exports.app = functions.https.onRequest(app);
