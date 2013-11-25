
/*** Graphs Zoom in/out ***/
function ZoomIN(elem) {
	// get the original image size
	elem.css({'width': 'auto','position': 'relative','z-index': 10});
	var width = elem.width();
	elem.css({'width': '100%'})

	// calc a left offset to zoom centered
	var left = width / 2 - elem.width() / 2;

	// keep the image inside the screen
	if (elem.offset().left - left < 20) // check left border
		left = 20;
	if (elem.offset().left - left > $(document).width() - width) // right
		left = width - elem.width() - 40;

	// animate to the original size and the new position
	elem.animate({
			width: width,
			left: -left,
		}, 300, function() { //animation complete
			elem.css({'box-shadow': '0px 0px 15px #666'})
		});
	elem.attr('onclick', '').unbind('click');
	elem.click(function(){ ZoomOUT(elem); });
}

function ZoomOUT(elem) {
	 // animate to the normal position and size
	elem.animate({
			 width: "100%",
			 left: 0,
			 top: 0,
			 zindex: 5
	}, 400, function() { // Animation complete.
		elem.css({'z-index': 0})
		elem.css({'box-shadow': '0px 0px 2px #888'})
	});
	elem.attr('onclick', '').unbind('click');
	elem.click(function(){ ZoomIN(elem); });
}

function SwitchPeriod(period) {
	var src;
	$(".maincategory img").each( function (i, val) {
		src = $(this).attr("src");
		src = src.replace(/-.*$/, "-"+period+".png");
		$(this).attr("src", src);
	});
	setCookie("period", period)
}


/*** Refresh + generated tag ***/
var generated_date;

function RefreshPage() {
	// reload the current page (but update only the footer)
	$("#footer").load(document.location + " .tagline");
	// reparse the footer date...
	var old_date = generated_date;
	ParseDate($("#footer").html());
	if (generated_date - old_date > 0) {
		// reload every image in the content div
		// forcing the reload by calling image.png?timestamp=now()
		$(".content img").each( function (i, val) {
			src = $(this).attr("src").replace(/\?timestamp=.[0-9]*/, "");
			$(this).attr("src", src+"?timestamp=" + new Date().getTime());
		});
	}
}

function ParseDate(text) {
	var patt = /[0-9]{4}-[0-9]{2}-[0-9]{2} .[0-9:]*/g; // match '2011-08-29 22:46:27'
	var full_date = patt.exec(text);
	full_date = jQuery.trim(full_date) // just to force a string, or full.split() will fail  :/
	var tmp = full_date.split(" ");
	var date = tmp[0].split("-");
	var time = tmp[1].split(":");
	generated_date = new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2]);
}

function UpdateGenerated() {
	var now = new Date();
	var diff = parseInt((now.getTime() - generated_date.getTime()) / 1000);
	var text = "page generated<br>";
	if (diff < 60) {
		if (diff == 1) text += "1 sec";
		else           text += diff+" secs";
	}else if (diff < 60 * 60) {
		var minutes = parseInt(diff / 60);
		if (minutes == 1) text += "1 min";
		else              text += minutes+" mins";
	}else if (diff < 60 * 60 * 24) {
		var hours = parseInt(diff / 60 / 60);
		if (hours == 1) text += "1 hour";
		else            text += hours+" hours";
	}else {
		var days = parseInt(diff / 60 / 60 / 24);
		if (days == 1) text += "1 day";
		else           text += days+" days";
	}
	$("#generated").html(text+" ago");
}


/*** Overview page ***/
function PopulateOverview(period) {
	$.map(overview_data, function (cat, i) {
		if (i % 3 != 0) return;
		var cat_id = 'cat_' + cat.replace(/ /g , '_');
		var name = overview_data[i+1];
		var label = overview_data[i+2];

		// inject the category div (if not yet created)
		if ($('#'+cat_id).length < 1) {
			$(".content").append($(document.createElement('div'))
				.attr('id', cat_id)
				.addClass('maincategory')
				.append($(document.createElement('div'))
					.addClass('title')
					.html(cat))
			);
		}

		// search problem (warn or crit) in the problems struct
		var s = name.split('/');
		problem_class = problems_data[s[0]]['nodes'][s[1]]['graphs'][s[2]]

		// inject the graph in the category div
		$('#'+cat_id).append( $(document.createElement('div'))
			.addClass('graph')
			.append($(document.createElement('a'))
				.attr('href', name+'.html')
				.html(label))
			.append($(document.createElement('img'))
				.attr('src', name+'-'+period+'.png')
				.addClass(problem_class))
		);
	});
}


