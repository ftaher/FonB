/**
 * @file fancy select is in house made plugin for converting select boxes to more attractive and friendly bootstrap dropdowns
 * requires bootstrap with dropdown, typeahead and buttons 
 */
(function( $ ){

  $.fn.fancyselect = function( options ) {  

    // Create some defaults, extending them with any options that were provided
    var settings = $.extend( {
		filter : false, //requires typeahead plugin,
		maxItems : 5, //if 0 shows 100% heighted menu containing all options, otherwise limits height according to number provided and enables scroll for rest of options
		checkIconClass : 'icon-check',
		uncheckIconClass: 'icon-check-empty',
		showValue : false// prepends option text with it's value both separated by comma
	}, options);

    var return_var = this.each(function(){
		var select = $(this).find("select");
		var options = select.find("option, optgroup");
		var title = select.prop("title");
		var isMultiple = (select.prop("multiple") != false);
		if(!isMultiple){
			select = select.prepend('<option value="" style="display:none;">' + title + "</option>");
			if(select.val() == options.filter(":first").not("[selected]").val()){
				firstopt = select.find("option:first");
				firstopt.prop("selected", true);
				options = select.find("option, optgroup").not(firstopt);
			}
			title = select.find("option:selected:first").text();
		}
		var typeaheadSource = Array();
		var html = '<div class="btn-group"><a class="dropdown-toggle btn" data-toggle="dropdown" href="javascript:;"><span class="title">'+ title +'</span>&nbsp;<span class="caret pull-right"></span></a>';
		html += '<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">';
		if(options.length > 1 && settings.filter){
			html += '<li><input placeholder="'+ I18n.t("Filter") +'" autocomplete="off" type="text" class="fancyselect-filter" style="margin:5px;"/></li>';
			if(isMultiple){
				html += '<li><p style="margin:5px;text-align:center;">'+ I18n.t("Select") +' &nbsp;<a href="javascript:;" class="select-all">'+ I18n.t("All") +'</a>&nbsp'+ I18n.t("Select") +' <a href="javascript:;" class="select-none">' + I18n.t("None") +'</a></p></li>';
			}
			html += '<li class="divider"></li>';
		}
		options.each(function(i,e){
			tagName = this.nodeName.toLowerCase();
			if(tagName == "optgroup"){
				if(i!=0){
					html += '<li class="divider"></li>';
				}
				html += '<li><a style="min-height:20px;" class="fancyselect-optgroup" href="javascript:;" tabindex="-1"><i class="icon hide '+ settings.uncheckIconClass + '"></i>&nbsp;<strong>' + $(this).prop("label") + '</strong></a></li>';
				html += '<li class="divider"></li>';
			}
			else if(tagName == "option"){
				var optParent = $(this).parent();
				LiClass = "";
				if(isMultiple && optParent.get(0).nodeName.toLowerCase() == "optgroup"){
					LiClass += " fancyselect-option-" + optParent.prop("label");
				}
				iconChecked = ($(this).prop("selected") ? settings.checkIconClass : settings.uncheckIconClass);
				typeaheadSource.push($(this).text());
				if(settings.showValue){
					typeaheadSource.push($(this).val());
					comma = "";
					if($.trim($(this).val()) != "" && $.trim($(this).text()) != "")
					{
						comma = ", ";
					}
					html += '<li class="' + LiClass + '"><a style="min-height:20px;" class="fancyselect-option" href="javascript:;" tabindex="-1" rel="' + $(this).val() + '"><i class="icon ' + iconChecked + '"></i>&nbsp;'+ $(this).val() + comma + $(this).html() + '</a></li>';
				}
				else{
					html += '<li class="' + LiClass + '"><a style="min-height:20px;" class="fancyselect-option" href="javascript:;" tabindex="-1" rel="' + $(this).val() + '"><i class="icon ' + iconChecked + '"></i>&nbsp;' + $(this).html() + '</a></li>';
				}
			}
		});
		html+='</ul></div>';
		select.hide();
		$(this).append(html);
		if(settings.maxItems!=0){
			$(this).find("ul").css({
				"max-height" : (20 * (settings.maxItems + select.find("optgroup").length) + 120) + "px",
				"padding": "10px",
				"overflow-y": "auto",
				"overflow-x" : "hidden",
				"padding-right": "20px",
			});
		}
		var fancyselectOptions = $(this).find(".fancyselect-option");
		if(settings.filter == true){
			/**
			* Type Ahead
			* in case senstivie matching
			*/
			jQuery.expr[':'].containsi = function(a,i,m){
     			return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase())>=0;
			};
			typeaheadInput = $(this).find(".fancyselect-filter");
			typeaheadInput.typeahead({
				source : typeaheadSource,
				updater : function(item){
					if($.trim(item) == ""){
						fancyLi = fancyselectOptions.parent();
						fancyLi.removeClass("hide");
					}
					else{
						item = item.replace(/(\(|\)).*/g,"");
						filtered = fancyselectOptions.not(":containsi(" + item +")");
						filtered.parent().addClass("hide");
						fancyselectOptions.not(filtered).parent().removeClass("hide");
					}
					return item;
				}
			}).keyup(function(){
				item = $(this).val();
				if($.trim(item) == ""){
					fancyLi = fancyselectOptions.parent();
					fancyLi.removeClass("hide");
				}
				else{
					item = item.replace(/(\(|\)).*/g,"");// ( or ) break :contains expression so we replace them
					filtered = fancyselectOptions.not(":containsi(" + item +")");
					filtered.parent().addClass("hide");
					fancyselectOptions.not(filtered).parent().removeClass("hide");
				}
			});
		}
		fancyselectOptions.click(function(e){
			value = $(this).prop("rel");
			option = options.filter("option[value=" + value +"]");
			isSelected = option.prop("selected");
			console.log(option);
			console.log($(this).val());
			console.log(isSelected);
			if(!isMultiple){				
				$(this).parent().parent().find(".fancyselect-option>.icon").removeClass(settings.checkIconClass).addClass(settings.uncheckIconClass);
			}
			if(isSelected){
				$(this).find(".icon").removeClass(settings.checkIconClass).addClass(settings.uncheckIconClass);
				option.prop("selected", false);
				console.log(option.prop("selected"));
			}
			else{
				$(this).find(".icon").removeClass(settings.uncheckIconClass).addClass(settings.checkIconClass);
				option.prop("selected", true);
			}
			select.change();
		});

		var fancyselectOptgroups = $(this).find(".fancyselect-optgroup");
		//I know this is dirty trust me I know how dirty it is
		$clone = $(this).find(".dropdown-toggle:first").clone().css({display:"block", visibility: "hidden", position: "absolute"}).appendTo("body");
		width = $clone.width();
		height = $clone.height();
		$(this).find(".btn-group>.dropdown-toggle").css({"overflow" : "hidden", "width" : width + "px", "height" : height + "px"});
		$clone.remove();
		if(!isMultiple){
			fancyselectOptgroups.css({'cursor' : 'pointer'});
		}
		else{
			$this = $(this);
			fancyselectOptgroups.click(function(){
				var icon = $(this).find('.icon');
				if(icon.hasClass(settings.uncheckIconClass)){
					$this.find(".fancyselect-option-" + $(this).find("strong").text() + ">a").each(function(){
						value = $(this).prop("rel");
						option = options.filter("option[value=" + value +"]");
						$(this).find(".icon").removeClass(settings.uncheckIconClass).addClass(settings.checkIconClass);
						option.prop("selected", true);
						select.change();
					});
					icon.removeClass(settings.uncheckIconClass).addClass(settings.checkIconClass);
				}
				else{
					$this.find(".fancyselect-option-" + $(this).find("strong").text() + ">a").each(function(){
						value = $(this).prop("rel");
						option = options.filter("option[value=" + value +"]");
						$(this).find(".icon").removeClass(settings.checkIconClass).addClass(settings.uncheckIconClass);
						option.prop("selected", false);
						select.change();
					});
					icon.removeClass(settings.checkIconClass).addClass(settings.uncheckIconClass);
				}
			});
		}
		if(isMultiple){
			$(this).find(".select-all").click(function(){
				fancyselectOptions.each(function(){
					value = $(this).prop("rel");
					option = options.filter("option[value=" + value +"]");
					$(this).find(".icon").removeClass(settings.uncheckIconClass).addClass(settings.checkIconClass);
					option.prop("selected", true);
				});
				select.change();
			});

			$(this).find(".select-none").click(function(){
				fancyselectOptions.each(function(){
					value = $(this).prop("rel");
					option = options.filter("option[value=" + value +"]");
					$(this).find(".icon").removeClass(settings.checkIconClass).addClass(settings.uncheckIconClass);
					option.prop("selected", false);
				});
				select.change();
			});
		}
		$(this).find(".fancyselect-option, .fancyselect-optgroup, .fancyselect-filter,.select-all,.select-none").click(function(e){
			selectedOptions = options.filter("option:selected");
			elem = $(this).parents(".btn-group:first").find(".title");
			if(selectedOptions.length == 0){
				elem.html(title);
			}
			else if(selectedOptions.length == 1){
				selectedText = new Array();
				selectedOptions.each(function(){
					selectedText.push($(this).text());
				});
				elem.html(selectedText.join(","));
			}
			else{
				elem.html(selectedOptions.length + " selected");
			}
		});
	});
	$(".fancyselect-option, .fancyselect-optgroup, .fancyselect-filter,.select-all,.select-none").click(function(e){
		e.stopPropagation();
	});
	return return_var;
  };
})( jQuery );
