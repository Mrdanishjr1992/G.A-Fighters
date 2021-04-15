const mongoose = require('mongoose');
const connectionString =
  'mongodb+srv://mrdainshjr1992:8723050822@cluster0.o0aaq.mongodb.net/test?authSource=admin&replicaSet=atlas-13gmg9-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true' ||
  'mongodb://localhost:27017/fighters';

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected`);
});
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose connected error :` + err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

module.exports = {
  User: require('../models/User'),
  Avatar: require('../models/Avatar'),
};
