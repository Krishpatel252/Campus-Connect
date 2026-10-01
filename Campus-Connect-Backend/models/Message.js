const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sender: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sender_name: {
    type: DataTypes.STRING,
    defaultValue: 'User'
  },
  channel: {
    type: DataTypes.ENUM('general', 'division'),
    defaultValue: 'general'
  },
  department: {
    type: DataTypes.STRING,
    defaultValue: 'Information Technology'
  },
  division: {
    type: DataTypes.STRING,
    defaultValue: 'A'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

Message.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = values.id;
  return values;
};

module.exports = Message;
