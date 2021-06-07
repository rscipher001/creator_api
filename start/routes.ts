import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/login', 'API/AuthController.login')
  Route.post('/register', 'API/AuthController.register')
  Route.post('/logout', 'API/AuthController.logout')
}).prefix('/api')

Route.group(() => {
  Route.get('/me', 'API/AuthController.me')
})
  .middleware(['auth'])
  .prefix('/api')
