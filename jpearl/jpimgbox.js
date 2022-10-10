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

function JPImagebox(element,props)
{
	if ( arguments.length == 0 ) return;
	var self = this;
	
	JPInput.call( this, element, $.extend(true,{
		required: false,
		input : $.consts.input,
		noimage: $.consts.noimage,
		deleteButton: false,
		clippable: false,
		converter: undefined, 	/* when the input value is not a http url, it need to convert the value into http url one  */
		showButtons: undefined
	},props));
	this.element.addClass('imagebox');
	this.children.image = $('<img/>').appendTo(this.element);
	if ( this.properties.clippable ) {
		this.children.clipContainer = $('<div/>').addClass('clip container').appendTo(this.element);
		this.children.clipRectangle = $('<div/>').addClass('rectangle').appendTo(this.children.clipContainer);
		this.children.clipRectangle.drag = new JPDrag(this.children.clipRectangle);
		this.children.clipRectangle.bind('dragDone', function(e, ptr, startDelta, position, delta) {
			var pos = $(this).position();
			pos.width = $(this).width();
			pos.height = $(this).height();
			pos.x = Math.min( self.children.clipContainer.width() - pos.width,  Math.max( 0, pos.left));
			pos.y = Math.min( self.children.clipContainer.height() - pos.height, Math.max(0, pos.top ));
			if ( pos.x != pos.left || pos.y != pos.top ) {
				$(this).stop().animate({
					left: pos.x,
					top: pos.y
				})
			}
			pos.x = parseInt(pos.x / self._scale);
			pos.y = parseInt(pos.y / self._scale);
			pos.width = parseInt(pos.width / self._scale);
			pos.height = parseInt(pos.height / self._scale);
			self.element.trigger('clipChange', pos);
		});
	}
	if ( this.properties.width ) {
		this.children.image.width(this.properties.width);	
	}
	if ( this.properties.height ) {
		this.children.image.height(this.properties.height);	
	}
	
	if ( this.properties.input ) {
		this.element.mouseclick(function(e){
			e.stopPropagation();
			if ( !self.properties.editingClipPosition ) {
				if ( $(e.target).get(0).nodeName != 'INPUT' ) {
					$(self.properties.input).data('target', self);
					$(self.properties.input).trigger('click');
				}
			}
			return false;
		});
		
		$(this.properties.input).change(function(e){
			var target = $(this).data('target');
			if ( target == self ) {
				var file = e.target.files[0];
				self.value( file );
				self.element.trigger('valueChange', [ file ] );	
			}
		});
	}
	
	
	new JPDrop(this.element,{
		extensions: $.consts.extensions.images ||  ["jpg", "png", "jpeg"],
		postprocess: 'image',
		target: this.children.image
	});
	
	this.element.bind('dropDone', function(e,file){
		self.value(file);
		self.element.trigger('valueChange', [ file ] );	
	});
	
	var self = this;
	this.children.image.bind('error', function(e) {
		self.element.removeClass('hasImage');
		delete self.properties.value;
        $(this).attr('src', self.properties.noimage);
	});
	
	this.children.image.bind('load', function(e) {
		self._naturalSize = [e.target.naturalWidth, e.target.naturalHeight];
		if ( e.target.naturalWidth < self.element.width() ) {
			self.children.image.css({
				width: e.target.naturalWidth,
				height: e.target.naturalHeight
			});
		} else {
			var w = self.element.width();
			var h = self.element.height();
			if ( w > h ) {
				var w1 = h / e.target.naturalHeight * e.target.naturalWidth;
				if ( w1 < w ) {
					w = w1;
				} else {
					h =  w1/e.target.naturalWidth * e.target.naturalHeight;
				}
			} else {
				var h1 = w/e.target.naturalWidth * e.target.naturalHeight;
				if ( h1 < h ) {
					h = h1;
				} else {
					w = h / e.target.naturalHeight * e.target.naturalWidth;
				}
			}
			self._scale = w / self._naturalSize[0];
			self.children.image.css({
				width: w,
				height: h
			});
			if ( self.properties.clippable ) {
				self.children.clipContainer.css({
					width: w,
					height: h
				});
			}
		}
	});
	 
	if( this.properties.deleteButton ) {
		this.children.buttonDelete = $('<img/>',{src:this.properties.deleteButton}).addClass('button clear').appendTo(this.element);
		this.children.buttonDelete.click(function(e){
			e.stopPropagation();
			self.clear();
			delete self.properties.value;
			self.element.trigger('valueChange', undefined );
			return false;
		});
	}
	
	if ( this.properties.showButtons ) {
		this.setButtons(this.properties.showButtons);
	}
	
	this.clear();
}


JPImagebox.prototype = new JPInput();

$.plugin( JPImagebox );

JPImagebox.prototype.destroy = function()
{
	if( this.children.clipRectangle ) {
		this.children.clipRectangle.drag.destroy();
	}
	JPView.prototype.destroy.call(this);
}

JPImagebox.prototype.setButtons = function(buttons)
{
	var self = this;
	this.element.unbind('click');
	$('.floating', this.element).remove();
	this.children.buutonContainer = $('<div/>').addClass('floating').appendTo(this.element);
	var container = this.children.buutonContainer; 
	buttons.forEach(function(props){
		$('<div/>').JPButton({ normalTitle: props.title })
				.mouseclick(function(e){
					e.stopPropagation();
					if ( props.click ) {
						props.click();
					} else {
						self.openFileDialog();
					}
					return false;
				}).appendTo(container);
	});
	this.element.hover(function(){
		if ( !self.properties.editingClipPosition ) {
			self.showButtons();
		}
	}, function(){
		self.hideButtons();
	});
	this.hideButtons();
}

JPImagebox.prototype.hideClip = function()
{
	this.children.clipContainer.hide();
}

JPImagebox.prototype.showClip = function()
{
	this.children.clipContainer.show();
}

JPImagebox.prototype.editClipPosition = function(value)
{
	this.properties.editingClipPosition = value;
	this.children.clipRectangle.drag.enabled(value);
	this.hideButtons();
}

JPImagebox.prototype.clipPosition = function(pos)
{
	if( arguments.length ) {
		this._clipPosition = pos;
		this.children.clipRectangle.css({
			left: pos.x * this._scale,
			top: pos.y * this._scale,
			width: pos.width * this._scale,
			height: pos.height * this._scale
		});
		return this;
	}
	return this._clipPosition;
}

JPImagebox.prototype.hideButtons = function()
{
	this.children.buutonContainer.hide();
}

JPImagebox.prototype.showButtons = function()
{
	this.children.buutonContainer.show();
}

JPImagebox.prototype.clear = function()
{
	var self = this;
	this.children.image.attr('src', self.properties.noimage);
	this.element.removeClass('hasImage');
}

JPImagebox.prototype.validate = function() {
	return true;
}

JPImagebox.prototype.value = function(v)
{
	if ( arguments.length ) {
		this.children.image.width(0).height(0);
		if ( !v ) {
			this.children.image.attr('src', this.properties.noimage );
		}
		else if ( typeof v == 'string' ) {
			this.children.image.attr('src', this.properties.converter ? this.properties.converter(v) : v);
		} else if ( v instanceof File ) {
			this.children.image.attr('src', URL.createObjectURL(v));
		}	
		this.properties.value = v;
		if ( v ) {
			this.element.addClass('hasImage');
		} else {
			this.element.removeClass('hasImage');
		}
		return;
	}
	return this.properties.value;
}

JPImagebox.prototype.openFileDialog = function() {
	$(this.properties.input).data('target', this);
	$(this.properties.input).trigger('click');
}
