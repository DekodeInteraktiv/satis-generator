/**
 * External dependencies
 */
const { has } = require('lodash');

/**
 * Internal dependencies
 */
const readConfig = require('./config');

const updatePackage = [];
const isChanged = [];
const satisConfig = [];
const updateZipName = [];

const registerPlugins = async () => {
	const config = await readConfig();

	config.plugins.forEach((plugin) => {
		const pluginConfig = require(plugin); // eslint-disable-line

		if (has(pluginConfig, 'updatePackage')) {
			updatePackage.push(pluginConfig.updatePackage);
		}

		if (has(pluginConfig, 'isChanged')) {
			isChanged.push(pluginConfig.isChanged);
		}

		if (has(pluginConfig, 'satisConfig')) {
			satisConfig.push(pluginConfig.satisConfig);
		}

		if (has(pluginConfig, 'updateZipName')) {
			updateZipName.push(pluginConfig.updateZipName);
		}
	});
};

module.exports = {
	isChanged,
	satisConfig,
	registerPlugins,
	updatePackage,
	updateZipName,
};
