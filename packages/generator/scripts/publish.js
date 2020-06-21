/**
 * External dependencies
 */
const log = require( 'npmlog' );

/**
 * Internal dependencies
 */
const { hasArgInCLI } = require( '../lib/cli-utils' );
const { registerPlugins } = require( '../lib/plugins.js' );
const checkWorkingTree = require( '../lib/check-working-tree' );
const commit = require( '../lib/commit' );
const detectChangedPackages = require( '../lib/detect-changed-packages' );
const promptPackageVersions = require( '../lib/prompt' );
const updatePackages = require( '../lib/update-packages' );
const updateSatis = require( '../lib/update-satis' );

async function publish() {
	await registerPlugins();
	await checkWorkingTree();
	const pkgs = await detectChangedPackages();

	// If no packages is changed, inform user and die.
	if ( pkgs.length === 0 ) {
		log.info( '', 'No changed packages to publish' );
		process.exit( 1 );
	}

	const pkgsToPublish = await promptPackageVersions( pkgs );
	await updatePackages( pkgsToPublish );
	await updateSatis( pkgsToPublish );

	if ( ! hasArgInCLI( '--dry-run' ) ) {
		await commit( pkgsToPublish );
	}
}

publish();
