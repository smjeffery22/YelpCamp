const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../model/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected!');
});

// to return a random element from the array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	// delete all documents in Campground model
	await Campground.deleteMany({});

	// create 50 random campsites
	for (let i = 0; i < 50; i++) {
		const randomNumber = Math.floor(Math.random() * 1000);
		const camp = new Campground({
			location: `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
		});

		await camp.save();
	}
};

seedDB().then(() => mongoose.connection.close());
