/**
 * External dependencies
 */
const path = require( 'path' );
const fs = require( 'fs' ).promises;

/**
 * Internal dependencies
 */
const ValidationError = require( './validation-error' );

/**
 * Async foreach helper function
 *
 * @param  {array}   array     Array to run
 * @param  {Function} callback Callback
 * @return {Promise}
 */
const asyncForEach = async ( array, callback ) => {
	for ( let index = 0; index < array.length; index++ ) {
		await callback( array[ index ], index, array );
	}
};

/**
 * Get path to composer.json file
 * @param  {string} pkg Package dir
 * @return {string}     Composer.json path
 */
const getComposerPath = ( pkg ) => path.resolve( pkg, 'composer.json' );

/**
 * Read composer json file.
 * @param  {string} pkg Package dir
 * @return {Promise}    Config
 */
const getComposerConfig = async ( pkg ) => {
	const composerPath = getComposerPath( pkg );
	let config;

	try {
		config = JSON.parse( await fs.readFile( composerPath, 'utf8' ) );
	} catch ( error ) {
		if ( error instanceof SyntaxError ) {
			throw new ValidationError(
				`Invalid ${ composerPath }: ${ error.message }`,
			);
		} else {
			throw new ValidationError(
				`Could not read ${ composerPath }: ${ error.message }`,
			);
		}
	}

	return config;
};

/**
 * Zip name
 * @param  {string} name    Package name
 * @param  {string} version Package version
 * @return {string}         Zip name
 */
const zipName = ( name, version ) => `${ name.replace( /\//g, '-' ) }-${ version }.zip`;

/**
 * Get current date
 *
 * @return {string} Date string
 */
const getDate = () => {
	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December',
	];

	const d = new Date();

	return `${ monthNames[ d.getMonth() ] } ${ d.getDate() }, ${ d.getFullYear() }`;
};

module.exports = {
	asyncForEach,
	getComposerConfig,
	getComposerPath,
	getDate,
	zipName,
};
