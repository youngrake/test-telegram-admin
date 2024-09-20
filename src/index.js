require('dotenv').config();
const { Bot, session, MemorySessionStorage } = require('grammy');

const connectDb = require('./db/connection');
const {
    checkBotInChannel,
    createInviteLink,
    getChannelInfo,
    scheduleMessage,
    buildChannelsKeyboard,
    startKeyboard,
    listChannels
} = require('./utils');
const ChannelsService = require('./services/channels');
const { commandsList, buttonsWithCommands } = require('./data/data');

const main = async () => {
    await connectDb();

    console.log('Bot is starting...');
    const bot = new Bot(process.env.BOT_TOKEN);

    bot.use(
        // Simple memory storage is enough for this task
        session({
            initial: () => ({
                step: null,
                scheduleStep: 0,
                channelId: '',
                messageText: '',
                scheduledTime: ''
            }),
            storage: new MemorySessionStorage()
        })
    );

    bot.command('start', async (ctx) => {
        await ctx.reply('Admin bot', {
            reply_markup: startKeyboard()
        });
    });

    bot.command('add_channel', async (ctx) => {
        ctx.session.step = 'awaiting_channel_id';
        await ctx.reply('Введіть ID каналу');
    });

    bot.command('add_task', async (ctx) => {
        ctx.session.scheduleStep = 1;
        await ctx.reply('Введіть ID каналу');
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
        if (ctx.callbackQuery.data.startsWith('info-')) {
            const channelId = ctx.callbackQuery.data.split('-')[1];
            await getChannelInfo(ctx, channelId);
            await ctx.answerCallbackQuery();
            return;
        }

        await createInviteLink(ctx, ctx.callbackQuery.data.split('-')[1]);
        await ctx.answerCallbackQuery();
    });

    bot.command('channels_list', async (ctx) => {
        const channels = await listChannels();

        await ctx.reply(`Список каналів: \n${channels.map((channel) => `${channel}\n`)}`);
    });

    bot.on('message:text', async (ctx) => {
        if (buttonsWithCommands.map((b) => b.text).includes(ctx.message.text)) {
            const button = buttonsWithCommands.find((b) => b.text === ctx.message.text);

            await bot.api.sendMessage(ctx.chat.id, button.command);
        }

        // Consider extracting this code to separate service.
        if (ctx.session.step === 'awaiting_channel_id') {
            const channelId = ctx.message.text;

            const isAdmin = await checkBotInChannel(ctx, channelId);

            if (!isAdmin) {
                await ctx.reply('Bot не доданий або не є адміністратором каналу');
            } else {
                await ChannelsService.findChannelOrCreate(channelId);
                await ctx.reply('Додано канал');
            }

            ctx.session.step = null;
        }

        // Consider refactoring this code
        // Consider extracting this code to separate service.
        if (ctx.session.scheduleStep === 1) {
            ctx.session.channelId = ctx.message.text;
            ctx.session.scheduleStep = 2;
            await ctx.reply('Введіть текст повідомлення');
        } else if (ctx.session.scheduleStep === 2) {
            ctx.session.messageText = ctx.message.text;
            ctx.session.scheduleStep = 3;
            await ctx.reply('Введіть час у форматі "YYYY-MM-DD HH:MM" (24-hour format):');
        } else if (ctx.session.scheduleStep === 3) {
            const scheduledTime = new Date(ctx.message.text);

            if (isNaN(scheduledTime.getTime())) {
                await ctx.reply(
                    'Невірний формат часу. Введіть час у форматі "YYYY-MM-DD HH:MM" (24-hour format):'
                );
                return;
            }

            ctx.session.scheduledTime = scheduledTime;

            await ctx.reply(
                `Чудово буде відправлено у ${ctx.session.channelId} в ${ctx.session.scheduledTime}.`
            );

            scheduleMessage(ctx.session.channelId, ctx.session.messageText, ctx.session.scheduledTime, ctx);

            ctx.session.step = 0;
            ctx.session.channelId = '';
            ctx.session.messageText = '';
            ctx.session.scheduledTime = '';
        }
    });

    await bot.api.setMyCommands(commandsList, {
        scope: { type: 'all_private_chats' }
    });

    bot.start();
};

main();
