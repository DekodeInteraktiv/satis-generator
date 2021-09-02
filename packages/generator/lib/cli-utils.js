/* eslint-disable no-undefined, consistent-return, no-console */

/**
 * External dependencies
 */
const { existsSync, readdirSync } = require('fs');
const path = require('path');
const spawn = require('cross-spawn');

/**
 * Handle signal
 */
const handleSignal = (signal) => {
	if (signal === 'SIGKILL') {
		console.log(
			'The script failed because the process exited too early. ' +
				'This probably means the system ran out of memory or someone called ' +
				'`kill -9` on the process.',
		);
	} else if (signal === 'SIGTERM') {
		console.log(
			'The script failed because the process exited too early. ' +
				'Someone might have called `kill` or `killall`, or the system could ' +
				'be shutting down.',
		);
	}
	process.exit(1);
};

/**
 * Path to script
 */
const fromScriptsRoot = (scriptName) =>
	path.join(path.dirname(__dirname), 'scripts', `${scriptName}.js`);

/**
 * Check if script exists
 */
const hasScriptFile = (scriptName) => existsSync(fromScriptsRoot(scriptName));

/**
 * Get scripts
 */
const getScripts = () =>
	readdirSync(path.join(path.dirname(__dirname), 'scripts'))
		.filter((f) => path.extname(f) === '.js')
		.map((f) => path.basename(f, '.js'));

/**
 * Get CLI args
 */
const getArgsFromCLI = (excludePrefixes) => {
	const args = process.argv.slice(2);
	if (excludePrefixes) {
		return args.filter(
			(arg) => !excludePrefixes.some((prefix) => arg.startsWith(prefix)),
		);
	}
	return args;
};

/**
 * Get arg from CLI
 */
const getArgFromCLI = (arg) => {
	for (const cliArg of getArgsFromCLI()) {
		const [name, value] = cliArg.split('=');
		if (name === arg) {
			return value || null;
		}
	}
};

/**
 * Check if arg is defined
 */
const hasArgInCLI = (arg) => getArgFromCLI(arg) !== undefined;

/**
 * Get Node args
 */
const getNodeArgsFromCLI = () => {
	const args = getArgsFromCLI();
	const scripts = getScripts();
	const scriptIndex = args.findIndex((arg) => scripts.includes(arg));
	return {
		nodeArgs: args.slice(0, scriptIndex),
		scriptName: args[scriptIndex],
		scriptArgs: args.slice(scriptIndex + 1),
	};
};

const spawnScript = (scriptName, args = [], nodeArgs = []) => {
	if (!scriptName) {
		console.log('Script name is missing.');
		process.exit(1);
	}

	if (!hasScriptFile(scriptName)) {
		console.log(
			`Unknown script "${scriptName}". Perhaps you need to update?`,
		);
		process.exit(1);
	}

	const { signal, status } = spawn.sync(
		'node',
		[...nodeArgs, fromScriptsRoot(scriptName), ...args],
		{
			stdio: 'inherit',
		},
	);

	if (signal) {
		handleSignal(signal);
	}

	process.exit(status);
};

module.exports = {
	getArgFromCLI,
	getNodeArgsFromCLI,
	hasArgInCLI,
	spawnScript,
};
