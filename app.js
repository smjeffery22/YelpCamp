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

app.get('/campgrounds', async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);

	res.render('campgrounds/show', { campground });
});

app.listen(PORT, () => {
	console.log(`LISTENING ON PORT ${PORT}`);
});
