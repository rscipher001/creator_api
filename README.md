## Brahma

A Code Generator

### How to run locally

- Clone both API and UI repository
- Create a folder named `Projects` parallel to UI and API folder (Can be configured using .env if you want another location)
- Install Vue CLI `npm install -g @vue/cli`

### Hosting Requirements

- Ensure `pm2` is installed globally
- Ensure MySQL is installed and credentials are set in .env file
- Ensure Nginx server is installed

## Glossary

Meaning of common words

#### Singleton

This item can only have one entry in the database, There are two types of singleton, Singleon being single doesn't support all 7 methods, Only the folowing api methods are supported by singleton

- GET /resource - Show: for getting it
- POST /resource - Store: for creating or updating it
- DELETE /resource - Destroy: for deleting it

#### Global Singleton

Global singleton is not related to anything, there is just one copy of it in enitire project like project name, email, contact, etc

#### Regular Singleton

Regular Singleton belongs to a table so it have one instance per entry in parent table, for example every user can have one profile so user profile is regular singleton, the max number of regular singleton will be same as number of it's parent.

## Route Parents

Route parents is used when two table have relations and route of child table is nested in route of parent table, For example

```js
// Parent route
Route.post('/project', 'API/ProjectsController.store')
Route.get('/project/:projectId', 'API/ProjectsController.show')

// Child route
Route.get('/project/:projectId/workers', 'API/WorkersController.index')
Route.post('/project/:projectId/workers', 'API/WorkersController.store')
Route.get('/project/:projectId/workers/:workerId', 'API/WorkersController.show')
```

In the above snippet you can see the routes for workers are nested inside project routes, it is adviced to avoid routes this but you can still create it to if you want.

## Port selection

- UI runs at 10K + projectId
- API proxy runs at 20K + projectId
- API runs at 30K + projectId
