/*
 Copyright (C) 2018 Sang-Gook Han(handuckjs@gmail.com)
 This file is part of JPearl

 JPearl is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 JPearl is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License  
 along with this program. If not, see http://www.gnu.org/licenses/.
*/

JPDialog.stack = [];

function JPDialog(element,props)
{
	if ( arguments.length == 0 ) return;
	JPView.call(this,element,$.extend(true,{
		mode: 'modal',
		url: undefined,
		removeAfterDismiss: true,
		position: 'center'
	}, props));
	var self = this;
	this.element.addClass('dialog').addClass(this.properties.mode);
	this.messageCallback = {};

	if ( this.properties.url )
	{
		/*
		$(this.element).load( this.properties.url, function(){
			if ( !self.element.parent() )
			{
				self.element.appendTo($('body')).hide();
			}
			self._initialize();	
		});		
		*/
		
		this.request({
			url: this.properties.url, 
			type: 'GET',
			cache: this.properties.cache || false,
			data: this.properties.data, 
			dataType: 'html',
			headers: {
				"X-JP-TYPE": "viewcontroller"
			}
		}, function(err,html){
			if ( err )  {
				self.element.html(err.responseText);
				if ( !self.element.parent() ) {
					self.element.appendTo($('body')).hide();
				}
			} else {
				if ( $.url ) {
					self.urlParams = $.extend({},$.url.params);
				}
				self.element.html(html);
				if ( !self.element.parent() ) {
					self.element.appendTo($('body')).hide();
				}
				self._initialize();					
			}
		});
		
	}
	else
	{
	   	if ( this.properties.createChildren )
		{
			this.properties.createChildren();
		}
		this._initialize();
	}
}

$.plugin(JPDialog);

JPDialog.prototype = new JPView();

JPDialog.prototype._initHeader = function()
{
	var header = this.body.children('.header');
	if ( this.properties.title )
	{
		if ( header.length == 0 ) {
			var body = this.body.children('.body');
			header = $('<div/>').addClass('header');
			if ( body.length ) {
				header.insertBefore(body);
			} else {
				this.element.prepend(header);
			}
		}
		if ( this.properties.icon ) {
			if ( $('img.icon', header).length == 0 ) {
				$('<img/>',{
					src:this.properties.icon
				}).addClass('icon').appendTo(header);
			} else {
				$('img.icon', header).attr('src',  this.properties.icon );
			}
		}
		if ( $('.title', header).length == 0 ) {
			$('<div/>',{ text: this.properties.title } )
				.addClass('title').appendTo(header);
		} else {
			$('.title', header).text(this.properties.title);
		}
		if ( $('.close', header).length == 0 ) {
			$('<div/>').addClass('button close').appendTo(header);
		}
	}
	this.children.header = header;
}

JPDialog.prototype.title = function(value)
{
	this.properties.title = value;
	if ( this.body ) {
		var header = this.body.children('.header');
		$('.title', header).html(value);
	}
}

JPDialog.prototype._initFooter = function()
{
	var footer = this.body.children('.footer ');
	if ( this.properties.buttons ) {
		var self = this;
		if ( footer.length == 0 ) {
			footer = $('<footer/>').addClass('footer').appendTo(this.element);
		}
		var props = this.properties;
		for(var i = 0 ; i < props.buttons.length ; i++ )
		{
			if ( typeof props.buttons[i] == 'string' )
			{
				props.buttons[i] = $('<div/>').JPButton({
					normalTitle: props.buttons[i]
				});	
			}	
			else if ( $.isPlainObject( props.buttons[i] ) )
			{
				props.buttons[i] = $('<div/>').JPButton(props.buttons[i]);	
			}
			props.buttons[i].appendTo(footer);
			props.buttons[i].click(i,function(e){
				self.element.trigger('buttonClick', [e.data, $(this)] )		
				self.dismiss(e.data);
			});
		}
	}
	this.children.footer = footer;
}

JPDialog.prototype._initialize = function()
{
	if ( this._initDone ) return;
	var self = this;
	if ( this.element.children('.header').length > 0 ) {
		this.body = this.element;
	} else {
		this.body = this.element.children('div,section,article,nav,p,dialog,main').eq(0);
	}
	this.children.body = this.body.children('.body');
	self._initHeader();
	self._initFooter();
	new JPDrag(this.children.header, {
		binding: false
	});
	this.body.bind('viewLoaded',function(e){
		e.stopPropagation();
		if ( self._msgCbReady ) {
			self._msgCbReady.forEach(function(v){
				if ( self.messageCallback[v.command] ) {
					self.messageCallback[v.command].apply( self, v.args );
				}
			});
			delete self._msgCbReady;
		}
	});
	this.body.bind('viewUnloaded',function(e){
		e.stopPropagation();
	});
	if ( this.properties.mode == 'modal') 
	{
		NotificationCenter.addObserver( this, 'WindowResized', function(e){
			self.centering();
		});			
	}
	this.children.header.bind('dragging', function(e, ptr,delta,position){
		var off = self.element.offset();
		self.element.css({
			left: off.left + delta.x,
			top: off.top + delta.y
		});
		return false;
	}).bind('dragDone', function(e, ptr,delta,position){
		return false;
	});
	if ( this.properties.url )
	{
   		 this.element.find('[data-plugin]').each( function(idx,obj){ 
		 	var cls = $(obj).data('plugin');
			var name = $(obj).data('name');
			if ( $(obj)[cls] ) {
				var inst = $(obj)[cls]();
				self.children[name] = inst;
			} else {
				throw "Plugin, " + cls + " not found";
			}
		}); 
	    this.element.PageAction();
		this.element.find('[data-plugin]').each( function(idx,obj){
			var inst = $(obj).instance();
			if ( inst && inst._initialized ) {
				inst._initialized();
			}
		});
	}
	this.element.find('.button.close').click(function(e){
		self.dismiss();
		return false;
	});
	this._initDone = true;
//	this.element.bind('wheel', function(e){
//		e.stopPropagation();
//		if ( $(e.currentTarget).hasClass('dialog') ) return;
//		return false;
//	});
	self.element.hide();
	self.element.trigger('initialized');
	self.body.trigger('viewLoaded', [this]);
	if(self._needToShow) {
		self.element.show();
		self.centering();
		self.body.trigger('viewWillAppear', [self]);
		delete self._needToShow;
	}
}

