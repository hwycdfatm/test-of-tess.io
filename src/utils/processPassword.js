const bcrypt = require('bcrypt')

const processPassword = {
	hashPassword: (password) => {
		return bcrypt.hash(password, 10)
	},
	comparePassword: (password, passwordHash) => {
		return bcrypt.compare(password, passwordHash)
	},
}

module.exports = processPassword
