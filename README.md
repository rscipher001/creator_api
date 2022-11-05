## Brahma
A Code Generator

### How to run
- Clone both API and UI repository
- Create a folder named `Projects` parallel to UI and API folder (Can be configured using `.env` if you want another location) but keep it outside this project
- Install Vue CLI `npm install -g @vue/cli`

### (Alpha) Local Hosting Requirements
There is an option to host the project after generation, it was created so you can preview the project.

- Ensure `pm2` is installed globally
- Ensure MySQL is installed and credentials are set in .env file
- Ensure Nginx server is installed

## Glossary
Meaning of common words used in thie UI to help you use the project.

_NOTE_: Gloassary is being migrated to GitHub wiki with detailed explaination

#### Singleton
This item can only have one entry in the database, There are two types of singleton, Singleon being single doesn't support all 7 methods, Only the folowing api methods are supported by singleton

- `GET /resource` - Show: for getting it
- `POST /resource` - Store: for creating or updating it
- `DELETE /resource` - Destroy: for deleting it

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

## Using docker to setup mysql
Create a MySQL server using Docker container. The following command will create a MySQL container name `main-mysql` with `ravindra` as root password, feel free to change these to whatever you like

```bash
docker run --name main-mysql -e MYSQL_ROOT_PASSWORD=ravindra -p 3306:3306 -d mysql
```

To Stop the container use

```bash
docker stop main-mysql
```

To restart the container after system reboot use

```bash
docker start main-mysql
```

To get a shell into container to run commands use

```bash
docker exec -it main-mysql bash
```

Update the default MySQL user with the follwoing commands.

```bash
docker exec -it main-mysql bash
# You will get into container shell now type
mysql -uroot -p
# Press enter and type your MySQL password
```

```sql
-- Create database
CREATE DATABASE creator;
```

```SQL
-- Create user with native password (Required)
CREATE USER 'creator'@'%' IDENTIFIED WITH mysql_native_password BY 'creator';
GRANT ALL PRIVILEGES ON * . * TO 'creator'@'%';
FLUSH PRIVILEGES;
```
