module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
		req.flash('error', 'You must sign in first to create new campground.');
		return res.redirect('/login');
	}
  next();
};

