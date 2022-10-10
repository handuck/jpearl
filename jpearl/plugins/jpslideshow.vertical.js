// (function($){

$.js.plugins.slideshow.vertical = function(slideshow, props){
	this.init(slideshow,props);
}

var cls = $.js.plugins.slideshow.vertical;

cls.prototype.init = function(slideshow,props)
{
	this.slideshow = slideshow;
	this.properties = $.extend( {

	},props);
	this.slideshow.element.addClass('vertical');
}


cls.prototype._goForward = function(easing)
{
	var h = this.slideshow.element.height();
	var self = this;
	this.slideshow.children.items[1].css({ zIndex: 3 });
	this.slideshow.children.items[0].css({ zIndex: 2 });
	this.slideshow.children.items[2].css({ zIndex: 1,
  		top: 2*h 
	});
	this.slideshow.children.container.stop(false,true);
	this.slideshow.children.container.animate({
		marginTop: -h
	},{
		duration: 500,
		easing: easing || this.properties.easing,
		complete: function(e){
			self.slideshow.children.container.css({
				marginTop: 0
			});				
			self._reset(1);
		}		
	});
}

cls.prototype._goBack = function(easing)
{
	var h = this.slideshow.element.height();
	var self = this;
	this.slideshow.children.items[1].css({ zIndex: 3 });
	this.slideshow.children.items[2].css({ zIndex: 2 });
	this.slideshow.children.items[0].css({ zIndex: 1,
		top: -2*h
   	});
	this.slideshow.children.container.stop(true,true);
	this.slideshow.children.container.animate({
		marginTop: h
	},{
		duration: 500,
		easing: easing || this.properties.easing,
		complete: function(e){
			self.slideshow.children.container.css({
				marginTop: 0
			});				
			self._reset(-1);
		}		
	});
}

cls.prototype._reset = function(dir, animated)
{
	var h = this.slideshow.element.height();
	this.slideshow.children.items.forEach( function(v,idx){
		v.css({ top: h * (idx-1)});
	}, this);
}


cls.prototype.transition = function(dir)
{
	switch( dir )
	{
		case 1:
			this._goForward();
			break;
		case -1:
			this._goBack();
			break;
		default: 
			this._reset(dir);
			break;
	}		
}

// })(jQuery);
