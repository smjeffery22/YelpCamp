const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }); // upload to the storage in Cloudinary

const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')
	.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
	.get(catchAsync(campgrounds.index))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));



module.exports = router;