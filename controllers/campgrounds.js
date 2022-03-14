const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudinary');

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds/index', { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
	const geoData = await geocoder.forwardGeocode({
		query: req.body.campground.location,
		limit: 1
	}).send();

	// geoData.body.features[0].geometry
	//	returns GeoJSON
	// geoData.body.features[0].geometry.coordinates
	//	returns [longitude, latitude]
	// res.send(geoData.body.features[0].geometry);

	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	// pull out image url and filename from req.files
	// store in array then add to Campground model
	campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
	campground.author = req.user._id; // req.user from passport => user property
	
	await campground.save();
 
	req.flash('success', 'Successfully created a new campground!');

	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.showCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id)
		.populate({
			path: 'reviews',  // for reviews array for Campground
			populate: {
				path: 'author', // populate author for reviews
			},
		})
		.populate('author'); // populate author for campground
	console.log(campground.reviews);
	// error if no such campground exists
	if (!campground) {
		req.flash('error', 'Cannot find the campground!');
		return res.redirect('/campgrounds');
	}

	res.render('campgrounds/show', { campground });
};

module.exports.renderEditCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);

  if (!campground) {
    req.flash('error', 'Cannot find the campground!');
    return res.redirect('/campgrounds')
  }

	res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async (req, res) => {
	const { id } = req.params;
	const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground,});
	const images = req.files.map(file => ({ url: file.path, filename: file.filename }))

	// push new image to existing images array
	campground.images.push(...images)
	await campground.save();

	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			// delete from cloudinary
			await cloudinary.uploader.destroy(filename);
		}
		// pull from images array that matches the filename in deleteImages array
		// selected images to delete are stored in deleteImages array in campground model
		await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
	}

  req.flash('success', 'Successfully updated campground!')

	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);

  req.flash('success', 'Successfully deleted campground!')

	res.redirect('/campgrounds');
};