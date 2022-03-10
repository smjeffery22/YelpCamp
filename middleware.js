// middleware for checking if user is logged in
// to check if user is authorized
module.exports.isLoggedIn = (req, res, next) => {
	req.session.returnTo = req.originalUrl;

  if (!req.isAuthenticated()) {
		req.flash('error', 'You must sign in first to create new campground.');
		return res.redirect('/login');
	}
  next();
};