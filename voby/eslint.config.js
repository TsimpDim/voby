// eslint.config.js
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
	// matches all files ending with .js
	{
		files: ["**/*.js", "**/*.ts"],
		rules: {
			semi: "error",
		},
	},
]);