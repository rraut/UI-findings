/* 
    jQuery Page Scroller plugin - v2.0   
    Copyright (c) 2011 Daniel Thomson
    
    Licensed under the MIT license:
    http://www.opensource.org/licenses/mit-license.php
*/
// OPTIONS: 
// nav              : 'string'  - the selector of the navigation list
// addEvents        : 'boolean' - allows/disables events in the children of the nav items
// activeClass      : 'string'  - the class on the active list item
// hasAnchor        : 'boolean' - sets whether an anchor on the page is associated with the nav item.
// speed            : 'integer' - sets the animation speed 
// startPosition    : 'integer' - the item that the plugin starts on  

// version 1.0 - basic functionality
// version 1.1 - changed the animation of the position of the parent, to animate to a scroll position
// version 2.0 - refactored the code with the new architecture: https://github.com/dansdom/plugins-template-v2
//              - also fixed a bug with the scroll binding interferring with the move scroller function. I have added the flag this.el.isAnimating to fix
// version 2.1 - moved getScrollPosition code into it's own public function
//              - added touch support with the inputEvent option
//              - created public function to bind the keyboard so I can use multiple pageScrollers on the same page

(function ($) {
    // this ones for you 'uncle' Doug!
    'use strict';
    
    // Plugin namespace definition
    $.PageScroller = function (options, element, callback)
    {
        // wrap the element in the jQuery object
        this.el = $(element);
        // this is the namespace for all bound event handlers in the plugin
        this.namespace = "pageScroller";
        // extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
        this.opts = $.extend(true, {}, $.PageScroller.settings, options);
        this.init();
        // run the callback function if it is defined
        if (typeof callback === "function")
        {
            callback.call();
        }
    };
    
    // these are the plugin default settings that will be over-written by user settings
    $.PageScroller.settings = {
        'nav'           : '.scrollerNav ul',    // class of the scroller nav
        'addEvents'     : false,                // allows events in the nav items children
        'activeClass'   : 'active',             // nav active class
        'hasAnchor'     : true,                 // if no anchor associated with each item then set to false
        'speed'         : 800,                  // speed the animation goes
        'easing'        : 'easeInOutBack',      // easing effect on the animation
        'startPosition' : 0,                    // set the start position of the scroller
        'inputEvent'    : 'click'
    };
    
    // plugin functions go here
    $.PageScroller.prototype = {
        init : function() {
            // going to need to define this, as there are some anonymous closures in this function.
            // something interesting to consider
            var scroller = this;
            
            // this seems a bit hacky, but for now I will unbind the namespace first before binding
            this.destroy();
            
            this.el.nav = $(this.opts.nav);
            this.el.nav.size = this.el.nav.children().length;
            this.el.counter = this.opts.startPosition;
            this.el.isAnimating = false;
            if (!$.ui)
            {
                this.opts.easing = "linear";
            }
                        
            // add the active class to the starting element
            this.el.nav.children(":eq(" + this.opts.startPosition + ")").addClass(this.opts.activeClass);
            
            // add the navigation events
            this.addNav();
            
            // add event handling to detect where in the scroller the user is on window scroll
            $(window).bind('scroll.' + this.namespace, function(){
                scroller.getScrollPosition();
            });
            
        },
        getScrollPosition : function() {

            var scroller = this;

            // if the element is currently animating then don't do the scrolling function
            if (!scroller.el.isAnimating)
            {
                //console.log($(window).scrollTop());
                // the first thing I need to detect is when the user gets to the bottom of the page. then I can just add active to the last item in the scroll nav
                var scrollY = $(window).scrollTop(),
                    winY = $(window).height(),
                    docY = $(document).height(),
                    elementPositions = [],
                    elementsLength,
                    i,
                    currentItem = 0;
                
                if ((scrollY + winY) >= docY)
                {
                    // then we are definately on the last item
                    // do code for last item here
                    //console.log("i hit the end of the document");
                    scroller.el.nav.children(":not(:last)").removeClass("active");
                    scroller.el.nav.children(":last").addClass("active");
                    scroller.el.counter = scroller.el.nav.children.length + 1;
                }
                else
                {
                    // set up function to detect where abouts on the page we are
                    // get the scroll positions of each anchor, then find out which is closest
                    scroller.el.nav.children().each(function(){
                        var selector,
                            itemPosition;
                            
                        if ($(this).attr("href"))
                        {
                            selector = $(this).attr("href");
                        }
                        else
                        {
                            selector = $(this).find("a").attr("href");
                        }
                        itemPosition = Math.floor($(selector).offset().top);
                        //console.log("pos: "+itemPosition+", scrollY: "+scrollY);
                        elementPositions.push(itemPosition);    
                            
                    });
                        
                    //console.log(elementPositions);
                    // loop through the element positions and find the closest one to the window scrollposition
                    elementsLength = elementPositions.length;
                    for (i = 0; i < elementsLength; i += 1)
                    {                        
                        //console.log((scrollY - elementPositions[i]));
                        if ((scrollY - elementPositions[i]) > -1)
                        {
                            currentItem = i;
                        }
                    }
                    //console.log("currentItem: "+currentItem);
                    scroller.el.nav.children(":not(:eq(" + currentItem + "))").removeClass("active");
                    scroller.el.nav.children(":eq(" + currentItem + ")").addClass("active");
                    // watch out for the top one. if none have been passed then show the first item. If no item was selected then show the first
                }
            }
        },
        addNav : function()
        {
            var scroller = this;
            // add click events for each of the nav items
            this.el.nav.children().each(function()
            {
    
                $(this).bind(scroller.opts.inputEvent + '.' + scroller.namespace, function(){
                    // set the scroller counter
                    scroller.el.counter = $(this).parent().children().index(this);
                    scroller.moveScoller();
                    return false;
                });
                
                // make sure everything below won't trigger an event if not desired
                if (scroller.opts.addEevnts === false)
                {
                    $(this).children().bind(scroller.opts.inputEvent + '.' + scroller.namespace, function(){
                        consoleLog("returning false");
                        return false;
                    });
                }
                
            });

            //this.bindKeyboard(); 
        },
     /*   bindKeyboard : function() {

            var scroller = this;
            $(document).unbind('keydown.' + scroller.namespace);
            // add keyboard events for the scroller
            $(document).bind('keydown.' + scroller.namespace, function(e)
            {
                //console.group("keydown function");
                //console.log("counter before: " + scroller.el.counter);
                // you can use the right and down arrows to move forward
                if (e.keyCode == 39 || e.keyCode == 40)
                {
                    // show the next box
                    scroller.el.counter += 1;
                    if (scroller.el.counter == scroller.el.nav.size)
                    {
                        //console.log("counter = nav size");
                        scroller.el.counter = 0;
                    }
                    //console.log("counter after: " + scroller.el.counter);
                    scroller.moveScoller();
                    //console.groupEnd();
                    return false;
                }
                // you can use the left and up arrows to move backward
                else if (e.keyCode == 37 || e.keyCode == 38)
                {
                    // show the previous box
                    scroller.el.counter -= 1;
                    if (scroller.el.counter < 0)
                    {
                        //console.log("counter is at the end");
                        scroller.el.counter = scroller.el.nav.size - 1;
                    }
                    //console.log("counter after: " + scroller.el.counter);
                    scroller.moveScoller();
                    //console.groupEnd();
                    return false;
                }
                
            });
        }, */
        moveScoller : function(index)
        {
            var scroller = this,
                currentNavItem,
                currentHref,
                currentItem,
                itemOffset;
                
            if (typeof index != 'undefined')
            {
                this.el.counter = index;
            }
            
            currentNavItem = this.el.nav.children(":eq(" + this.el.counter + ")");
            // flag to show that scroller is animating
            this.el.isAnimating = true;
            // find my href value
            if (currentNavItem.attr("href"))
            {
                currentHref = currentNavItem.attr("href");
            }
            else
            {
                currentHref = currentNavItem.find("a").attr("href");
            }
            //console.log("move scroller current item: " + this.el.counter);
            currentItem = $(currentHref);
            
            // find the offset of the div
            itemOffset = Math.ceil(currentItem.offset().top);
            // do the add and remove of active class
            this.el.nav.children().removeClass(this.opts.activeClass);
            currentNavItem.addClass(this.opts.activeClass);
            
            $("html,body").stop().animate({scrollTop:itemOffset}, this.opts.speed, this.opts.easing, function(){scroller.el.isAnimating = false;});
        },
        option : function(args) {
            this.opts = $.extend(true, {}, this.opts, args);
        },
        destroy : function() {
            this.el.unbind("." + this.namespace);
            $(document).unbind("." + this.namespace);
        }
    };
    
    // the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
    // props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
    $.fn.pageScroller = function(options, callback) {
        // define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
        var pluginName = "pageScroller",
            args;
        
        // if the argument is a string representing a plugin method then test which one it is
        if ( typeof options === 'string' ) {
            // define the arguments that the plugin function call may make 
            args = Array.prototype.slice.call( arguments, 1 );
            // iterate over each object that the function is being called upon
            this.each(function() {
                // test the data object that the DOM element that the plugin has for the DOM element
                var pluginInstance = $.data(this, pluginName);
                
                // if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
                if (!pluginInstance) {
                    alert("The plugin has not been initialised yet when you tried to call this method: " + options);
                    return;
                }
                // if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
                if (!$.isFunction(pluginInstance[options]) || options.charAt(0) === "_") {
                    alert("the plugin contains no such method: " + options);
                    return;
                }
                // apply the method that has been called
                else {
                    pluginInstance[options].apply(pluginInstance, args);
                }
            });
            
        }
        // initialise the function using the arguments as the plugin options
        else {
            // initialise each instance of the plugin
            this.each(function() {
                // define the data object that is going to be attached to the DOM element that the plugin is being called on
                var pluginInstance = $.data(this, pluginName);
                // if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
                if (pluginInstance) {
                    pluginInstance.option(options);
                    // initialising the plugin here may be dangerous and stack multiple event handlers. if required then the plugin instance may have to be 'destroyed' first
                    //pluginInstance.init(callback);
                }
                // initialise a new instance of the plugin
                else {
                    $.data(this, pluginName, new $.PageScroller(options, this, callback));
                }
            });
        }
        
        // return the jQuery object from here so that the plugin functions don't have to
        return this;
    };

    // end of module
})(jQuery);
