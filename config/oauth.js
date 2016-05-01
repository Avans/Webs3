var host = process.env.ADVANS_HOST || "http://localhost:3000";

module.exports = {
	public: "5943fa1089522fb407710f96d469860d517c9cee",
	secret: "2d309566e522425b4d55d661a3ce78c50c4b1c41",
	requestTokenURL: 'https://publicapi.avans.nl/oauth/request_token',
	accessTokenURL: 'https://publicapi.avans.nl/oauth/access_token',
	userAuthorizationURL: 'https://publicapi.avans.nl/oauth/saml.php',
	callbackURL: host + '/auth/avans/callback'
};