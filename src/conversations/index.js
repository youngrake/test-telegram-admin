const { checkBotInChannel, scheduleMessage } = require('../utils');
const ChannelsService = require('../services/channels');

const addChannel = async (conversation, ctx) => {
    await ctx.reply('Введіть ID каналу');
    const { message } = await conversation.wait();

    const isAdmin = await checkBotInChannel(ctx, message.text);

    if (!isAdmin) {
        await ctx.reply('Bot не доданий або не є адміністратором каналу');
    } else {
        await ChannelsService.findChannelOrCreate(message.text);
        await ctx.reply('Додано канал');
    }
};

const addTask = async (conversation, ctx) => {
    await ctx.reply('Введіть ID каналу');
    const { message: channelIdMessage } = await conversation.wait();

    await ctx.reply('Введіть текст повідомлення');
    const { message: messageTextMessage } = await conversation.wait();

    await ctx.reply('Введіть час у форматі "YYYY-MM-DD HH:MM" (24-hour format):');
    const { message: scheduledTimeMessage } = await conversation.wait();

    const scheduledTime = new Date(scheduledTimeMessage.text);

    if (isNaN(scheduledTime.getTime())) {
        await ctx.reply('Невірний формат часу. Введіть час у форматі "YYYY-MM-DD HH:MM" (24-hour format):');
        return;
    }

    scheduleMessage(channelIdMessage.text, messageTextMessage.text, scheduledTime, ctx);

    await ctx.reply(`Чудово буде відправлено у ${channelIdMessage.text} в ${scheduledTimeMessage.text}.`);
};

module.exports = {
    addChannel,
    addTask
};
