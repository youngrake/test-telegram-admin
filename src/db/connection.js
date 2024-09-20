const mongoose = require('mongoose');

module.exports = () => {
    return mongoose.connect(process.env.DATABASE_URL).then(() => {
        console.log('Connected to database');
    });
};
