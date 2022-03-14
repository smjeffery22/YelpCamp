const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

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
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '62298ea70a2be7167b8759ed',
			location: `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore ut modi suscipit eum, odio incidunt inventore fuga quibusdam delectus soluta minus omnis maiores id natus saepe, architecto quos officia. Unde!',
			price,
			geometry: {
				type: 'Point',
				coordinates: [-122.3301, 47.6038],
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dqdbsinom/image/upload/v1646941251/YelpCamp/nmvc8wwtvpmvgcg60mhj.jpg',
					filename: 'YelpCamp/nmvc8wwtvpmvgcg60mhj',
				},
				{
					url: 'https://res.cloudinary.com/dqdbsinom/image/upload/v1646941251/YelpCamp/ysvqhawfhucy9mqgqucr.jpg',
					filename: 'YelpCamp/ysvqhawfhucy9mqgqucr',
				},
			],
		});

		await camp.save();
	}
};

seedDB().then(() => mongoose.connection.close());
