const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const PORT = 3000;

const Campground = require('./model/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected!');
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/makecampground', async (req, res) => {
	const camp = new Campground({ title: 'My Backyard', description: 'home camping' });
  await camp.save();

  res.send(camp);
});

app.listen(PORT, () => {
	console.log(`LISTENING ON PORT ${PORT}`);
});
