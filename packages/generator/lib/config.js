/**
 * External dependencies
 */
const fs = require('fs').promises;
const path = require('path');

/**
 * Internal dependencies
 */
const ValidationError = require('./validation-error');

/**
 * Reads and parses the given .satis-generator.json file into a satis generator
 * config object.
 *
 * @return {Object} A satis generator config object.
 */
async function readConfig() {
	const configPath = path.resolve(process.cwd(), 'satis-generator.json');

	let config = null;

	try {
		config = JSON.parse(await fs.readFile(configPath, 'utf8'));
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new ValidationError(
				'EINVALIDCOMPOSER',
				`Invalid satis-generator.json: ${error.message}`,
			);
		} else {
			throw new ValidationError(
				'ENOTCOMPOSER',
				`Could not read satis-generator.json: ${error.message}`,
			);
		}
	}

	if (!('packages' in config)) {
		throw new ValidationError(
			'EMISSINGPKGS',
			'"packages" is a required field in satis-generator.json. Please update your config file.',
		);
	}

	if (!('zipsDistUrl' in config)) {
		throw new ValidationError(
			'EMISSINGZURL',
			'"zipsDistUrl" is a required field in satis-generator.json. Please update your config file.',
		);
	}

	config = {
		branch: 'main',
		checkCurrentBranch: true,
		publishMessage: 'chore(release): publish',
		plugins: [],
		changelogFilename: 'CHANGELOG.md',
		changelogTitle: '## Unreleased',
		version: 'independent',
		buildSatis: true,
		...config,
	};

	return config;
}

module.exports = readConfig;
