const axios = require( "axios" )

// deploys to {whatever}.netlify.com/.netlify/functions/test

exports.handler = async ( event, context, callback ) => {
	
	try {
		
		const data = await axios( "https://api.chucknorris.io/jokes/random" )
			.then( res => res.data )
		
		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify( data ),
		}
	} catch ( e ) {
		
		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify( e ),
		}
	}
}