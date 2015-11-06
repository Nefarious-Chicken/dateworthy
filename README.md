
<img src="https://raw.githubusercontent.com/jingpei/date-app/master/dateServer/public/images/dateworthy.png" width="225px">


Need a last-minute date idea? There's an app for that! Check it out at [dateworthy.io](www.dateworthy.io)


[![Build Status](https://travis-ci.org/Nefarious-Chicken/dateworthy.svg?branch=master)](https://travis-ci.org/Nefarious-Chicken/dateworthy)

<img src="https://raw.githubusercontent.com/jingpei/date-app/doc/documentation/dateServer/public/images/dateworthy-site.png">

## Table of Contents

1. [Team](#team)
1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
1. [Product-Roadmap](#Product-Roadmap)
1. [Contributing](#contributing)
1. [Testing](#Testing)
1. [Resources](#Resources)

## Team

  - __Product Owner__: Adam Hedgpeth
  - __Scrum Master__: Alex Liotta
  - __Development Team Members__: Jing Pei, Jessica Chong

## Usage

- Please read the [deployment guide!](https://github.com/Nefarious-Chicken/dateworthy/blob/master/Deployment-and-Database.md) Even if you are not interested in deploying the app, there's a tremendous amount of information on how to seed databases and get your local dateworthy up and running! 
- Please read the contribution guide.  There's a wealth of client and server tests at your disposal, and any pull request made to dateworthy must pass continuous integration tests before it can be merged.  

## Requirements

- neo4j v2.2.5
- npm 2.14+
- bower 1.6.5+


## Development

You will need a populated neo4j database.  To seed your local neo4j database with dateworthy data, navigate from the root directory to /dateServer/data-helpers/ and run:

```sh
node seedAllLocal.js
```

Make sure to point the server to your local neo4j database at /dateServer/models/db.js to populate it with some seed data. The default local installation will start neo4j at port 7474. 

### Installing Dependencies

From within the root directory:

```sh
sudo npm install
```

From within the dateServer/ directory
```sh
sudo npm install
```
## Product-Roadmap

This project was a labor of love and the dateworthy team, The Nefarious Chickens, are hoping to bring some of these features in the future:

- A welcome back workflow to like dates you haven't seen
- Foursquare auth to avoid rate limitations on venues returned
- The ability to submit ideas through the app
- Date reviews and a date idea community
- Infrastructure improvements, more tests, and other things we haven't thought of!

## Contributing

See [CONTRIBUTING.md](_CONTRIBUTING.md) for contribution guidelines.

## Testing

dateworthy uses test suites written in Mocha, Karma, Chai and Jasmine. On every pull request the tests are automatically run using Travis continuous integration. To run the test suites locally use the following command from your route directory:

```javascript
npm test
```
## Resources

Some resources that helped us start this project include:
- Aseem Kishore's [Node-Neo4j Template](https://github.com/aseemk/node-neo4j-template)
- Ionic's [Getting Started Guide](http://www.ionicframework.com/docs/guide/)
