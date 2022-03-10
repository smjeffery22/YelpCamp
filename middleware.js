const Campground = require('./models/campground')
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

// middleware for checking if user is logged in
// to check if user is authorized
module.exports.isLoggedIn = (req, res, next) => {
	// add the url the user was visiting that redirected user to login page
	req.session.returnTo = req.originalUrl;

  if (!req.isAuthenticated()) {
		req.flash('error', 'You must sign in first.');
		return res.redirect('/login');
	}
  next();
};

// middleware for checking if user is authorized for certain actions
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	
	// error if not authorized to edit - prevents external edit such as postman
	if (!campground.author.equals(req.user._id)) {
		req.flash('error', 'Error - not authorized!');
		return res.redirect(`/campgrounds/${id}`);
	}

	next();
}

// not validation through Mongoose
// validation of data before data is sent to db
module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);

	if (error) {
		const msg = error.details.map(err => err.message).join(',')
		throw new ExpressError(msg, 400);
	}	else {
		// to continue the code in route handler
		next();
	}
};

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);

	if (error) {
		const msg = error.details.map(err => err.message).join(',')
		throw new ExpressError(msg, 400);
	}	else {
		// to continue the code in route handler
		next();
	}
};