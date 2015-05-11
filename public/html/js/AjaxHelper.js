AjaxHelper = {
	server: 'http://localhost:3000/',
	//token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Imxpbmtzb25kZXJAZ21haWwuY29tIg.rqem1luf3wKIjLqWhUrR7bDa18kGLN9P8wYCVTEFY-I", //Linksonder
	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InJlY2h0c2JvdmVuQGdtYWlsLmNvbSI.lJaUpNnJHAIQYZgSow6939Lddxup5OPLDvAPSHUn3eQ", //Rechtsboven
	GET : function(url, options){
		$.ajax({
		    type:'GET',
		    url: AjaxHelper.server + url + '?token=' + AjaxHelper.token,
		    success: options.success,
		    error: options.error
		});
	},
	POST: function(url, data, options){

		console.log(data);
		$.ajax({
		    type:'POST',
		    data: data,
		    url: this.server + url + '?token=' + AjaxHelper.token,
		    success: options.success,
		    error: options.error
		});
	}
}