import pkg from './package.json' with {type:'json'}

export default {
	// Component name from package.json
	name: pkg.name,
	triggers: {
		keywords: [
			'tourist attractions',
			'things to do',
			'places to visit',
			'landmarks',
			'sights',
			'points of interest',
			'museums'
		]
	},
	query_format: {
		regex: [
			'((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*',
			'((best|top|famous)\\s+)?(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\\s+sites?)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*'
		]
	},
	server: {
		location: 'dist/backend/index.js',
		configPath: 'dist/backend/wrangler.jsonc',
		schemaPath: 'dist/backend/schema.jsonc'
	},
	client: {
		// location of client side code
		location: pkg.module,
		// name of the UMD module
		moduleName: pkg.umdName || 'HD' + pkg.name,
		// baseURL is only used in local testing and ignored after publish
		baseURL: '/' + pkg.name,
	},
	format: {
		mainline: true,
		sidebar: true
	},
	permissions: {},
	info: {
		title: 'Tourism Explorer',
		description: 'Smart travel companion for hyperDart search queries that reveals top sights, categorized POIs, daily itineraries, visit weather, and interactive maps.'
	},
	github: "https://github.com/hyperdart-hackathon/tourism-explorer",
	demovideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
