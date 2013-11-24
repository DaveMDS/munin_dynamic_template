
function ZoomIN(elem) {
   // all out
   // $(".maincategory img").each(function() {
   $('[zindex="0"]').each(function() {
      ZoomOUT($(this));
      alert($(this));
   });
   // $('img[z-index="10"]').next().ZoomOUT();

   // get the original image size
   elem.css({'width': 'auto','position': 'relative','z-index': 10});
   var width = elem.width();
   var height = elem.height();
   elem.css({'width': '100%'})

   // calc a left offset to zoom centered
   var left = width / 2 - elem.width() / 2;
   // var top = height / 2 - $(this).height() / 2;
   var top = 0;

   // keep the image inside the screen
   if (elem.offset().left - left < 20) // check left border
      left = 20;
   if (elem.offset().left - left > $(document).width() - width) // right
      left = width - elem.width() - 40;

   // animate to the original size and the new position
   elem.animate({
         width: width,
         left: -left,
         top: -top
      }, 300, function() { //animation complete
         elem.css({'box-shadow': '0px 0px 15px #666'})
      });
   elem.unbind('click');
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
   elem.unbind('click');
   elem.click(function(){ ZoomIN(elem); });
}

function SwitchPeriod(o_radio) {
   //alert(o_radio.value);
   var src = ""
   $(".contents img").each( function (i, val) {
      src = $(this).attr("src");
      src = src.replace(/-.*$/, "-"+o_radio.value+".png");
      $(this).attr("src", src);
   });
}

function RefreshPage() {
   // load the whole overview page just to parse the generated date :P
   $.get('index.html', function(data) {
      // on load-done parse the generated date
      var old_date = generated_date;
      ParseDate(data);
      if (generated_date != old_date) {
         // reload every image in the content div
         // forcing the reload by calling image.png?timestamp=now()
         $(".contents img").each( function (i, val) {
            src = $(this).attr("src").replace(/\?timestamp=.[0-9]*/, "");
            $(this).attr("src", src+"?timestamp=" + new Date().getTime());
         });
      }
   });
}

var generated_date;


function ParseDate(text) {
   // alert("parse: "+text);
   var patt = /[0-9]{4}-[0-9]{2}-[0-9]{2} .[0-9:]*/g; // match '2011-08-29 22:46:27'
   var full_date = patt.exec(text);
   // alert(full);
   full_date = jQuery.trim(full_date) // just to force a string, or full.split() will fail  :/
   var tmp = full_date.split(" ");
   var date = tmp[0].split("-");
   var time = tmp[1].split(":");
   generated_date = new Date(date[0], date[1]-1, date[2], time[0], time[1], time[2]);
   //alert("orig: "+orig+"\ndate: '"+date+"'\ntime: '"+time+"\ngen: "+generated_date);
}

function UpdateFooter() {
   var now = new Date();
   var diff = parseInt((now.getTime() - generated_date.getTime()) / 1000);
   var text = "page generated<br>";
   if (diff < 60) {
      if (diff == 1) text += "1 second";
      else           text += diff+" seconds";
   }else if (diff < 60 * 60) {
      var minutes = parseInt(diff / 60);
      if (minutes == 1) text += "1 minute";
      else              text += minutes+" minutes";
   }else if (diff < 60 * 60 * 24) {
      var hours = parseInt(diff / 60 / 60);
      if (hours == 1) text += "1 hour";
      else            text += hours+" hours";
   }else {
      var days = parseInt(diff / 60 / 60 / 24);
      if (days == 1) text += "1 day";
      else           text += days+" days";
   }
   $(".footer").html(text+" ago");
}

function LoadNode(url) {
   // load the given url in the 'dynview' div
   $(".dynview").load(url, function(responseText, textStatus, XMLHttpRequest) {
      // on load done:
      var url = "";
      var period = $("input:radio[name=period]:checked").val();
      $(".dynview img").each( function(i, o_img) {
         // fix the 'src' attrib of each image, parsing the <a> below.... what an hack :/
         url = $(this).parent().children("a").attr("href");
         url = url.replace("javascript:LoadService('", "");
         url = url.replace("');", "");
         // and assure the selected period is respected
         url2 = url.replace(".html", "-"+period+".png");
         $(this).attr("src", url2);
         // make the new images zoomable
         $(this).click(function() { ZoomIN($(this));});
      });
   });
}

function LoadService(url) {
   // load the given url in the 'dynview' div
   $(".dynview").load(url, function(responseText, textStatus, XMLHttpRequest) {
      var path = $(".dynview .title").html().trim();
      $(".dynview img").each( function(i, o_img) {
         // fix the 'src' attrib of each image
         imgn = $(this).attr("src");
         imgn = imgn.replace("./", ""); // remove the starting './'
         path = path.replace("//", "");// remove every double slash '//'
         path = path.replace(/^\//, "");// remove slash '/' from the start
         path = path.split("/");
         path = path[0]+"/"+path[1]+"/"+imgn;
         $(this).attr("src", path);
      });
   });
}

$(document).ready(function() {
   // make the footer shorter and smarter
   ParseDate($(".footer").html());
   UpdateFooter()

   // if there is a 'dynview' div populate it with graphs from
   // the overview_data array.
   if ($(".dynview").length > 0) {
      var name,label, html, need_cat;
      $(".dynview").append("<div class='title'>Overview</div>");
      $.map(overview_data, function (cat, i) {
         if (i % 3 != 0) return;
         name = overview_data[i+1];
         label = overview_data[i+2];

         // inject the category div (if not yet created)
         if ($("#cat_"+cat).length < 1) {
            html  = "<div class='maincategory' id='cat_"+cat+"'>";
            html += "<div class='title'>"+cat+"</div>";
            html += "</div>";
            $(".dynview").append(html);
         }

         // inject the graph in the categoory div
         html  = "<div class='graph'>";
         html += "<a href=\"javascript:LoadService('"+name+".html')\">"+label+"</a>";
         html += "<img  src='"+name+"-week.png'/>";
         html += "</div>";
         $("#cat_"+cat).append(html);
      });
   }

   // all images inside a category will zoom on click
   $(".maincategory img").click(function() {
      ZoomIN($(this));
   });

   // calculate numbers of warn & crit per each host
   $(".navigator > .tree > ul > li > ul").each(function(i, o) {
      var warn = $(this).find("a.warn").length;
      var crit = $(this).find("a.crit").length;
      var text = " (";
      if (warn || crit) {
         if (warn) text += "<span class='warn'>"+warn+"</span>";
         if (warn && crit) text += "-";
         if (crit) text += "<span class='crit'>"+crit+"</span>";
         text += ")";
         $(this).find("a").first().append(text);
      }
   });

   // refresh the footer every second
   window.setInterval(function() { UpdateFooter() }, 1000);
   // ...and the images every 2 min
   window.setInterval(function() { RefreshPage() }, 2*60*1000);
});

