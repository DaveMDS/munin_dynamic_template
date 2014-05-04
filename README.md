munin_dynamic_template
======================

JQuery/Bootstrap based template for munin and munin2

This is not just a graphic redesign template, it's a full rethink of the munin
interface. It use jQuery and Bootstrap to enhance the user experience and
for for generating the pages.

# Features:

 - Full dynamic generation of the pages using javascript.
 - Configurable overwiew page: you can choose the graphs to show in the main page.
 - Pages show small thumbnails of the graphs that you can click to zoom real size.
 - Automatic reload of the images, so that you always look at the latest graph.
 - Ability to switch time period (week,day,year, etc) on the fly, just reloading the images.
 - and more...

# Install:

To install the template just clone the repo in your munin config dir (or download
the files and put them there), the repo contains two different template, one for
munin 1.x and one for munin 2.x.

To use the new template you just need to edit your munin.conf file:
```
tmpldir /etc/munin/munin_dynamic_template/munin2
staticdir /etc/munin/munin_dynamic_template/munin2/static
```
or adjust to suite wherever you have cloned the files. Wait 5 minutes and your
munin should look better :)
