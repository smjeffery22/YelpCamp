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

const campgroundSchema = new Schema({
	title: String,
	images: [ImageSchema],
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
	],
});

campgroundSchema.post('findOneAndDelete', async function (campground) {
	if (campground) {
		await review.deleteMany({ _id: { $in: campground.reviews } });
	}
});

module.exports = mongoose.model('Campground', campgroundSchema);
