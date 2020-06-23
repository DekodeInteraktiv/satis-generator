/**
 * External dependencies
 */
const log = require( 'npmlog' );

/**
 * Internal dependencies
 */
const { getComposerConfig, asyncForEach } = require( '../lib/utils' );
const { registerPlugins } = require( '../lib/plugins.js' );
const checkWorkingTree = require( '../lib/check-working-tree' );
const detectChangedPackages = require( '../lib/detect-changed-packages' );

// handle log.success()
log.addLevel( 'success', 3001, { fg: 'green' } );

async function changed() {
	await registerPlugins();
	await checkWorkingTree();

	log.info( '', 'Looking for changed packages' );
	const pkgs = await detectChangedPackages();

	// If no packages is changed, inform user and die.
	if ( pkgs.length === 0 ) {
		log.info( '', 'No changed packages to publish' );
		process.exit( 1 );
	}

	await asyncForEach( pkgs, async ( pkg ) => {
		const { name } = await getComposerConfig( pkg );
		console.log( name ); // eslint-disable-line no-console
	} );

	log.success( 'found', `${ pkgs.length } packages ready to publish` );
}

changed();