/*** Custom Graph Modal Dialog ***/
function OpenZoomModal(static_url) {
	/* static_url: http://localhost/munin/static/dynazoom.html?cgiurl_graph=/munin-cgi/munin-cgi-graph&plugin_name=darma/localhost/df&size_x=800&size_y=400&start_epoch=1384605355&stop_epoch=1385296555
	 * img_url:    http://localhost/munin-cgi/munin-cgi-graph/darma/localhost/df-pinpoint=1384605355,1385296555.png?&lower_limit=&upper_limit=&size_x=800&size_y=400
	 */
	var cgi_url = static_url.match(/cgiurl_graph=([^&]+)/)[1];    // => /munin-cgi/munin-cgi-graph
	var plugin_name = static_url.match(/plugin_name=([^&]+)/)[1]; // => darma/localhost/df
	var start = static_url.match(/start_epoch=([^&]+)/)[1];       // => 1385189817
	var stop = static_url.match(/stop_epoch=([^&]+)/)[1];         // => 1385297817
	var size_x = static_url.match(/size_x=([^&]+)/)[1];           // => 800
	var size_y = static_url.match(/size_y=([^&]+)/)[1];           // => 400

	$("#ZoomModalLabel").html(plugin_name.replace(/\//g, " :: "));

	$('.datepicker').datepicker();
	$('#start_date').datepicker('update', new Date(start * 1000));
	$('#stop_date').datepicker('update', new Date(stop * 1000));

	$('#ZoomModal').modal()
		.data("cgi_url", cgi_url)
		.data("plugin_name", plugin_name)
		.data("size_x", size_x)
		.data("size_y", size_y);

	ReloadZoomImg();
}

function ReloadZoomImg() {
	var start = $('#start_date').datepicker('getDate').getTime() / 1000;
	var stop = $('#stop_date').datepicker('getDate').getTime() / 1000;

	var img_url = "{0}/{1}-pinpoint={2},{3}.png?size_x={4}&size_y={5}"
						.format($('#ZoomModal').data("cgi_url"),
								  $('#ZoomModal').data("plugin_name"),
								  start, stop,
								  $('#ZoomModal').data("size_x"),
								  $('#ZoomModal').data("size_y"));
	var img = $(document.createElement('img')).attr('src', img_url).addClass('i');
	$("#ZoomModalBody").html(img);
}

function FixedPeriod(h) {
	var now = new Date();
	var start = new Date(now - (h * 60 * 60 * 1000));
	$('#stop_date').datepicker('update', now);
	$('#start_date').datepicker('update', start);
	ReloadZoomImg()
}

/*** OnLoad ***/
$(document).ready(function() {
	// Update the "generated" tag in the header
	ParseDate($("#footer").html());
	UpdateGenerated()

	// Select the correct period
	period = getCookie("period");
	if (!period) period = "day";
	$("#per_"+period).prop('checked', true);
	$("#per_"+period).parent().addClass("active");
	SwitchPeriod(period);

	// Popuplate Overview
	if ((typeof overview_data !== 'undefined') && (overview_data.length > 0)) {
		$(".content").html('<h1>Overview</h1>');
		PopulateOverview(period);
	}

	//Add Hover effect to menus
	$('ul.nav li.dropdown').hover(function() {
		$(this).find('.dropdown-menu').show();
		$(this).addClass('open');
	}, function() {
		$(this).find('.dropdown-menu').hide();
		$(this).removeClass('open');
	});

	// all images inside a category will zoom on click
	$(".maincategory img").click(function() {
		ZoomIN($(this));
	});
   
	// refresh the footer every second
	window.setInterval(function() { UpdateGenerated() }, 1000);

	// ...and the images every 1 min (if actually changed)
	window.setInterval(function() { RefreshPage() }, 1*60*1000);

});

/**** Utils ****/
// String.format
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// Cookies
function setCookie(name, value) {
	document.cookie = escape(name) + "=" + escape(value) + "; path=/";
}
function getCookie(name) {
	var nameEQ = escape(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
	}
	return null;
}
function delCookie(name) {
	setCookie(name, "", -1);
}
