const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
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

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
	res.render('home');
});

app.post('/campgrounds', async (req, res) => {
	const campground = new Campground(req.body.campground);
  await campground.save();

	res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds', async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);

	res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const { id } = req.params;
	const campground = await Campground.findById(id);

  res.render('campgrounds/edit', { campground });
})

app.put('/campgrounds/:id', async(req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

  res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async(req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  res.redirect('/campgrounds');
})

app.listen(PORT, () => {
	console.log(`LISTENING ON PORT ${PORT}`);
});
