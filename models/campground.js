const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

// make a virtual property called thumbnail
// not actually saved in db, but performs it every time thumbnail is called
ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/c_thumb,w_200,g_face');
});

const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
	geometry: {
		type: {
			type: String,
			enum: ['Point'],
			required: true,
		},
		coordinates: {
			type: [Number],
			required: true,
		},
	},
	price: Number,
	description: String,
	location: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	reviews: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	]
}, opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
	return `
	<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
	<p>${this.description.substring(0, 20)}...</p>
	`
});

campgroundSchema.post('findOneAndDelete', async function (campground) {
	if (campground) {
		await review.deleteMany({ _id: { $in: campground.reviews } });
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
