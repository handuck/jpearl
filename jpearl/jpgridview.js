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

function JPGridview(element,props)
{
	JPView.call(this, element, $.extend({
		
	}, props));	
	this.element.addClass('gridview');
	var cells = this.element.children('[data-attr-cell]').addClass('cell');
	var seps = this.element.children('.separator');
	this.children.cells = [];
	this.properties.size = [0,0];
	this.children.separators= [];
	for ( var i = 0 ; i < cells.length; i++ )
	{
		var cell = cells.eq(i).data('attrCell');
		if ( !cell ) continue;
		var pos = cell.split(/,/);
		if ( !this.children.cells[pos[0]] )
		{
			this.children.cells[pos[0]] = [];
		}
		this.children.cells[pos[0]][pos[1]] = cells.eq(i);
		this.properties.size[0] = Math.max(this.properties.size[0],pos[0]);
		this.properties.size[1] = Math.max(this.properties.size[1],pos[1]);
	}
	this.properties.size[0] += 1;
	this.properties.size[1] += 1;

	for ( var i = 0 ; i < seps.length; i++ )
	{
		var s = seps.eq(i);
		this.children.separators.push(s);
		var locs = s.data('attrPosition').split('-').map(function(v){
			return v.split(',');		
		});
		if ( locs[0][0] == locs[1][0] ) 
		{ // vertical
			var left;
			var right;
			if ( locs[0][1] > locs[1][1] ) {
				left = locs[1];	
				right = locs[0];	
			} 
			else {
				left = locs[0];	
				right = locs[1];	
			}
			s.addClass('vertical');
			s.data('leftCell', this.children.cells[left[0]][left[0]] );
			s.data('rightCell', this.children.cells[right[0]][right[1]] );
		} 
		else 
		{ // horizontal
			var top;
			var bottom;
			if ( locs[0][1] > locs[1][1] ) {
				top = locs[1];	
				bottom = locs[0];	
			} 
			else {
				top = locs[0];	
				bottom = locs[1];	
			}
			s.addClass('horizontal');
			s.data('topCell', this.children.cells[top[0]][top[1]] );
			s.data('bottomCell', this.children.cells[bottom[0]][bottom[1]] );
		}
	}
	var self = this;
	this.arrange();
	$(window).resize(function(){
		self.arrange();
	});
}

$.plugin(JPGridview);

JPGridview.prototype = new JPView();

JPGridview.prototype.putView = function( view, x, y )
{
		
}

JPGridview.prototype.removeView = function(x,y)
{

}

JPGridview.prototype.arrange = function()
{
	var width = this.element.parent().width();
	var height = this.element.parent().height();
	this.element.width('100%').height('100%');
	for( var r = 0 ; r < this.properties.size[0] ; r++ )
	{
		var remainWidth = width;
		var cellsEqWidth = [];
		for( var c = 0 ; c < this.properties.size[1] ; c++ )
		{
			var cell = this.children.cells[r][c];
			if ( !cell ) continue;
			var w = cell.attr('width');
			var h = cell.attr('height');
			if ( w == '*' || w === undefined ) 
			{
				cellsEqWidth.push( cell );
			}
			else
			{
				if ( w.indexOf('%') > 0 ) 
				{
					remainWidth -= width * parseFloat(w.substr(0,w.length-1))/100;
				}
				else if ( w.indexOf('px') > 0 )
				{
					remainWidth -= w.substr(0,w.length-2);
				}
				cell.width(w);				
			}
		}
		if ( cellsEqWidth.length )
		{
			remainWidth /= cellsEqWidth.length;
			cellsEqWidth.forEach( function(c){
				c.width(remainWidth);	
			});
		}
	}

	for( var c = 0 ; c < this.properties.size[1] ; c++ )
	{
		var remainHeight = height;
		var cellsEqHeight = [];
		for( var r = 0 ; r < this.properties.size[0] ; r++ )
		{
			var cell = this.children.cells[r][c];
			if ( !cell ) continue;
			if ( h == '*' || w == undefined )
			{
				cellsEqHeight.push(cell);
			}
			else 
			{
				if ( h.indexOf('%') > 0 ) 
				{
					remainHeight -= height * parseFloat(h.substr(0,h.length-1))/100;
				}
				else if ( h.indexOf('px') > 0 )
				{
					remainHeight -= w.substr(0,h.length-2);
				}
				cell.height(h);
			}
		}
		if ( cellsEqHeight.length )
		{
			remainHeight /= cellsEqHeight.length;
			cellsEqHeight.forEach( function(c){
				c.height(remainHeight);	
			});
		}
	}

	for( var r = 0 ; r < this.properties.size[0] ; r++ )
	{
		var left = 0;
		for( var c = 0 ; c < this.properties.size[1] ; c++ )
		{
			var cell = this.children.cells[r][c];
			if ( !cell ) continue;
			cell.css({left: left});
			left += cell.width();	
		}
	}
	for( var c = 0 ; c < this.properties.size[1] ; c++ )
	{
		var top = 0;
		for( var r = 0 ; r < this.properties.size[0] ; r++ )
		{
			var cell = this.children.cells[r][c];
			if ( !cell ) continue;
			cell.css({top: top});
			top += cell.height();	
		}
	}

	for ( var s = 0 ; s < this.children.separators.length; s++ )
	{
		var sep = this.children.separators[s];
		if ( sep.hasClass('vertical') )
		{
			var rightCell = sep.data('rightCell');
			var leftCell = sep.data('leftCell');
			var pos = rightCell.position();
			sep.css({
				left: pos.left,
				top: pos.top,
				height: rightCell.height()
			});
			new JPDrag(sep,{
				cursor: 'ew-resize',
				horizontalEnabled: true,
				verticalEnabled: false	
			});
			var posLeft = leftCell.position().left;
			var posRight = rightCell.position().left + rightCell.outerWidth();
			sep.bind('dragging', function(e,ptr,delta,pos){
				leftCell.css({ width: pos.left - posLeft });
				rightCell.css({ left: pos.left, width: posRight - pos.left });
			}).bind('dragDone', function(e,ptr,sdelta,pos,delta){
				leftCell.css({ width: pos.left - posLeft });
				rightCell.css({ left: pos.left, width: posRight - pos.left });
			});
		}
		else
		{
			var topCell = sep.data('topCell');
			var bottomCell = sep.data('bottomCell');
			var pos = topCell.position();
			sep.css({
				left: pos.left,
				top: pos.top + topCell.height(),
				width: topCell.width()
			});
			new JPDrag(sep,{
				cursor: 'ns-resize',
				horizontalEnabled: false,
				verticalEnabled: true
			});
			var posTop = topCell.position().top;
			var posBottom = bottomCell.position().top + bottomCell.outerHeight();
			sep.bind('dragging', function(e,ptr,delta,pos){
				topCell.css({ top: 0, height: pos.top - posTop });
				bottomCell.css({ top: pos.top, height: posBottom - pos.top });
			});
		}
	}
}
