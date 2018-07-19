# Project Express Stock

The REST API allows user to maintain a watchlist on the stock market and users will be able to query the latest transaction information upon login.

## Documentation
- [API documentation](https://express-stock-30545.herokuapp.com/api-docs/)

## Built With
- [Node.js](https://nodejs.org/) - JavaScript runtime engine
- [Express](https://expressjs.com/) - The web framework
- [Mongo DB](https://www.mongodb.com/) - The database
- [Mongoose](http://mongoosejs.com/) - MongoDB object modeling
- [PassportJS](http://www.passportjs.org/) - Authentication Middleware
- [World Trading Data](https://www.worldtradingdata.com/) - The worldwide market data provider

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to acquire a free API key from [World Trading Data](https://www.worldtradingdata.com/).
You can test the API behaviour by using API tester, for example, [Insomnia REST Client](https://insomnia.rest/), [Postman API Development Environment](https://www.getpostman.com/).

### Installing

Run the following in terminal to install project dependencies.

```
git clone https://github.com/ngyl88/project-express-stock
npm install
```

Set your API key. Start the local server and test with the listening port.

```
API_KEY_WORLD_TRADING_DATA=<YOUR_API_KEY> node server.js
```

## Versioning
See the [tags on this repository](https://github.com/ngyl88/project-express-stock/tags). 

## Authors

* [**YL Ng**](https://github.com/ngyl88) - *Initial work*

See also the list of [contributors](https://github.com/ngyl88/project-express-stock/contributors) who participated in this project.

## Acknowledgments

* Hat tip to anyone whose code was used
* ThoughtWorks JumpStart! program
