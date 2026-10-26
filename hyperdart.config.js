import pkg from './package.json' with {type:'json'}

export default {
	// Component name from package.json
	name: pkg.name,
	triggers: {
		keywords: [
			'tourist attractions',
			'tourist attraction',
			'things to do',
			'places to visit',
			'places to see',
			'landmarks',
			'sights',
			'points of interest',
			'museums',
			'forts',
			'palaces',
			'castles',
			'monuments',
			'temples',
			'sightseeing',
			'attractions',
			'attraction',
			'travel guide',
			'day trips',
			'city tour',
			'what to see',
			'what to do'
		]
	},
	query_format: {
		regex: [
			// 1. Problem Statement Original: General travel sights
			'((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*',
			// 2. Problem Statement Original: Category-specific sights
			'((best|top|famous)\\s+)?(museums?|monuments?|temples?|forts?|viewpoints?|parks?|historic(al)?\\s+sites?)\\s+(in|near|around)\\s+HD_LOCATION(__\\w+)?.*',
			// 3. New: Location-first query (e.g. "Paris tourist attractions", "Jaipur forts", "Tokyo sights", "Rome landmarks")
			'HD_LOCATION(__\\w+)?\\s+((best|top|famous|popular)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+(do|see)|places\\s+to\\s+(visit|see|explore)|landmarks|sights|points\\s+of\\s+interest|museums?|monuments?|temples?|forts?|palaces?|castles?|viewpoints?|parks?|gardens?|beaches?|sightseeing|travel\\s+guide|itinerary).*',
			// 4. New: Conversational discovery (e.g. "what to see in Paris", "what to do in NYC", "where to go in Tokyo")
			'((what|where)(\\s+(to|can\\s+(i|we)|should\\s+(i|we)))?\\s+(see|do|visit|explore|go))\\s+(in|near|around|at)\\s+HD_LOCATION(__\\w+)?.*',
			// 5. New: Expanded prepositions & trip planning (e.g. "sightseeing in Rome", "travel guide to Tokyo", "itinerary for NYC", "attractions of Paris")
			'((best|top|famous|popular|must-see)\\s+)?(tourist\\s+attractions?|sightseeing|day\\s+trips?|city\\s+tours?|travel\\s+guide|itinerary)\\s+(in|near|around|at|of|for|to)\\s+HD_LOCATION(__\\w+)?.*',
			// 6. New: Cultural, architectural & natural heritage (e.g. "castles in Scotland", "palaces in Jaipur", "beaches in Goa", "cathedrals in London")
			'((best|top|famous|popular|historic(al)?)\\s+)?(castles?|palaces?|citadels?|cathedrals?|basilicas?|churches?|mosques?|shrines?|art\\s+galleries?|botanical\\s+gardens?|beaches?|waterfalls?|ruins?|heritage\\s+sites?|wildlife\\s+sanctuaries?|zoos?|lakes?)\\s+(in|near|around|at|of)\\s+HD_LOCATION(__\\w+)?.*',
			// 7. New: User location & local discovery (e.g. "tourist attractions near me", "things to do near me", "places to visit near me")
			'((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+(do|see)|places\\s+to\\s+visit|landmarks|sights|points\\s+of\\s+interest|museums?|monuments?|forts?|parks?)\\s+(near\\s+me|around\\s+here|nearby|in\\s+my\\s+area|HD_USER_LOCATION).*',
			// 8. New: Direct concise query (e.g. "Jaipur sightseeing", "Paris tourism", "Rome highlights")
			'HD_LOCATION(__\\w+)?\\s+(sightseeing|tourism|guide|attractions?|itinerary|highlights).*',
			// 9. Catch-all fallback regex
			'.*(tourist\\s+attractions?|things\\s+to\\s+(do|see)|places\\s+to\\s+(visit|see)|points\\s+of\\s+interest|sightseeing|best\\s+places\\s+to\\s+visit|landmarks|museums?|forts?|palaces?|monuments?).*'
		],
		fallBackRegex: [
			'((best|top|famous)\\s+)?(tourist\\s+attractions?|things\\s+to\\s+(do|see)|places\\s+to\\s+(visit|see)|landmarks|sights|points\\s+of\\s+interest|museums?|forts?|palaces?|monuments?)\\s+(in|near|around|at|of)\\s+(?<HD_LOCATION>.*)',
			'(?<HD_LOCATION>.*)\\s+(tourist\\s+attractions?|things\\s+to\\s+do|places\\s+to\\s+visit|landmarks|sights|museums?|forts?|palaces?|sightseeing)'
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
		sidebar: true,
		fullscreen: true
	},
	permissions: {},
	info: {
		title: 'Tourism Explorer',
		description: 'Smart travel companion for hyperDart search queries that reveals top sights, categorized POIs, daily itineraries, visit weather, and interactive maps.'
	},
	github: "https://github.com/NakulGautam-dev/tourism-explorer",
	demovideo: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
