const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: 'Added via portal'
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Information Technology'
  },
  division: {
    type: DataTypes.STRING,
    defaultValue: 'A'
  },
  professor: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

Assignment.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = values.id;
  return values;
};

module.exports = Assignment;
