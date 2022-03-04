const User = require('../models/userModel')
const { hashPassword, comparePassword } = require('../utils/processPassword')
const jwt = require('jsonwebtoken')

const userController = {
	register: async (req, res) => {
		try {
			const { fullName, username, password } = req.body

			const user = await User.findOne({ username })
			if (user)
				return res
					.status(400)
					.json({ status: 'Failed', message: 'Tài khoản đã tồn tại.' })

			if (password.length < 6)
				return res
					.status(400)
					.json({ status: 'Failed', message: 'Mật khẩu tối thiểu 6 ký tự' })

			// Hash Password
			const passwordHash = await hashPassword(password)
			const newUser = new User({
				username,
				fullName,
				password: passwordHash,
			})

			// Lưu vào database
			await newUser.save()

			// Tạo ACCESS TOKEN
			const accessToken = createAccessToken({ id: newUser._id })
			const refreshToken = createRefreshToken({ id: newUser._id })

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				path: '/user/refresh_token',
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite: 'none',
				secure: true,
			})

			return res.status(200).json({
				status: 'Success',
				message: 'Đăng ký thành công',
				accessToken,
			})
		} catch (error) {
			return res.status(500).json({ message: error.message })
		}
	},

	login: async (req, res) => {
		try {
			const { username, password } = req.body

			const user = await User.findOne({ username })

			if (!user)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Thông tin đăng nhập không hợp lệ' })

			const mathPassword = await comparePassword(password, user.password)

			if (!mathPassword)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Thông tin đăng nhập không hợp lệ' })

			// Tạo ACCESS TOKEN
			const accessToken = createAccessToken({ id: user._id })
			const refreshToken = createRefreshToken({ id: user._id })

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				path: '/user/refresh_token',
				maxAge: 7 * 24 * 60 * 60 * 1000,
				sameSite: 'none',
				secure: true,
			})

			return res.status(200).json({
				status: 'Success',
				message: 'Đăng nhập thành công',
				accessToken,
			})
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},

	refreshToken: (req, res) => {
		try {
			const refreshToken = req.cookies.refreshToken
			if (!refreshToken)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Vui lòng đăng nhập hoặc đăng ký' })
			jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET,
				(error, user) => {
					if (error)
						return res.status(419).json({
							status: 'Fail',
							message: 'Vui lòng đăng nhập hoặc đăng ký',
						})
					const accessToken = createAccessToken({ id: user.id })
					return res.status(200).json({ user, accessToken })
				}
			)
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},

	info: async (req, res) => {
		try {
			const user = await User.findById(req.user.id).select('-password')

			if (!user)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Tài khoản không tồn tại' })

			return res.status(200).json({ user })
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},

	logout: async (req, res) => {
		try {
			res.clearCookie('refreshToken', { path: '/user/refresh_token' })
			return res
				.status(200)
				.json({ status: 'Success', message: 'Đăng xuất thành công!' })
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},

	getAllUsers: async (req, res) => {
		try {
			const sort = req.query.sort || '-createdAt'

			// Pagination
			const _limit = parseInt(req.query._limit) || 20
			const _page = parseInt(req.query._page) || 1
			const _skip = (_page - 1) * _limit

			const allUsers = await User.find()
				.sort(sort)
				.skip(_skip)
				.limit(_limit)
				.select('-password')

			const _total_User = await User.count()

			const _total_Page = Math.ceil(_total_User / _limit)

			if (!allUsers || allUsers.length == 0)
				return res
					.status(404)
					.json({ status: 'Fail', message: 'Không có user nào ở trang này' })

			return res.status(200).json({
				users: allUsers,
				pagination: { _page, _total_Page, _total_User },
			})
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},

	updateProfile: async (req, res) => {
		try {
			const { username, fullName } = req.body

			const _id = req.user.id

			const userCheck = await User.findOne({ username })

			if (userCheck) {
				const idUserCheck = userCheck._id.toString()

				console.log(idUserCheck, _id)
				if (idUserCheck !== _id)
					return res
						.status(400)
						.json({ status: 'Fail', message: 'Tên đăng nhập đã tồn tại' })

				if (userCheck.username === username)
					return res
						.status(400)
						.json({ status: 'Fail', message: 'Thông tin không thay đổi' })
			}

			const resultUpdateUser = await User.findByIdAndUpdate(_id, {
				username,
				fullName,
			})

			if (!resultUpdateUser)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Có lỗi xảy ra rồi' })

			return res
				.status(200)
				.json({ status: 'Success', message: 'Cập nhật thông tin thành công' })
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},

	deleteUser: async (req, res) => {
		try {
			const _id = req.params.id
			if (!_id)
				return res
					.status(400)
					.json({ status: 'Fail', message: 'Không có user nào được chọn' })

			const user = await User.deleteOne({ _id })
			if (!user)
				return res
					.status(404)
					.json({ status: 'Fail', message: 'Có lỗi xảy ra' })
			return res
				.status(200)
				.json({ status: 'Success', message: 'Xóa thành công' })
		} catch (error) {
			return res.status(500).json({ status: 'Fail', message: error.message })
		}
	},
}

const createAccessToken = (user) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
}

const createRefreshToken = (user) => {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

module.exports = userController
