const Joi = require('joi');
const joi = require('joi');

module.exports.campgroundSchema = joi.object({
	campground: joi
		.object({
			title: joi.string().required(),
			price: joi.number().required().min(0),
			// image: joi.string().required(),
			location: joi.string().required(),
			description: joi.string().required(),
		})
		.required(),
		deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		body: Joi.string().required(),
		rating: Joi.number().required().min(1).max(5),
	}).required(),
});
