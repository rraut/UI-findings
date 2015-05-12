(function($){
 $.fn.parallaxSlider=function(o){ 
        
    var options = {
        prevButton: $('.prevButton')
    ,   nextButton: $('.nextButton')
    ,   duration: 1000
    ,   autoSwitcher: true
    ,   autoSwitcherDelay: 7000
    ,   parallaxEffect: true
    ,   parallaxInvert: false
    ,   slider_navs: true
    ,   slider_pagination: true
    ,   animateLayout: 'zoom-fade-eff' //simple-fade-eff, zoom-fade-eff, slide-top-eff
    ,   bufferRatio: 1.5
    }
    $.extend(options, o); 
    
    var 
        _this = $(this)
    ,   _window = $(window)
    ,   _document = $(document)
    ,   currSet = 0
    ,   currImgId = 0
    ,   ImgIdCounter = 0
    ,   itemsLength = 0
    ,   previewArray = []
    ,   isPreviewLoading = false
    ,   isPreviewAnimate = false
    ,   intervalSwitcher
    ,   parsedArray
    ,   _thisOffset =_this.offset()
    ,   _thisOffsetTop = _this.offset().top
    ,   _thisHeight = _this.height()
    ,   _thisHeightBuffer = 0
    ,   _windowWidth = _window.width()
    ,   _windowHeight = _window.height()
    ,   itemLength = 0
    ,   _baseHeight = _thisHeight + parseInt((_windowHeight - _thisHeight)/options.bufferRatio);
    ;

    var
        mainImageHolder
    ,   primaryImageHolder
    ,   secondaryHolder
    ,   mainCaptionHolder
    ,   primaryCaption
    ,   secondaryCaption
    ,   mainCaptionHolderContainer
    ,   previewSpinner
    ,   parallaxPrevBtn
    ,   parallaxNextBtn
    ,   slidesCounterList
    ,   paralaxSliderPagination
    ;

///////////////////////////// INIT /////////////////////////////////////////////////////////

    init();
    function init(){
        parsedArray = [];
            $('ul li', _this).each(
                function(){
                    parsedArray.push([$(this).attr('data-preview'), $(this).attr('data-img-width'), $(this).attr('data-img-height'), $(this).html()]);
                }
            )
        //  holder erase
        _this.html('');

        _this.addClass(options.animateLayout);

        //  preview holder build
        _this.append("<div id='mainImageHolder'><div class='primaryHolder'><img src='' alt=''></div><div class='secondaryHolder'><img src='' alt=''></div></div>");
        mainImageHolder = $('#mainImageHolder');
        primaryImageHolder = $('#mainImageHolder > .primaryHolder');
        secondarImageHolder = $('#mainImageHolder > .secondaryHolder');

         //  caption holder build
        _this.append("<div id='mainCaptionHolder'><div class='container'><div class='primaryCaption'></div><div class='secondaryCaption'></div></div></div>");
        mainCaptionHolder = $('#mainCaptionHolder');
        primaryCaption = $('.primaryCaption', mainCaptionHolder);
        secondaryCaption = $('.secondaryCaption', mainCaptionHolder);
        mainCaptionHolderContainer = $('>.container', mainCaptionHolder);

        //  controls build
        _this.append("<div class='controlBtn parallaxPrevBtn'><div class='innerBtn icon-angle-left'></div><div class='slidesCounter'></div></div><div class='controlBtn parallaxNextBtn'><div class='innerBtn icon-angle-right'></div><div class='slidesCounter'></div></div>");
        parallaxPrevBtn = $('.parallaxPrevBtn', _this);
        parallaxNextBtn = $('.parallaxNextBtn', _this);

        //  fullpreview pagination build
        _this.append("<div id='paralaxSliderPagination'><ul></ul></div>");
        paralaxSliderPagination = $('#paralaxSliderPagination');

        slidesCounterList = $('.slidesCounter', _this);
        
        //  preview loader build
        _this.append("<div id='previewSpinner'><span></span></div>");
        previewSpinner = $('#previewSpinner');

        _this.on("reBuild",
            function(e,d){
                setBuilder(d);
            }
        )

        _this.on("switchNext",
            function(e){
                nextSwither();
            }
        )

        _this.on("switchPrev",
            function(e){
                prevSwither();
            }
        )

        setBuilder({'urlArray':parsedArray});

        if(options.parallaxEffect){
            _thisHeight = _this.height();
            _thisHeightBuffer = _thisHeight*options.bufferRatio;
        }else{
            mainImageHolder.css({"height":"100%"});
            mainCaptionHolder.css({"height":"100%"});
        }

        if(!options.slider_navs){
            parallaxPrevBtn.remove();
            parallaxNextBtn.remove();
        }
        if(!options.slider_pagination){
            paralaxSliderPagination.remove();
        }


        addEventsFunction();
        autoSwitcher();
    }
    //------------------------- set Builder -----------------------------//
    function setBuilder(dataObj){ 
        currIndex = 0;
        ImgIdCounter = 0;
        previewArray = [];
        previewArray = dataObj.urlArray;
        itemLength = previewArray.length;

        $(">ul", paralaxSliderPagination).empty();
        for (var i = 0; i < itemLength; i++) {
            $(">ul", paralaxSliderPagination).append("<li></li>");
        };

        if(itemLength==1){
            console.log(paralaxSliderPagination);
            paralaxSliderPagination.remove();
            parallaxPrevBtn.remove();
            parallaxNextBtn.remove();
           
        }

        imageSwitcher(0);
        addEventsPagination();
    }

    function autoSwitcher(){
        if(options.autoSwitcher){
            if(itemLength>1){
                intervalSwitcher = setInterval(function(){
                    nextSwither();
                }, options.autoSwitcherDelay);
            }
        }
    }
    //////////////////////////    addEvents    /////////////////////////////////////////////
    function addEventsPagination(){
        $(">ul >li", paralaxSliderPagination).on("click",
            function(){
                if((!isPreviewLoading) && (!isPreviewAnimate) && ($(this).index() !== ImgIdCounter)){
                    ImgIdCounter = $(this).index();
                    imageSwitcher(ImgIdCounter);
                }
            }
        )
    }
    function addEventsFunction(){
        //--------------- controls events ----------------------//
        options.prevButton.on("click",
            function(){
                clearInterval(intervalSwitcher);
                prevSwither();
            }
        )
        options.nextButton.on("click",
            function(){
                clearInterval(intervalSwitcher);
                nextSwither(); 
            }
        )
        parallaxPrevBtn.on("click",
            function(){
                clearInterval(intervalSwitcher);
                prevSwither();
            }
        )
        parallaxNextBtn.on("click",
            function(){
                clearInterval(intervalSwitcher);
                nextSwither();
            }
        )
        //--------------- keyboard events ----------------------//
        _window.on("keydown",
            function(eventObject){
                switch (eventObject.keyCode){
                    case 37:
                        clearInterval(intervalSwitcher);
                        prevSwither();
                    break
                    case 39:
                         clearInterval(intervalSwitcher);
                        nextSwither();
                    break
                }
            }
        )
        //------------------ window scroll event -------------//
        $(window).on('scroll',
            function(){
                mainScrollFunction();
            }
        ).trigger('scroll');
        //------------------ window resize event -------------//
        $(window).on("resize",
            function(){
                mainResizeFunction();
            }
        )
    }
    //-----------------------------------------------------------------
    function prevSwither(){
        if(!isPreviewLoading && !isPreviewAnimate){
            if(ImgIdCounter > 0){
                ImgIdCounter--;
            }else{
                ImgIdCounter = itemLength-1;
            }
                imageSwitcher(ImgIdCounter);
        }
    }
    function nextSwither(){
        if(!isPreviewLoading && !isPreviewAnimate){
            if(ImgIdCounter < itemLength-1){
                ImgIdCounter++;
            }else{
                ImgIdCounter = 0;
            }
            imageSwitcher(ImgIdCounter);
        }
    }
    //------------------------- main Swither ----------------------------//
    function imageSwitcher(currIndex){ 
        slidesCounterList.text((currIndex+1) + '/'+itemLength);
        $(">ul >li", paralaxSliderPagination).removeClass('active').eq(currIndex).addClass('active');

        $('> img', primaryImageHolder).attr('src','').attr('src', previewArray[currIndex][0]);
        $('> img', primaryImageHolder).attr('data-image-width', previewArray[currIndex][1]);
        $('> img', primaryImageHolder).attr('data-image-height', previewArray[currIndex][2]);
        objectCssTransition(primaryImageHolder, 0, 'ease');
        primaryImageHolder.addClass('animateState');

        primaryCaption.html(previewArray[currIndex][3]);
        objectCssTransition(primaryCaption, 0, 'ease');
        primaryCaption.addClass('animateState');

        isPreviewLoading = true;
        isPreviewAnimate = true;
        previewSpinner.css({display:'block'}).stop().fadeTo(300, 1);
        $('> img', primaryImageHolder).on('load', function(){ 
            isPreviewLoading = false;
            previewSpinner.stop().fadeTo(300, 0, function(){ $(this).css({display:'none'}); })
            $(this).off('load');
            objectResize($('> img', primaryImageHolder), _windowWidth, _baseHeight);

            objectCssTransition(primaryImageHolder, options.duration, 'outCubic');
            primaryImageHolder.removeClass('animateState');
            objectCssTransition(secondarImageHolder, options.duration, 'outCubic');
            secondarImageHolder.addClass('animateState');

            objectCssTransition(primaryCaption, options.duration, 'outCubic');
            primaryCaption.removeClass('animateState');
            objectCssTransition(secondaryCaption, options.duration, 'outCubic');
            secondaryCaption.addClass('animateState');


            mainCaptionHolderContainer.height(primaryCaption.height());

            setTimeout(
                function(){
                    objectCssTransition(secondarImageHolder, 0, 'ease');
                    secondarImageHolder.removeClass('animateState');

                    $('> img', secondarImageHolder).attr('src', "").attr('src', previewArray[currIndex][0]);
                    $('> img', secondarImageHolder).attr('data-image-width', previewArray[currIndex][1]);
                    $('> img', secondarImageHolder).attr('data-image-height', previewArray[currIndex][2]);
                    
                    secondaryCaption.html(previewArray[currIndex][3]);
                    objectCssTransition(secondaryCaption, 0, 'ease');
                    secondaryCaption.removeClass('animateState');

                    objectResize($('> img', secondarImageHolder), _windowWidth, _baseHeight);
                    isPreviewAnimate = false;
                }, options.duration
            )
        });
    }

    //----------------------------------------------------//
    function objectCssTransition(obj, duration, ease){
        var durationValue;

        if(duration !== 0){
            durationValue = duration/1000;
        }else{
            durationValue = 0
        }

        switch(ease){
            case 'ease':
                    obj.css({"-webkit-transition":"all "+durationValue+"s ease", "-moz-transition":"all "+durationValue+"s ease", "-o-transition":"all "+durationValue+"s ease", "transition":"all "+durationValue+"s ease"});
            break;
            case 'outSine':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)", "transition":"all "+durationValue+"s cubic-bezier(0.470, 0.000, 0.745, 0.715)"});
            break;
            case 'outCubic':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)", "transition":"all "+durationValue+"s cubic-bezier(0.215, 0.610, 0.355, 1.000)"});
            break;
            case 'outExpo':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)", "transition":"all "+durationValue+"s cubic-bezier(0.190, 1.000, 0.220, 1.000)"});
            break;
            case 'outBack':
                obj.css({"-webkit-transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)", "-moz-transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)", "-o-transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)", "transition":"all "+durationValue+"s cubic-bezier(0.175, 0.885, 0.320, 1.275)"});
            break;
        }
    }
    //----------------------------------------------------//
    function objectResize(obj, baseWidth, baseHeight )
    {
        var imageRatio,
            newImgWidth,
            newImgHeight,
            newImgTop,
            newImgLeft;
        
        originalImgWidth = obj.data('image-width');
        originalImgHeight = obj.data('image-height');

        imageRatio = originalImgHeight/originalImgWidth;
        containerRatio = baseHeight/baseWidth;

        if(containerRatio > imageRatio){
            newImgHeight = baseHeight;
            newImgWidth = Math.round( (newImgHeight*originalImgWidth) / originalImgHeight );   
        }else{
            newImgWidth = baseWidth;
            newImgHeight = Math.round( (newImgWidth*originalImgHeight) / originalImgWidth );
        }

        newImgLeft=-(newImgWidth-baseWidth)*.5;
        newImgTop= -(newImgHeight-baseHeight)*.5;
        
        obj.css({width: newImgWidth, height: newImgHeight, marginTop: newImgTop, marginLeft: newImgLeft});
    }
    //------------------- main window scroll function -------------------//
    function mainScrollFunction(){
            var 
                _documentScrollTop
            ,   startScrollTop
            ,   endScrollTop
            ,   visibleScrollValue
            ;

            _thisOffsetTop = _thisOffset.top;
            _documentScrollTop = _document.scrollTop();

            startScrollTop = _documentScrollTop + _windowHeight;
            endScrollTop = _documentScrollTop - _thisHeight;

            visibleScrollValue = startScrollTop - endScrollTop;

            if( (startScrollTop > _thisOffsetTop) && (endScrollTop < _thisOffsetTop) && (options.parallaxEffect)){
                var x = _window.scrollTop();
                
                y = _documentScrollTop - _thisOffsetTop;
                mainImageHolder.css('top', parseInt(y / options.bufferRatio) + 'px');
                mainCaptionHolder.css('top', parseInt(y / options.bufferRatio/2.75) + 'px');
            }
    }
    
    //------------------- main window resize function -------------------//
    function mainResizeFunction(){
        _windowWidth = _window.width();
        _windowHeight = _window.height();
        _thisHeight = _this.height();
        _thisHeightBuffer = _thisHeight*options.bufferRatio;
        _baseHeight = _thisHeight + parseInt((_windowHeight - _thisHeight)/options.bufferRatio);

        objectResize($('> img', primaryImageHolder), _windowWidth, _baseHeight);
        objectResize($('> img', secondarImageHolder), _windowWidth, _baseHeight);
    }
    //end window resizefunction
    //--------------------------------------------------------------------//
    function toDegrees (angle) {
      return angle * (180 / Math.PI);
    }
    function toRadians (angle) {
      return angle * (Math.PI / 180);
    }
////////////////////////////////////////////////////////////////////////////////////////////              
    }
})(jQuery)