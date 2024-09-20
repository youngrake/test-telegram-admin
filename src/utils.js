const { InlineKeyboard, Keyboard } = require('grammy');

const ChannelsService = require('./services/channels');
const { buttonsWithCommands } = require('./data/data');

const checkBotInChannel = async (ctx, channelId) => {
    try {
        const botStatus = await ctx.api.getChatMember(channelId, ctx.me.id);
        const isAdmin = botStatus.status === 'administrator';

        return isAdmin;
    } catch (error) {
        // Consider unified error handling
        await ctx.reply('Не вдалося перевірити адміністратора каналу');
        return false;
    }
};

const createInviteLink = async (ctx, channelId) => {
    try {
        const inviteLink = await ctx.api.createChatInviteLink(channelId, {
            expire_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            member_limit: 50 // For testing purposes, set to a lower value
        });

        await ctx.reply(`Посилання: ${inviteLink.invite_link}`);
    } catch (error) {
        // Consider unified error handling
        console.error(error);
        await ctx.reply('Бот не є адміністратором каналу або не має доступу до цього каналу');
    }
};

const getChannelInfo = async (ctx, channelId) => {
    try {
        const channelInfo = await ctx.api.getChat(channelId);
        const memberCount = await ctx.api.getChatMembersCount(channelId);
        console.log(memberCount);

        await ctx.reply(
            `
            *Channel Information:*\n
            Title: ${channelInfo.title}\n
            Username: ${channelInfo.username ? `@${channelInfo.username}` : 'N/A'}\n
            ID: ${channelInfo.id}\n
            Description: ${channelInfo.description || 'No description available.'}\n
            Member Count: ${!!memberCount ? memberCount : 'Not available'}\n
            Chat Type: ${channelInfo.type}
        `,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        // Consider unified error handling
        await ctx.reply('Бот не є адміністратором каналу або не має доступу до цього каналу');
    }
};

const scheduleMessage = (channelId, messageText, scheduledTime, ctx) => {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay < 0) {
        ctx.reply('The scheduled time is in the past. Please choose a future time.');
        return;
    }

    setTimeout(async () => {
        try {
            await ctx.api.sendMessage(channelId, messageText);
            ctx.reply(`Було відправлено ${channelId}.`);
        } catch (error) {
            ctx.reply('Помилка при відправці повідомлення. Будь ласка, перевірте правильність ID каналу.');
        }
    }, delay);
};

// Consider as service method
const buildChannelsKeyboard = async (name) => {
    const channels = await ChannelsService.getChannels();
    const inlineKeyboard = new InlineKeyboard();

    for (const channel of channels) {
        inlineKeyboard.text(channel.channelId, `${name}-${channel.channelId}`);
    }

    return inlineKeyboard;
};

const startKeyboard = () => {
    const keyboard = new Keyboard().oneTime();

    for (const button of buttonsWithCommands) {
        keyboard.text(button.text);
    }

    return keyboard;
};

const listChannels = async () => {
    const channels = await ChannelsService.getChannels();

    return channels.map((channel) => channel.channelId);
};

module.exports = {
    checkBotInChannel,
    createInviteLink,
    getChannelInfo,
    scheduleMessage,
    buildChannelsKeyboard,
    startKeyboard,
    listChannels
};
