(function($){

	$(document).ready(function(){

		$('.nav__primary>ul>li>a').each(function(){
	        var $this = $(this),
	            txt = $this.text();
		        $this.html('<div><span>'+ txt +'</span></div><div><span>'+ txt +'</span></div>');
		});

		/*$('.portfolio_item_holder')
	        .on('mouseover',function(e){
	            $(this).find('.caption__portfolio').addClass('act_1');
	        })
	        .on('mouseout', function(e) {
	            $(this).find('.caption__portfolio').removeClass('act_1');    
	    });*/

	    /*$('#sidebar>#categories-2>ul>li>a').each(function(){
	        var $this = $(this),
	            txt = $this.text();
		        $this.html('<strong>'+ txt +'</strong>');
		});*/

		 /*$(window).resize(
		   function(){
		    $('.parallax-slider').width($(window).width());
		    $('.parallax-slider').css({width: $(window).width(), "margin-left": ($(window).width()/-2)});
		   }
		  ).trigger('resize');*/


	});

 
})(jQuery);
