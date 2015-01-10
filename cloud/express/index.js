var express = require('express')
var app = express()

// Set Master Key
Parse.Cloud.useMasterKey()

// Routes
var routes = {
  core: require("cloud/express/routes/index.js"),
  api: require("cloud/express/routes/api.js"),
}

// Global app configuration section
app.set('views', 'cloud/express/views')
app.set('view engine', 'ejs')
app.enable('trust proxy')

// Configure express routes
app.use(express.bodyParser())
app.use(express.cookieParser())
app.use(express.cookieSession({
  secret: 'ursid',
  cookie: {
      httpOnly: true
  }
}))
app.use(function(req, res, next) {
  res.successT = function(data) {
    data = data || {}
    data.success = true
    res.json(data)
  }

  res.errorT = function(error) {
    error = error.description || error

    res.json({
      success: false,
      status: 1,
      message: error
    })
  }

  res.renderT = function(template, data) {
    data = data || {}
    data.host = req.protocol + "://" + req.host
    data.url = data.host + req.url
    data.template = template
    data.random = Math.random().toString(36).slice(2)
    res.render(template, data)
  }

  next()
})

// Landing
app.get('/', routes.core.auth, routes.core.home)
app.get('/logout', routes.core.logout)
app.post('/login', routes.core.login)

// API
app.get('/api/workers', routes.api.auth, routes.api.get.workers)
app.get('/api/workers/pending', routes.api.auth, routes.api.get.pendingWorkers)
app.post('/api/jobs', routes.api.post.jobs)
app.get('/api/jobstatus', routes.api.get.jobStatus)
// Not Found Redirect
app.all("*", routes.core.notfound)

// Listen to Parse
app.listen()
