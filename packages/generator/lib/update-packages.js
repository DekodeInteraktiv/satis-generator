/**
 * External dependencies
 */
const { existsSync } = require( 'fs' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const replace = require( 'replace-in-file' );

/**
 * Internal dependencies
 */
const {
	asyncForEach,
	getComposerConfig,
	getComposerPath,
	getDate,
} = require( './utils' );
const { updatePackage } = require( './plugins' );
const readConfig = require( './config' );

/**
 * Update packages.
 */
async function updatePackages( pkgs ) {
	const {
		changelogFilename,
		changelogTitle,
	} = await readConfig();

	await asyncForEach( pkgs, async ( pkg ) => {
		const config = await getComposerConfig( pkg.package );
		const { version } = config;
		config.version = pkg.version;

		// Write new composer file.
		await fs.writeFile( getComposerPath( pkg.package ), JSON.stringify( config, null, '\t' ), 'utf8' );

		// Update changelog.
		const changelogPath = path.resolve( pkg.package, changelogFilename );

		if ( existsSync( changelogPath ) ) {
			await replace( {
				files: changelogPath,
				from: changelogTitle,
				to: `## ${ pkg.version } (${ getDate() })`,
			} );
		}

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
