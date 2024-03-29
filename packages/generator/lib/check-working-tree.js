/**
 * External dependencies
 */
const { isEmpty } = require('lodash');
const git = require('simple-git')();
const log = require('npmlog');

/**
 * Internal dependencies
 */
const ValidationError = require('./validation-error');
const readConfig = require('./config');

/**
 * Throw an error if current branch hasn't pull latest changes from origin.
 *
 * @return {void}
 */
async function throwIfBehind() {
	const { behind } = await git.status();

	if (behind !== 0) {
		throw new ValidationError(
			'EBEHIND',
			'The working branch is behind origin. Please pull before continuing.',
		);
	}
}

/**
 * Throw an error if current branch has uncommitted files.
 *
 * @return {void}
 */
async function throwIfUncommited() {
	const { files } = await git.status();

	if (!isEmpty(files)) {
		let filesList = '';

		files.forEach((file) => {
			filesList += `\n - ${file.path}`;
		});

		throw new ValidationError(
			'EUNCOMMIT',
			'Working tree has uncommitted changes, please commit or remove the changes before continuing.',
			'\n\nUncommitted files:',
			filesList,
		);
	}
}

/**
 * Throw an error if current branch isn't the same as in the config.
 *
 * @return {void}
 */
async function throwIfBranch() {
	const { current } = await git.status();
	const { branch, checkCurrentBranch } = await readConfig();

	if (checkCurrentBranch && current !== branch) {
		throw new ValidationError(
			'EBRANCH',
			`Current branch is "${current}". The generator should be runned in "${branch}".`,
		);
	}
}

/**
 * Run checks on the current working tree to validate that everything is
 * as expected before trying to build Satis.
 *
 * @return {void}
 */
async function checkWorkingTree() {
	await throwIfUncommited();
	await throwIfBranch();

	log.info('', 'Checking that branch is up to date with origin');

	try {
		await git.fetch();
	} catch (e) {
		log.error('EGITFETCH', e);
		process.exit(0);
	}

	// spinner.stop();

	await throwIfBehind();
}

module.exports = checkWorkingTree;
