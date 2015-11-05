# Deployment and database seeding for dateworthy.io 

### Table of Contents

1. [Google doc](#google-doc)
1. [Deployment checklist](#deployment-checklist)
2. [Database seeding](#database-seeding)
	3. [Local database](#local-database)
	4. [Remote database](#remote-database)
  
---

## Google Doc
Everything important is inside our [Google doc](https://docs.google.com/document/d/1hLsHVSTivqIZ6y1wY4a5Bix3MrffpOhbls-q7IvbhQA/edit#).
If you do not have permissions to read or edit it, please contact us (message @jessicalc) and we can add you. 

# Deployment checklist

### 1. Check out a new branch from master
**Don't forget to rebase first!!!** 

You can call it feat/heroku_deployment_[date]. 

Ideal steps would be: 

```
git checkout master
git pull --rebase upstream master
git checkout -b feat/heroku_deployment_[date]
```

### 2. Run gulp from project root
```
gulp
``` 
This will concatenate and minify our js. 
Optionally, you can remove the commented-out `<script srcs>` in the `<head>` of `dateClient/www/index.html`. (They're there to help us develop, but don't need to be there in the deployed index.html file)

### 3. Update dateServer/controllers/events.js

1. On line 12, remove `var config = require('../secret/config')`
2. On lines 18 and 19, comment out ` || config.clientID` and `|| config.clientSecret` respectively, like so: 

```
var clientID = process.env.FS_ID; //|| config.clientID;
var clientSecret = process.env.FS_SECRET; // || config.clientSecret;
```
### 4. Update the .gitignore from the project root
In the .gitignore file, there are instructions to un-comment out four lines. Here's the part you want to comment out (except, of course, for the line with the instruction in it). 

``` 
# Uncomment out the following four lines when you are deploying.
# dateServer/public/lib/bootstrap/dist/
# !dateServer/public/lib/bootstrap/dist/*
# dateServer/public/lib/jquery/dist/
# !dateServer/public/lib/jquery/dist/*
``` 
### 5. Run the git push command 

`git push heroku feat/heroku_deploy_[YOURDATEHERE]:master -f`

(You have to use -f to force it to override whatever is at heroku).



 
  
   
   
---


# Database Seeding
We have written scripts to help seed the Neo4j database with the generic date ideas that are then tied to venue categories in Foursquare's database.

Your local database should be at `http://neo4j:password@localhost:7474`.
For the remote database, please consult the [Google doc](https://docs.google.com/document/d/1hLsHVSTivqIZ6y1wY4a5Bix3MrffpOhbls-q7IvbhQA/edit#). 

### Local Database
1. Clear your local database by navigating to [http://neo4j:password@localhost:7474](http://neo4j:password@localhost:7474) and running this command in the Neo4j console: 

```
MATCH(n) OPTIONAL MATCH(n)-[r]-() DELETE n, r;
```
2. Make sure `dateServer/models/db.js` has the correct database in it (if you are developing locally, it should be `http://neo4j:password@localhost:7474`)
3. cd to `dateServer/data-helpers`
4. Run `node seedAllLocal.js`
5. Verify that nodes are connected by going back to the Neo4j gui and clicking on the `is` tag under `Relationship Types`. You should be able to see events connected to tags. 


### Remote Database

1. Clear your local database by navigating to our remote Neo4j database and running this command in the Neo4j console: 
	2. ```
MATCH(n) OPTIONAL MATCH(n)-[r]-() DELETE n, r;
```
1. Make sure `dateServer/models.db.js` has the **remote** database URL in it in place of the local db in the url option. You can grab it from our [Google doc](https://docs.google.com/document/d/1hLsHVSTivqIZ6y1wY4a5Bix3MrffpOhbls-q7IvbhQA/edit#).

```
var db = new neo4j.GraphDatabase({
  // Support specifying database info via environment variables,
  // but assume Neo4j installation defaults.

  url: process.env['NEO4J_URL'] || process.env['GRAPHENEDB_URL'] ||
    'http://neo4j:password@localhost:7474',
  auth: process.env['NEO4J_AUTH']
});
```

2. cd to `dateServer/data-helpers`
3. run `node seedAllRemote.js`
4. Verify that the nodes are connected by going to the Neo4j gui (you can find the link in the gdoc above) and clicking on the `is` tag under `Relationship Types`. You should be able to see events connected to tags. 

These steps were last verified to be working on 5 Nov 2015.
