AjaxHelper = {
	server: 'http://localhost:3000/',//'http://zeeslagavanstest.herokuapp.com/', //https://zeeslagavans.herokuapp.com/',
	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.InMuc211bGRlcnNAYXZhbnMubmwi.eu926uUUa37v50xtsqRcr9vthtHI8NKSkQPVdi4yhLU", //Rechtsboven
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