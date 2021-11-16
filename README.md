# Project Express Stock

The REST API allows user to maintain a watchlist on the stock market and users will be able to query the latest transaction information upon login.

### Features
* Maintaining a personalised stock watchlist
* Query of latest transaction information for stocks on watchlist
* Token Expiration within 30 minutes

## Build Status
[![CircleCI](https://circleci.com/gh/ngyl88/project-express-stock/tree/master.svg?style=svg)](https://circleci.com/gh/ngyl88/project-express-stock/tree/master)

## Documentation
- [API documentation](https://express-stock-30545.herokuapp.com/api-docs/)

## Built With
- [Node.js](https://nodejs.org/) - JavaScript runtime engine
- [Express](https://expressjs.com/) - The web framework
- [Mongo DB](https://www.mongodb.com/) - The database
- [Mongoose](http://mongoosejs.com/) - MongoDB object modeling
- [PassportJS](http://www.passportjs.org/) - Authentication Middleware
- [marketstack](https://marketstack.com) - The market data provider

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to install [MongoDB](https://www.mongodb.com/download-center) and start your DB server.

You will need to acquire a free API key from [marketstack](https://marketstack.com) .

You can test the API behaviour by using web service testing application.
- [Insomnia REST Client](https://insomnia.rest/)
- [Postman API Development Environment](https://www.getpostman.com/)
- [SoapUI](https://www.soapui.org/)

### Installing

Run the following in terminal to install project dependencies.

```
git clone https://github.com/ngyl88/project-express-stock
npm install
```

Run the following to trigger the tests.

```
npm test
```

Set up `.env` or `.envrc`. Start the local server and test on the listening port.

```
ALPHAVANTAGE_API_KEY=
API_KEY_WORLD_TRADING_DATA=<YOUR_MARKETSTACK_API_KEY>
JWT_SECRET=
MONGODB_URI=

# CORS
CONSUMER_REACT_APP_FRONTEND_URL=
```

## Versioning
See the [tags on this repository](https://github.com/ngyl88/project-express-stock/tags). 

## Authors

* [**YL Ng**](https://github.com/ngyl88) - *Initial work*

See also the list of [contributors](https://github.com/ngyl88/project-express-stock/contributors) who participated in this project.

## Acknowledgments

* Hat tip to anyone whose code was used
* ThoughtWorks JumpStart! 2018 program

