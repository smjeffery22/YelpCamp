// middleware for checking if user is logged in
// to check if user is authorized
module.exports.isLoggedIn = (req, res, next) => {
	// add the url the user was visiting that redirected user to login page
	req.session.returnTo = req.originalUrl;

  if (!req.isAuthenticated()) {
		req.flash('error', 'You must sign in first to create new campground.');
		return res.redirect('/login');
	}
  next();
};