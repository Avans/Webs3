AjaxHelper = {
	server: 'http://zeeslagavanstest.herokuapp.com/', //https://zeeslagavans.herokuapp.com/',
	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.Imxpbmtzb25kZXJAZ21haWwuY29tIg.rqem1luf3wKIjLqWhUrR7bDa18kGLN9P8wYCVTEFY-I", //Linksonder
	//token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InJlY2h0c2JvdmVuIg.sCsFmIBuvzvOpv3kOtlX6GtEpLGaXvzyFFSmqVrSzXk", //Rechtsboven
	GET : function(url, options){
		$.ajax({
		    type:'GET',
		    url: AjaxHelper.server + url + '?token=' + AjaxHelper.token,
		    success: options.success,
		    error: options.error
		});
	},
	POST: function(url, data, options){

		$.ajax({
		    type:'POST',
		    data: data,
		    url: this.server + url + '?token=' + AjaxHelper.token,
		    success: options.success,
		    error: options.error
		});
	}
}