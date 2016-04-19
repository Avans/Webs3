var host = process.env.ADVANS_HOST || "http://localhost:3000";

module.exports = {
	public: "ee033a1752e6e4b8b72c4d300f6aef95521e0e43",
	secret: "88687cfa9e2b5a281658e75ba53e1b011671e85a",
	requestTokenURL: 'https://publicapi.avans.nl/oauth/request_token',
    accessTokenURL: 'https://publicapi.avans.nl/oauth/access_token',
    userAuthorizationURL: 'https://publicapi.avans.nl/oauth/saml.php',
    callbackURL: host + '/auth/avans/callback'
}