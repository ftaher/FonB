//initialize internationalization object.
i18n = function(language){
	//which templates to use? Left to right or right to left?
	//add language code here to override default templates
	this.templates = {
		/*
		"ar" : "r2l",
		"iw" : "r2l"
		*/
	}

	var translation = null;

	//note: not using this.language because we want support for unknown languages without modifying the code
	if(typeof language !== "undefined" && language !== "en"){
		$.ajax({
			url : "http://" + window.location.host + "/i18n/" + language+".json",
			async: false,
			dataType : "json",
			success: function(data){
				translation = data;
			}
		});
	}

	//default language is en and template is default
	this.language = typeof this.templates[language] == "undefined" ? "en" : language;
	this.template = (typeof this.templates[this.language] != "undefined" ? this.templates[this.language] : "default");

	if(translation != null && typeof translation === 'object'){
		this.translation = translation;
		this.language = language;
	}
	else{
		this.translation = {};
	}
	this.t = function(message){
		return this.translation[message] || message;
		//uncomment lines below and comment line above to debug
		/*if(typeof this.translation[message] !== "undefined"){
			return this.translation[message];
		}
		else{
			console.log("translation fail:" + message);
			return message;
		}*/
	};
}