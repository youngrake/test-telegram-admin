const { Channel } = require('../db/models');

// Simple class to work with channels collection
class ChannelsService {
    // Get all channels
    static async getChannels() {
        const channels = await Channel.find();

        return channels;
    }

    // Add channel
    static async addChannel(channelId) {
        const channel = await Channel.create({
            channelId
        });

        await channel.save();

        return channel;
    }

    // Retrieve channel by ID
    static async getChannelById(channelId) {
        const channel = await Channel.findOne({ channelId });

        return channel;
    }

    // Find channel by ID or create it if it doesn't exist (for ease of use)
    static async findChannelOrCreate(channelId) {
        const channel = await Channel.findOne({ channelId });

        if (!channel) {
            const channel = await ChannelsService.addChannel(channelId);

            return channel;
        }

        return channel;
    }
}

module.exports = ChannelsService;
