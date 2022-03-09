const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const path = require('path');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const PORT = 3000;

const app = express();

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

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
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
	secret: 'thisissecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	}
}

app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');

	next();
})

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
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
