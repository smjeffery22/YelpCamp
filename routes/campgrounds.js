const express = require('express');
const router = express.Router();

const { campgroundSchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../model/campground');
const { isLoggedIn } = require('../middleware');

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

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
	
	const campground = new Campground(req.body.campground);
	campground.author = req.user._id;	// req.user from passport => user property
	await campground.save();

	req.flash('success', 'Successfully created a new campground!')

	res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/', catchAsync(async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id).populate('reviews').populate('author');
	console.log(campground)
  if (!campground) {
    req.flash('error', 'Cannot find the campground!');
    return res.redirect('/campgrounds')
  }

	res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);

  if (!campground) {
    req.flash('error', 'Cannot find the campground!');
    return res.redirect('/campgrounds')
  }

	res.render('campgrounds/edit', { campground });
}));

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {
		...req.body.campground,
	});

  req.flash('success', 'Successfully updated campground!')

	res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);

  req.flash('success', 'Successfully deleted campground!')

	res.redirect('/campgrounds');
}));

module.exports = router;