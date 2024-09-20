const commandsList = [
    {
        command: 'start',
        description: 'Показати меню'
    },
    {
        command: 'add_channel',
        description: 'Додати канал'
    },
    {
        command: 'add_task',
        description: 'Запланувати задачу'
    },
    {
        command: 'get_link',
        description: 'Отримати посилання на канал'
    },
    {
        command: 'channels_list',
        description: 'Список каналів'
    },
    {
        command: 'get_channel_info',
        description: 'Отримати інформацію про канал'
    }
];

const buttonsWithCommands = [
    {
        text: 'Додати канал',
        command: '/add_channel'
    },
    {
        text: 'Запланувати задачу',
        command: '/add_task'
    },
    {
        text: 'Отримати посилання на канал',
        command: '/get_link'
    }
];

module.exports = {
    commandsList,
    buttonsWithCommands
};
