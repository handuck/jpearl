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

function JPPagecontrolView(element, properties)
{
	if ( arguments.length == 0 ) return;
    JPView.call(this, element, $.extend({
		style: 'number',
		numPagesInControl: 10,
		selectedPage: 0,
		totalPages: 0 
	},properties) );
	this.element.addClass('pagectrl');
	if ( this.properties.totalPages )
	{
		this.selectedPage(0,false,true);	
	}
}

JPPagecontrolView.prototype = new JPView();
$.plugin(JPPagecontrolView);

JPPagecontrolView.style = {
	'Number': 'number',
	'Dot': 'dot'
}

Object.freeze( JPPagecontrolView.style );

JPPagecontrolView.prototype.setPageInfo = function(totalPages, numPagesInControl )
{
	numPagesInControl = numPagesInControl || this.properties.numPagesInControl;
	if ( totalPages <= 1 )
	{
		$(this.element).hide();		
		return;
	}
	$(this.element).show();		
	if ( this.properties.totalPages != totalPages )
	{
		this.element.empty();
		this.children.body = null;
		this.properties.totalPages = totalPages;
		this.properties.numPagesInControl = numPagesInControl;
		this.selectedPage(this.properties.selectedPage,false,true);	
	}
}

JPPagecontrolView.prototype.selectedPage = function(value,fire,forcefully)
{
	if ( arguments.length )
	{
		value = parseInt(value);
		if ( forcefully || !fire || this.properties.selectedPage != value ) 
		{
			this.properties.selectedPage = value;
			switch( this.properties.style )
			{
				case 'number':
					this.properties.startPage = value - value % this.properties.numPagesInControl;	
					this.drawNumberPages();	
					break;
				case 'dot':
					this.drawDotPages();	
					break;
			}
			if ( fire )
			{
				this.element.trigger('valueChanged',
						[this.properties.selectedPage]);
			}
		}
	}
	return this.properties.selectedPage;
}

JPPagecontrolView.prototype.drawNumberPages = function()
{
	var self = this;
	this.element.empty();
	this.children.body = null;
	var table = $('<table/>',{
			}).appendTo(this.element);
	var tr = $('<tr/>').appendTo(table);
	var page = this.properties.selectedPage;
	page = Math.max(0, page - page % this.properties.numPagesInControl );
	var td;

	td = $('<td/>').addClass('page image previousGroup').appendTo(tr);
	if ( page >= this.properties.numPagesInControl )
	{
		td.removeClass('disabled');
		td.click(page-this.properties.numPagesInControl,function(e){
			self.selectedPage(e.data, true);
			return false;
		});
	}
	else
	{
		td.addClass('disabled');		
	}
	
	td = $('<td/>').addClass('page image previous').appendTo(tr);
	if ( this.properties.selectedPage > 0 )
	{
		td.removeClass('disabled');
		td.click(this.properties.selectedPage-1,function(e){
			self.selectedPage(e.data, true);
			return false;
		});
 	}	
	else
	{
		td.addClass('disabled');
	}
	for( var i = 0 ; i < this.properties.numPagesInControl ; i++)
	{
		page = i + this.properties.startPage;
		td = $('<td/>').addClass('page').appendTo(tr);
		if ( i == 0 ) {
			td.addClass('first');
		} else if ( i == this.properties.numPagesInControl - 1 ) {
			td.addClass('last');
		}
		if ( page < this.properties.totalPages )
		{
			td.addClass('number').text(page+1).click(page,function(e){
				self.selectedPage(e.data, true);
				return false;
			});
		}
		if ( page == this.properties.selectedPage )
		{
			td.addClass('selected');
		}
	}
	td = $('<td/>').addClass('page image next').appendTo(tr);
	if ( this.properties.selectedPage + 1 < this.properties.totalPages )
	{	
		td.removeClass('disabled');
		td.click(this.properties.selectedPage+1, function(e){
			self.selectedPage(e.data, true);
			return false;
		});
	}
	else
	{
		td.addClass('disabled');
	}
	td = $('<td/>').addClass('page image nextGroup').appendTo(tr);
	var p = this.properties.startPage+this.properties.numPagesInControl;
	if ( p < this.properties.totalPages )
	{
		td.removeClass('disabled');
		td.click(p,function(e){
			self.selectedPage(e.data, true);
			return false;
		});
	}
	else
	{
		td.addClass('disabled');
	}
}

JPPagecontrolView.prototype.drawDotPages = function()
{
	if ( !this.children.body )
	{
		var self = this;
		this.children.body = $('<table/>',{
				}).appendTo(this.element);
		var tr = $('<tr/>').appendTo(this.children.body);
		for( var i = 0 ; i < this.properties.totalPages ; i++)
		{
			var dot = $('<div/>').addClass('page dot');
			var td = $('<td/>').append(dot).appendTo(tr).click( i, function(e){
				if ( self.properties.enabled ) 
				{
					self.selectedPage(e.data, true);
					return false;
				}
			});
		}
	}
	this.children.body.find('.page.dot').removeClass('selected');
	var dot = this.children.body.find('.page.dot').eq(this.properties.selectedPage);
	dot.addClass('selected');
}

