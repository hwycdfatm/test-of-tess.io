const router = require('express').Router()
// Controller
const userController = require('../controllers/userController')

// Authentication Middleware
const auth = require('../middlewares/auth')
const authAdmin = require('../middlewares/authAdmin')

// Đăng ký
router.post('/register', userController.register)

// Đăng nhập
router.post('/login', userController.login)

// Lấy thông tin người dùng
router.get('/info', auth, userController.info)

// Cập nhật thông tin
router.put('/info', auth, userController.updateProfile)

// Đăng xuất
router.get('/logout', userController.logout)

// Tạo mới token
router.get('/refresh_token', userController.refreshToken)

// Admin xóa tài khoản
router.delete('/:id', auth, authAdmin, userController.deleteUser)

// Admin lấy tất cả tài khoản
router.get('/all', auth, authAdmin, userController.getAllUsers)

module.exports = router
