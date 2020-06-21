/**
 * External dependencies
 */
const { has } = require( 'lodash' );

/**
 * Internal dependencies
 */
const readConfig = require( './config' );

const updatePackage = [];

const registerPlugins = async () => {
	const config = await readConfig();

	config.plugins.forEach( ( plugin ) => {
		const pluginConfig = require( plugin );

		if ( has( pluginConfig, 'updatePackage' ) ) {
			updatePackage.push( pluginConfig.updatePackage );
		}
	} );
};

module.exports = {
	registerPlugins,
	updatePackage,
};
