/**
 * External dependencies
 */
const inquirer = require( 'inquirer' );
const semver = require( 'semver' );

/**
 * Internal dependencies
 */
const { asyncForEach, getComposerConfig } = require( './utils' );

/**
 * Select packages to bump and select versions
 *
 * @param  {Array} pkgs Packages paths.
 * @return {Array}      Bump paths and version
 */
async function promptPackageVersions( pkgs ) {
	const packageVersions = [];

	const composerConfigs = await Promise.all( pkgs.map( async ( pkg ) => ( {
		path: pkg,
		composer: await getComposerConfig( pkg ),
	} ) ) );

	/**
	 * Select packages to bump
	 */
	const { selectedPkgs } = await inquirer.prompt( {
		type: 'checkbox',
		name: 'selectedPkgs',
		message: 'Select packages you want to release?',
		choices: composerConfigs.map( ( choice ) => ( {
			name: choice.composer.name,
			value: choice,
			checked: true,
		} ) ),
		pageSize: 50,
		validate: ( input ) => {
			if ( ! Array.isArray( input ) || input.length === 0 ) {
				return 'No packages selected.';
			}

			return true;
		},
	} );

	/**
	 * Select versions
	 */
	await asyncForEach( selectedPkgs, async ( pkg ) => {
		const { version: v, name } = pkg.composer;

		const patch = semver.inc( v, 'patch' );
		const minor = semver.inc( v, 'minor' );
		const major = semver.inc( v, 'major' );

		const { version } = await inquirer.prompt( {
			type: 'list',
			name: 'version',
			message: `Select a new version for ${ name } (currently ${ v })`,
			choices: [
				{ name: `Major (${ major })`, value: major },
				{ name: `Minor (${ minor })`, value: minor },
				{ name: `Patch (${ patch })`, value: patch },
			],
		} );

		packageVersions.push( {
			name,
			package: pkg.path,
			version,
		} );
	} );

	return packageVersions;
}

module.exports = promptPackageVersions;
