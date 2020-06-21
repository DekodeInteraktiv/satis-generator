/**
 * External dependencies
 */
const log = require( 'npmlog' );

class ValidationError extends Error {
	constructor( prefix, message, ...rest ) {
		super( message );
		this.name = 'ValidationError';
		this.prefix = prefix;
		log.resume();
		log.error( prefix, message, ...rest );
		process.exit( 0 );
	}
}

module.exports = ValidationError;
