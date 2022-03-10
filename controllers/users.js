const User = require('../models/user');

module.exports.register = async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const user = new User({ username, email });
		const registeredUser = await User.register(user, password);

		//await is not supported in req.login()
		req.login(registeredUser, (err) => {
			if (err) return next(err);

			req.flash('success', 'Welcome to Yelp Camp!');
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

module.exports.login = (req, res) => {
	// upon login, redirect user to the url the user was visiting
	const redirectUrl = req.session.returnTo || '/campgrounds';
	// delete returnTo from session upon login
	delete req.session.returnTo;

	req.flash('success', 'Welcome back!');
	res.redirect(redirectUrl);
};

module.exports.renderRegisterForm = (req, res) => {
	res.render('users/register');
};

module.exports.renderLoginForm = (req, res) => {
	res.render('users/login');
};

module.exports.logout = (req, res) => {
	req.logout();
	req.flash('success', 'You have been logged out.');
	res.redirect('/campgrounds');
};
