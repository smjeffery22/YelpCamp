if (process.env.NODE_ENV != 'production') {
	require('dotenv').config();
}

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const path = require('path');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo');

const ExpressError = require('./utils/ExpressError');
const User = require('./models/user')

const PORT = 3000;

const app = express();

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl);

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

const secret = process.env.SECRET || 'thisissecret'
const store = MongoDBStore.create({
	mongoUrl: dbUrl,
	secret: secret,
	touchAfter: 24 * 60 * 60
});

store.on('error', function (e) {
	console.log('Session store error', e);
})

const sessionConfig = {
	store,
	name: 'session',
	secret: secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	}
}

app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for all req/res
// properties attached is res.locals are available in all EJS views
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');

	next();
})

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', usersRoutes);

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
