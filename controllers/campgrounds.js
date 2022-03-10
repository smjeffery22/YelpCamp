const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});

	res.render('campgrounds/index', { campgrounds });
};

module.exports.createCampground = async (req, res, next) => {
	const campground = new Campground(req.body.campground);

	// pull out image url and filename from req.files
	// store in array then add to Campground model
	campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
	campground.author = req.user._id; // req.user from passport => user property
	await campground.save();
	console.log('------------', campground);
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

  req.flash('success', 'Successfully updated campground!')

	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);

  req.flash('success', 'Successfully deleted campground!')

	res.redirect('/campgrounds');
};