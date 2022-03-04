const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const auth = (req, res, next) => {
	try {
		const token = req.header('Authorization')
		if (!token)
			return res
				.status(403)
				.json({ status: 'notauth', message: 'Bạn không có quyền truy cập !' })

		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, user) => {
			if (error)
				return res
					.status(419)
					.json({ status: 'exptoken', message: 'Bạn đã hết phiên đang nhập' })
			const userFromDB = await User.findOne({
				_id: user.id,
			})
			if (!userFromDB)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Tài khoản bạn bị gì rồi!' })

			req.user = userFromDB
			next()
		})
	} catch (error) {
		return res.status(500).json({ status: 'Fail', message: error.message })
	}
}

module.exports = auth
