const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')
	.post(isLoggedIn, validateCampground, catchAsync(campgrounds.renderNewForm))
	.get(catchAsync(campgrounds.index))

router.get('/new', isLoggedIn, campgrounds.createCampground);

router.route('/:id')
	.get(catchAsync(campgrounds.showCampground))
	.put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground));



module.exports = router;