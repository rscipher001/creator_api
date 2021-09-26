import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/login', 'API/AuthController.login')
  Route.post('/register', 'API/AuthController.register')
  Route.post('/logout', 'API/AuthController.logout')

  // Public API for downloading project
  Route.get('/project/:projectId/download/:type', 'API/ProjectsController.download').as('projectDownload')
}).prefix('/api')

Route.group(() => {
  Route.get('/me', 'API/AuthController.me')

  Route.get('/project', 'API/ProjectsController.index')
  Route.post('/project', 'API/ProjectsController.store')

  // Project link generate and download options
  Route.get('/project/:projectId/generate/:type', 'API/ProjectsController.generateSignedUrl').as('generateSignedUrl')
})
  .middleware(['auth'])
  .prefix('/api')
