const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { hashPassword } = require('../utils/processPassword')
const connectDB = async () => {
	try {
		const connection = await mongoose.connect(process.env.URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})

		// Check if collection user is empty then insert default admin account from admin-account.json
		const userModel = mongoose.model('User')

		const user = await userModel.count()

		if (!user || user === 0) {
			// Read file admin-account.json
			const adminAccount = await fs.readFileSync(
				path.join(__dirname, '../admin-account.json'),
				'utf8'
			)

			// Parse admin-account.json to object
			const adminAccountJson = JSON.parse(adminAccount)

			// Insert admin account to database
			adminAccountJson.map(async (adminAccount) => {
				const admin = new userModel({
					...adminAccount,
					password: await hashPassword(adminAccount.password, 10),
					role: 'admin',
				})

				await admin.save()
			})
		}

		connection
			? console.log('Kết nối DB thành công')
			: console.log('Kết nối DB thất bại')
	} catch (error) {
		console.log(error)
	}
}

module.exports = { connectDB }
