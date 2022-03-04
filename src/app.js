require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
// Route
const route = require('./routes')

const path = require('path')
// Swagger
const swaggerUi = require('swagger-ui-express')

// const swaggerJsDoc = require('swagger-jsdoc')

const YAML = require('yamljs')

const swaggerJsDoc = YAML.load(`${path.join(__dirname, './swagger.yaml')}`)

const { connectDB } = require('./config/db')

// Connect Database
connectDB()

// Config App
const app = express()
const port = process.env.PORT || 5000

// Config modul
app.use(express.json())

app.use(
	express.urlencoded({
		extended: true,
	})
)
app.use(cookieParser())

if (process.env.NODE_ENV !== 'production') {
	const morgan = require('morgan')
	app.use(morgan('combined'))
}

const corsOptions = {
	//To allow requests from client
	origin: `http://localhost:${port}`,
	credentials: true,
}

app.use(cors(corsOptions))

app.get('/', (req, res) => {
	res.redirect('/api-docs')
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsDoc))

// Route run
route(app)

// Run & lisen port
app.listen(port, () => {
	console.log(`App đang chạy ở port:${port}`)
})
