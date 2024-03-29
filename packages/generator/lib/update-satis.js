/**
 * External dependencies
 */
const { findIndex, sortBy } = require('lodash');
const path = require('path');
const fs = require('fs').promises;

/**
 * Internal dependencies
 */
const ValidationError = require('./validation-error');
const { getComposerConfig, asyncForEach, zipName } = require('./utils');
const readConfig = require('./config');
const { satisConfig, updateZipName } = require('./plugins');

/**
 * Add to satis
 *
 * @param {String} dir Dir where the composer file lives.
 * @return {boolean}
 */
async function updateSatis(pkgs) {
	const { satisFile, zipsDistUrl } = await readConfig();
	const satisPath = path.resolve(process.cwd(), satisFile);

	let satis;
	try {
		satis = JSON.parse(await fs.readFile(satisPath, 'utf8'));
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new ValidationError(`Invalid ${satisPath}: ${error.message}`);
		} else {
			throw new ValidationError(
				`Could not read ${satisPath}: ${error.message}`,
			);
		}
	}

	await asyncForEach(pkgs, async (pkg) => {
		let composer = await getComposerConfig(pkg.package);
		const index = findIndex(
			satis.repositories,
			({ package: { name, version } }) =>
				name === composer.name && version === composer.version,
		);

		let fileName = zipName(composer.name, composer.version);

		if (updateZipName.length !== 0) {
			await asyncForEach(updateZipName, async (fn) => {
				fileName = await fn(fileName);
			});
		}

		if (satisConfig.length !== 0) {
			await asyncForEach(satisConfig, async (fn) => {
				composer = await fn(composer);
			});
		}

		const package = {
			...composer,
			require: composer.require || {},
			dist: composer.dist || {
				url: `${zipsDistUrl}/${fileName}`,
				type: 'zip',
			},
		};

		if (index === -1) {
			satis.repositories.push({
				type: 'package',
				package,
			});
		} else {
			satis.repositories[index].package = package;
		}
	});

	satis.repositories = sortBy(satis.repositories, [
		'package.name',
		'package.version',
	]);
	await fs.writeFile(satisPath, JSON.stringify(satis, null, '\t'), 'utf8');
}

module.exports = updateSatis;
