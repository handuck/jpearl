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

function JPResize(element,props)
{
	this.children = {
		boxes : []	
	};
	var self = this;
	self.element = $(element|| 'body');
	self.properties = $.extend({}, props);
	var dirs = [ 'topleft', 'top', 'topright', 'left', 'right', 'bottomleft', 'bottom', 'bottomright' ];
	var cursors = [ 'nwse', 'ns', 'nesw', 'ew', 'ew', 'nesw', 'ns', 'nwse' ];
	for ( var i = 0 ; i < dirs.length; i++ )
	{
		var box = $('<div/>').addClass('jpview resize').addClass(dirs[i]).data('direction',dirs[i]);
		var props = {};
		if ( dirs[i] == 'top' || dirs[i] == 'bottom' )
		{
			props.horizontalEnabled = false;
		}
		else if ( dirs[i] == 'left' || dirs[i] == 'right' )
		{
			props.verticalEnabled = false;
		}
		props.cursor = cursors[i] + '-resize';
		box.drag = new JPDrag( box,  props );
		box.attr('title', dirs[i]);
		box.bind('dragging', function(e,ptr,delta,position){
			if ( self.target ) {
				self.resize($(this),delta);				
			}
		}).bind('dragDone', function(e,ptr,startDelta,position,delta){
			if ( self.target ) {
				self.target.trigger('resized');
			}
		});
		box.bind('click', function(e){
			e.stopPropagation();
			return false;
		});
		this.children.boxes.push(box);
		self.element.append(box);
		box.hide();
	}
}

JPResize.direction = {
	topleft: 0,
	top: 1,
	topright: 2,
	left: 3,
	right: 4,
	bottomleft: 5,
	bottom: 6,
	bottomright: 7
};

Object.freeze( JPResize.direction );

JPResize.prototype.setTarget = function(target)
{
	if ( this.target != target )
	{
		this.target = target;
		this.rearrange();
	}
	else
	{
		if ( this.properties.directions ) {
			for ( var i = 0 ; i < this.children.boxes.length ; i++ ) {
				this.children.boxes[i].hide();
			}
			for ( var i = 0 ; i < this.properties.directions.length; i++ ) {
				var didx = this.properties.directions[i];
				this.children.boxes[didx].show();
			}
		} else {
			for( var i = 0 ; i < this.children.boxes.length; i++ )
			{
				this.children.boxes[i].show();
			}
		}
	}

}

JPResize.prototype.resize = function(box,delta)
{
	var dir = box.data('direction');
	var rect = this.target.position();
//	if ( this.target.parent().css('position') == 'absolute' ) {
//		var off = this.target.parent().position();
//		rect.left += off.left;
//		rect.top += off.top;
//	}
	if ( this.properties.scrollView )
	{
		rect.left += this.properties.scrollView.scrollLeft();	
		rect.top += this.properties.scrollView.scrollTop();	
	}
	rect.width = this.target.width();
	rect.height = this.target.height();
	rect.right = rect.left + rect.width;
	rect.bottom = rect.top + rect.height;
	
	if ( dir.indexOf('top') >= 0 )
	{
		rect.top += delta.y;
		rect.height -= delta.y;
	}
	else if ( dir.indexOf('bottom') >= 0 )
	{
		rect.height += delta.y;
	}
	if ( dir.indexOf('left') >= 0 )
	{
		rect.left += delta.x;
		rect.width -= delta.x;
	}
	else if ( dir.indexOf('right') >= 0 )
	{
		rect.width += delta.x;
	}
	this.target.css({
		left: rect.left,
		top: rect.top
	});
	this.target.width( rect.width ).height(rect.height);
	this.rearrange();
}

JPResize.prototype.rearrange = function()
{
	var rect = this.target.position();
//	if ( this.target.parent().css('position') == 'absolute' ) {
//		var off = this.target.parent().position();
//		rect.left += off.left;
//		rect.top += off.top;
//	}
	if ( this.properties.scrollView )
	{
		rect.left += this.properties.scrollView.scrollLeft();	
		rect.top += this.properties.scrollView.scrollTop();	
	}
	rect.width = this.target.outerWidth(true);
	rect.height = this.target.outerHeight(true);
	rect.right = rect.left + rect.width;
	rect.bottom = rect.top + rect.height;
	
	this.children.boxes[JPResize.direction.topleft].show();
	this.children.boxes[JPResize.direction.topright].show();
	this.children.boxes[JPResize.direction.bottomleft].show();
	this.children.boxes[JPResize.direction.bottomright].show();

	if ( rect.width < 50 ) {
		this.children.boxes[JPResize.direction.top].hide();
		this.children.boxes[JPResize.direction.bottom].hide();
	}
	else {
		this.children.boxes[JPResize.direction.top].show();
		this.children.boxes[JPResize.direction.bottom].show();
	}
	if ( rect.height < 50 ) {
		this.children.boxes[JPResize.direction.left].hide();
		this.children.boxes[JPResize.direction.right].hide();
	}
	else {
		this.children.boxes[JPResize.direction.left].show();
		this.children.boxes[JPResize.direction.right].show();
	}
	var boxWidth = this.children.boxes[0].outerWidth();
	var boxHeight = this.children.boxes[0].outerHeight();
	var centerX = rect.left + ( rect.width - boxWidth ) / 2;
	var centerY = rect.top + ( rect.height - boxHeight ) / 2;
	rect.left -= boxWidth/2;
	rect.top -= boxHeight/2;
	rect.right -= boxWidth/2;
	rect.bottom -= boxHeight/2;
	this.children.boxes[0].css( { left: rect.left, top: rect.top } );
	this.children.boxes[1].css( { left: centerX, top: rect.top } );
	this.children.boxes[2].css( { left: rect.right, top: rect.top } );
	this.children.boxes[3].css( { left: rect.left, top: centerY } );
	this.children.boxes[4].css( { left: rect.right, top: centerY } );
	this.children.boxes[5].css( { left: rect.left, top: rect.bottom} );
	this.children.boxes[6].css( { left: centerX, top: rect.bottom} );
	this.children.boxes[7].css( { left: rect.right, top: rect.bottom} );
	if ( this.properties.directions ) {
		for ( var i = 0 ; i < this.children.boxes.length ; i++ ) {
			this.children.boxes[i].hide();
		}
		for ( var i = 0 ; i < this.properties.directions.length; i++ ) {
			var didx = this.properties.directions[i];
			this.children.boxes[didx].show();
		}
	}
}

JPResize.prototype.hide = function()
{
	if ( this.target )
	{
		for( var i = 0 ; i < this.children.boxes.length; i++ )
		{
			this.children.boxes[i].hide();
		}
		this.target = undefined;
	}
}

JPResize.prototype.refresh = function()
{
	this.rearrange();
}
