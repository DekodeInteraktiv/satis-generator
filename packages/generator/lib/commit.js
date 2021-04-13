/**
 * External dependencies
 */
const git = require('simple-git')();
// const ora = require( 'ora' );
const log = require('npmlog');

/**
 * Internal dependencies
 */
const { asyncForEach } = require('./utils');
const readConfig = require('./config');

// handle log.success()
log.addLevel('success', 3001, { fg: 'green' });

async function commit(pkgs) {
	log.info('', 'Pushing tags and commit');
	// const spinner = ora( 'Pushing tags and commit' ).start();

	const { publishMessage, branch } = await readConfig();
	await git.add('.');
	await git.commit(
		`${publishMessage}\n${pkgs
			.map(({ name, version }) => `- ${name}@${version}`)
			.join('\n')}`,
	);

	await asyncForEach(pkgs, async (pkg) => {
		const { name, version } = pkg;
		git.addAnnotatedTag(`${name}@${version}`, `v${version}`);
	});

	await git.push('origin', branch, {
		'--follow-tags': true,
		'--no-verify': true,
	});

	// spinner.stop();
	log.success('pushed', `${pkgs.length} releases to origin`);
}

module.exports = commit;
