require('dotenv').config();
const { Bot, session } = require('grammy');
const { conversations, createConversation } = require('@grammyjs/conversations');

const connectDb = require('./db/connection');
const {
    createInviteLink,
    getChannelInfo,
    buildChannelsKeyboard,
    startKeyboard,
    listChannels
} = require('./utils');
const { commandsList, buttonsWithCommands } = require('./data/data');

const { addChannel, addTask } = require('./conversations');

const main = async () => {
    await connectDb();

    console.log('Bot is starting...');
    const bot = new Bot(process.env.BOT_TOKEN);

    bot.use(
        session({
            initial() {
                // return empty object for now
                return {};
            }
        })
    );

    bot.use(conversations());

    bot.command('start', async (ctx) => {
        await ctx.reply('Admin bot', {
            reply_markup: startKeyboard()
        });
    });

    bot.use(createConversation(addChannel, 'addchannel'));
    bot.use(createConversation(addTask, 'addtask'));

    bot.command('add_channel', async (ctx) => {
        await ctx.conversation.enter('addchannel');
    });

    bot.command('add_task', async (ctx) => {
        await ctx.conversation.enter('addtask');
    });

    bot.command('get_channel_info', async (ctx) => {
        const keyboard = await buildChannelsKeyboard('info');

        await ctx.reply('Отримайте посилання на канал', {
            reply_markup: keyboard
        });
    });

    bot.command('get_link', async (ctx) => {
        const keyboard = await buildChannelsKeyboard('link');

        await ctx.reply('Отримайте посилання на канал', {
            reply_markup: keyboard
        });
    });

    bot.on('callback_query:data', async (ctx) => {
        // Consider better formatting.
        if (ctx.callbackQuery.data.startsWith('info$')) {
            const channelId = ctx.callbackQuery.data.split('$')[1];
            await getChannelInfo(ctx, channelId);
            await ctx.answerCallbackQuery();
            return;
        }

        await createInviteLink(ctx, ctx.callbackQuery.data.split('$')[1]);
        await ctx.answerCallbackQuery();
    });

    bot.command('channels_list', async (ctx) => {
        const channels = await listChannels();

        await ctx.reply(`Список каналів: \n${channels.map((channel) => `${channel}`).join('\n')}`);
    });

    bot.on('message:text', async (ctx) => {
        if (buttonsWithCommands.map((b) => b.text).includes(ctx.message.text)) {
            const button = buttonsWithCommands.find((b) => b.text === ctx.message.text);

            await bot.api.sendMessage(ctx.chat.id, button.command);
        }
    });

    await bot.api.setMyCommands(commandsList, {
        scope: { type: 'all_private_chats' }
    });

    bot.start();
};

main();
