/**
 * External dependencies
 */
const fs = require( 'fs' ).promises;

/**
 * Internal dependencies
 */
const {
	asyncForEach,
	getComposerConfig,
	getComposerPath,
} = require( './utils' );
const { updatePackage } = require( './plugins' );

/**
 * Update packages.
 */
async function updatePackages( pkgs ) {
	await asyncForEach( pkgs, async ( pkg ) => {
		const config = await getComposerConfig( pkg.package );
		const { version } = config;
		config.version = pkg.version;

		await fs.writeFile( getComposerPath( pkg.package ), JSON.stringify( config, null, '\t' ), 'utf8' );

		if ( updatePackage.length !== 0 ) {
			await asyncForEach( updatePackage, async ( fn ) => {
				await fn( {
					pkg: pkg.package,
					type: config.type,
					from: version,
					to: pkg.version,
				} );
			} );
		}
	} );
}

module.exports = updatePackages;