JPDialog.prototype.destroy = function()
{
	NotificationCenter.removeObserver(this);	
	this.element.remove();
	$.js.popup.hide();
}

JPDialog.prototype.calcPosition = function()
{
	var x = ( window.innerWidth - this.element.outerWidth(true))/2;
	var y = ( window.innerHeight - this.element.outerHeight(true))/2;
	if ( this.properties.position && this.properties.position != 'center') {
		var items = Array.isArray( this.properties.position ) ? this.properties.position : this.properties.position.split(',');
		if ( items[0] != 'center' ) {
			var p = parseInt(items[0]);
			if ( p < 0 ) {
				x = window.innerWidth + p;
			} else {
				x = p;
			}
		} 
		if ( items[1] != 'center' ) {
			var p = parseInt(items[1]);
			if ( p < 0 ) {
				y = window.innerHeight + p;
			} else {
				y = p;
			}
		}
	}
	return { left: x, top: y};
}

JPDialog.prototype.centering = function()
{
	this.element.css( this.calcPosition() );
}

JPDialog.prototype.show = function(opts,callback,animated)
{
	var self = this;
	
	
	if ( typeof opts == 'function' ) {
		animated = callback;
		self.callback = opts;
		self.options = undefined;
	} else {
		self.callback = callback;
		self.options = opts;
	}
	var bodyExists = this.body;
	if ( bodyExists ) {
		this.body.trigger('viewWillAppear', [this]);
	}
	
	
	if ( this.properties.mode == 'modal' )
	{
		if ( !this.children.screenblock )
		{
			this.children.screenblock = $('<div/>').addClass('jpview modalblock').appendTo($('body'));
			this.children.screenblock.bind('wheel', function(e){
				return false;
			});
		}		
		if( this._initDone ) {
			this.element.appendTo($('body'));	
			self.element.show();
			setTimeout( ()=> {
				self.centering();
			});
			if (!bodyExists && self.body ) {
				self.body.trigger('viewWillAppear', [self]);
			}
		}
		else {
			this.element.appendTo($('body'));	
			self._needToShow = true;
		}
	}	 
	else {
		this.element.appendTo($('body'));
		setTimeout(function(){
			self.element.show();
			self.centering();
		},100);
	}


	if ( animated )
	{
		this.element.get(0).scale = 0.3;
		this.transform({ scale: 1 },{
			duration: 1000,
			easing: 'elasticOut',
			complete: function() {
				if ( self.body ) {
					self.body.trigger('viewDidAppear', [self]);
				}
			}
		});
	}
	else
	{
		if ( this.body ) 
		{
			setTimeout(function(){
				self.body.trigger('viewDidAppear', [self]);
			},0);
		}
	}
	JPDialog.stack.push(this);
	$.js.dialog = this;
	
	setTimeout(function(){
		self.element.addClass('appear');
	}, 50);
}

JPDialog.prototype.dismiss = function(args,animated)
{
	var self = this;
	if ( this.body ) this.body.trigger('viewWillDisappear', [this]);
	if ( this.children.screenblock )
	{
		this.children.screenblock.remove();
		delete this.children.screenblock;
	}
	NotificationCenter.removeObserver(this);
	this.element.trigger('dismiss',args);
	if ( this.callback ) {
		this.callback(args);
		delete this.callback;
		delete this.options;
	}
	var self = this;
	if ( animated ) {
		this.element.removeClass('appear');
		this.transform({ scale: 0 },{
			duration: 1000,
			easing: 'elasticOut',
			complete: function(){
				if ( self.properties.removeAfterDismiss )
				{
					self.element.remove();
				}
				else
				{
					self.element.hide();	
				}
				if ( self.body ) {
					self.body.trigger('viewDidDisappear', [self]);
				}
			}
		});
	} else {
		
		this.element.removeClass('appear');
		setTimeout( function() {
			if ( self.properties.removeAfterDismiss ) {
				self.element.remove();
			} else {
				self.element.hide();	
			}
		},300);
		if ( this.body ) {
			setTimeout(function(){
				self.body.trigger('viewDidDisappear', [self]);
			},0);
		}
	}
	$.js.popup.hide();
	var idx = JPDialog.stack.indexOf(this);
	JPDialog.stack.splice(idx,1);
	$.js.dialog = JPDialog.stack.peek();
}


JPDialog.prototype.sendMessage = function(cmd) 
{
	var args = Array.prototype.slice.call(arguments, 1);
	if ( this.messageCallback[cmd] ) {
		this.messageCallback[cmd].apply( this, args );
	} else {
		if ( !this._msgCbReady ) {
			this._msgCbReady = [];
		}
		this._msgCbReady.push( { command: cmd, args: args }); 
	}
}
