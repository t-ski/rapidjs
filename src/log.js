/**
 * Log a message to the console.
 * @param {String} message Message
 */
function log(message) {
	console.log(message);
}

/**
 * Return log message or an empty function if logging disabled.
 * @param {Boolean} isEnabled Whether console output is enabled
 */
module.exports = isEnabled => {
	if(!isEnabled) {
		return _ => {};
	}
	return log;
};