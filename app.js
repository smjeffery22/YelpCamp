const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/ExpressError');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const PORT = 3000;

const Campground = require('./model/campground');
const Review = require('./model/review');
const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected!');
});

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// not validation through Mongoose
// validation of data before data is sent to db
const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map(err => err.message).join(',')
		throw new ExpressError(msg, 400);
	}	else {
		// to continue the code in route handler
		next();
	}
};

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map(err => err.message).join(',')
		throw new ExpressError(msg, 400);
	}	else {
		// to continue the code in route handler
		next();
	}
}

app.get('/', (req, res) => {
	res.render('home');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
	// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
	
	const campground = new Campground(req.body.campground);
	await campground.save();
	console.log(campground)

	res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds', catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id).populate('reviews');

	res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);

	res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});

	res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);

	res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	console.log('---------', review)
	campground.reviews.push(review);
	await  review.save();
	await campground.save();

	res.redirect(`/campgrounds/${campground._id}`);
}))

app.all('*', (req, res, next) => {
	next(new expressError('Page Not Found', 404));
})

// error handler
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Something went wrong!';

	res.status(statusCode).render('error', { err });
	res.send('Error!');
});

app.listen(PORT, () => {
	console.log(`LISTENING ON PORT ${PORT}`);
});
