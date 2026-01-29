
const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const models = {};

fs.readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    !file.endsWith('.test.js')
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    models[model.name] = model;
  });


Object.keys(models).forEach(modelName => {
  if (typeof models[modelName].associate === 'function') {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;

module.exports = models;
