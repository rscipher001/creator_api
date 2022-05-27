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

This item can only have one entry in the database, There are two types of singleton, Singleton being single doesn't support all 7 methods, Only the following api methods are supported by singleton

- GET /resource - Show: for getting it
- POST /resource - Store: for creating or updating it
- DELETE /resource - Destroy: for deleting it

#### Global Singleton

Global singleton is not related to anything, there is just one copy of it in the entire project like project name, email, contact, etc

#### Regular Singleton

Regular Singleton belongs to a table so it has one instance per entry in the parent table, let's say every user can have one profile so the user profile is a regular singleton, the max number of regular singleton will be the same as the number of its parent.

## Route Parents

Route parents are used when two tables have relations and route of child table is nested in route of parent table, For example

```js
// Parent route
Route.post('/project', 'API/ProjectsController.store')
Route.get('/project/:projectId', 'API/ProjectsController.show')

// Child route
Route.get('/project/:projectId/workers', 'API/WorkersController.index')
Route.post('/project/:projectId/workers', 'API/WorkersController.store')
Route.get('/project/:projectId/workers/:workerId', 'API/WorkersController.show')
```

In the above snippet, you can see the routes for workers are nested inside project routes, it is advised to avoid routes nested routing but you can still create it if you want.

## Port selection

- UI runs at 10K + projectId
- API proxy runs at 20K + projectId
- API runs at 30K + projectId

## How Payment works

- Every payment system has a preparation stage
- A webhook for verification
- Middle steps based on the payment platform

## How Stripe Payment Works

- Create a payment intent
- Send payment intent to front-end and generate UI
- Complete payment from front-end and wait from webhook on the back-end
- On webhook, verify payment intent and complete payment

## How to test stripe payments locally

- Install stripe CLI: https://stripe.com/docs/stripe-cli
- Stripe login: `stripe login`
- Listen to webhooks in local: `stripe listen --forward-to localhost:3000/api/webhook/stripe`

## Automated Test cases

- CodeOne: One table called countries with name and description (Done)
- CodeTWo: One table called Forms with all types of fields
- CodeThree: One table that belongs to the user
- CodeFour: One table belongs to the user and another table like the state
- CodeFive: One table belongs to the user and another table like state and uses parent routes
- CodeFix: Two tables with many-to-many relations
- CodeSeven: Two tables with many-to-many relations and both belong to the user
- CodeEight: One table with storage.
- CodeNineOne global singleton
- CodeTen: One singleton to the user
- CodeEleven: One singleton that belongs to another table
- All the above tables with RBAC and without RBAC
- All the above tables with and without mailer
- All the above tables with different databases
