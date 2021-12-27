import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/login', 'API/AuthController.login')
  Route.post('/register', 'API/AuthController.register')

  // Public API for downloading project
  Route.get('/project/:id/download/:type', 'API/ProjectsController.download').as('projectDownload')

  // Email verification
  Route.post('/email/verify', 'API/EmailVerificationController.verifyEmail')
  Route.post('/email/update', 'API/EmailVerificationController.updateEmail')

  // Route forgot password
  Route.post('/password/forget/request', 'API/PasswordResetController.sendResetEmail')
  Route.post('/password/forget/verify', 'API/PasswordResetController.verifyToken')
  Route.post('/password/forget/update', 'API/PasswordResetController.updatePassword')
}).prefix('/api')

Route.group(() => {
  Route.get('/me', 'API/AuthController.me')
  Route.post('/logout', 'API/AuthController.logout')

  // Email verification
  Route.post('/email/resend', 'API/EmailVerificationController.resendEmail')
})
  .middleware(['auth'])
  .prefix('/api')

Route.group(() => {
  // Profile routes
  Route.post('/profile', 'API/ProfileController.updateProfile')
  Route.get('/profile/account', 'API/ProfileController.getAccount')
  Route.post('/profile/account', 'API/ProfileController.updateAccount')
  Route.delete('/profile/account', 'API/ProfileController.deleteAccount')
  Route.post('/profile/password', 'API/ProfileController.updatePassword')
  Route.post('/profile/avatar', 'API/ProfileController.updateAvatar')

  Route.get('/project', 'API/ProjectsController.index')
  Route.post('/project', 'API/ProjectsController.store')
  Route.get('/project/:id', 'API/ProjectsController.show')
  Route.delete('/project/:id', 'API/ProjectsController.destroy')

  Route.post('/draft/project', 'API/ProjectsController.storeDraft')
  Route.put('/draft/project/:id', 'API/ProjectsController.updateDraft')
  Route.post('/draft/project/:id/generate', 'API/ProjectsController.generateDraft')

  // Project link generate and download options
  Route.get('/project/:id/generate/:type', 'API/ProjectsController.generateSignedUrl').as(
    'generateSignedUrl'
  )
})
  .middleware(['auth', 'ensureEmailIsVerified'])
  .prefix('/api')
