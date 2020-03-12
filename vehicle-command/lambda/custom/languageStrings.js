/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
    en: {
        translation: {
            WELCOME_MSG: 'Welcome, you can control your vehicle using voice command like door open, window up, headlight on. Which would you like to try?',
            WINDOW_DOWN: 'Window Down',
            WINDOW_UP: 'Window Up',
            HEADLIGHT_ON: 'Headlight On',
            HEADLIGHT_OFF: 'Headlight Off',
            DOOR_OPEN: 'Door Open',
            DOOR_CLOSE: 'Door Close',
            HELP_MSG: 'You can say open command! How can I help?',
            GOODBYE_MSG: 'Goodbye!',
            REFLECTOR_MSG: 'You just triggered {{intentName}}',
            FALLBACK_MSG: 'Sorry, I don\'t know about that. Please try again.',
            ERROR_MSG: 'Sorry, I had trouble doing what you asked. Please try again.'
        }
    }
}