const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');
const User = require('./User');
const Doctor = require('./Doctor');
const DoctorAvailability = require('./DoctorAvailability');

const Consultation = sequelize.define('Consultation', {
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctor,
            key: 'id',
        },
    },
    doctorAvailabilityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: DoctorAvailability,
            key: 'id',
        },
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'Accepted', 'Rejected','Completed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    startTime: {
        type: DataTypes.TIME,  // Store the selected start time
        allowNull: false,
    },
    endTime: {
        type: DataTypes.TIME,  // Store the selected end time
        allowNull: false,
    },
});

module.exports = Consultation;
