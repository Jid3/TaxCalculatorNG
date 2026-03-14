const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Use Terser for minification with aggressive mangling/obfuscation
config.transformer = {
    ...config.transformer,
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {
        compress: {
            // Remove console.log statements in production
            drop_console: true,
            // Remove debugger statements
            drop_debugger: true,
            // Additional compression passes
            passes: 3,
            // Dead code elimination
            dead_code: true,
            // Collapse variables declared consecutively
            collapse_vars: true,
            // Reduce code size
            reduce_vars: true,
            // Join consecutive simple statements with comma
            sequences: true,
            // Optimize boolean expressions
            booleans: true,
            // Optimize conditionals
            conditionals: true,
            // Optimize comparisons
            comparisons: true,
            // Optimize if-return/if-continue
            if_return: true,
            // Join consecutive var statements
            join_vars: true,
        },
        mangle: {
            // Enable variable name mangling
            toplevel: true,
            // Mangle property names where safe
            properties: {
                regex: /^_/,  // Only mangle properties starting with underscore
            },
        },
        output: {
            // Remove all comments
            comments: false,
            // Remove semicolons where possible
            semicolons: true,
        },
    },
};

module.exports = config;
