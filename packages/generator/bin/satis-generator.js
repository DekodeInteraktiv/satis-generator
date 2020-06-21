#!/usr/bin/env node

/**
 * Internal dependencies
 */
const { getNodeArgsFromCLI, spawnScript } = require( '../lib/cli-utils' );

const { scriptName, scriptArgs, nodeArgs } = getNodeArgsFromCLI();

spawnScript( scriptName, scriptArgs, nodeArgs );
