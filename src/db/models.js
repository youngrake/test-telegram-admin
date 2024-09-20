const { Schema, model } = require('mongoose');

const channelSchema = new Schema(
    {
        channelId: String
    },
    {
        timestamps: true
    }
);

const Channel = model('channel', channelSchema);

module.exports = {
    Channel
};
