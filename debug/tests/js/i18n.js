QUnit.test("initialization and dependency test", function(assert){
	QUnit.expect(3);
	assert.ok(typeof $ !== "undefined", "jQuery test");
	if(typeof $ !== "undefined"){
		assert.ok(typeof $.ajax !== "undefined", "jQuery ajax test");
	}
	var lang = new i18n();
	assert.ok(typeof lang !== "undefined", "object initiation");
});

QUnit.test("language arg test", function(assert){
	var lang = new i18n();
	assert.equal(lang.language, "en", "If instantiated without args, it's english");
	assert.equal(lang.template, "default", "English is left to right");

	lang = new i18n("ar");
	lang.templates.ar = "r2l";
	assert.equal(lang.language, "ar", "if instantiated with some language param, language is ar");
	assert.equal(lang.template, "default", "template is default");

	lang = new i18n("ts");
	assert.equal(lang.language, "en", "When unknown language is passed, and translation file is not found, english is used as language");

	lang = new i18n("fr");
	assert.equal(lang.language, "fr", "When unknown language is passed, and translation file is found, that language is used");
	assert.equal(lang.template, "default", "template for unknown language is default");	
});


QUnit.test("valid json test", function(assert){
	var languages = ["ar", "fr", "cn", "jp", "es", "it", "iw", "nl", "ru"];
	for(index=0;index<languages.length;index++){
		var lang = new i18n(languages[index]);
		assert.equal(lang.language, languages[index], "Valid json test for " + languages[index]);
	}
});

QUnit.test("translation tests", function(assert){
	var lang = new i18n();
	assert.equal(lang.t("test word"), "test word", "In case of english, same text is returned");

	lang = new i18n("ar");
	assert.equal(lang.t("Settings"), "إعدادات", "In case of arabic, arabic translation is returned");

	lang = new i18n("ts");
	assert.equal(lang.t("test word"), "test word", "In case of unknown language, english translation is returned");

	lang = new i18n("ar");
	assert.equal(lang.t("test word 1"), "test word 1", "in case translation doesn't exist, same word is returned");
});