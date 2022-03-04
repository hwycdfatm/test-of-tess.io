const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: 'user',
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
