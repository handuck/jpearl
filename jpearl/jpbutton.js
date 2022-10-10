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

function JPButton(element,props)
{
	if ( arguments.length == 0 ) return;
	JPView.call(this,element,$.extend(true,{
		layout: JPButton.Layout['Icon-Title'],
		radioGroup: undefined
	}, props));

	var self = this;
	this.element.addClass('button');	
	this.element.attr('tabindex', '0');
	if ( this.properties.toggle == true )
	{
		this.element.addClass('toggle');
	}
	this.element.hover(function(){
		if ( self.properties.enabled )
		{
			self.state( self.properties.state | JPButton.State.Highlighted );
		}
	}, function() {
		self.state( self.properties.state & ~JPButton.State.Highlighted );
	});
	

	if ( !this.properties.toggle )
	{
		this.element.click(function(e){
			if ( self.properties.enabled ) {
				self.state( JPButton.State.Normal );
			}
		});
	}
	
	if ( this.properties.toggle )
	{	
		this.element.mousedown(function(e){
			if ( !self.properties.enabled ) {
				return;
			}
			if ( e.which == 1 ) {
				e.stopPropagation();
				var p = self.properties.selected == $.consts['true'] ? $.consts['false'] : $.consts['true'];
				self.selected( p, true);
				return false;
			}
		});
	}
	else if ( this.properties.radioGroup )
	{
		this.group(this.properties.radioGroup);
	}
	var icon = this.element.children('img');
	if (icon.length > 0 )
	{
		if ( icon.length == 1 )
		{
			this.children.normalIcon = icon;
		}
		else
		{
			this.children.normalIcon = this.element.find('.normal');
			this.children.highlightedIcon = this.element.find('.hightlighted').hide();
			this.children.disabledIcon = this.element.find('.disabled').hide();
			this.children.selectedIcon = this.element.find('.selected').hide();
		}
	}
	else if ( typeof this.properties.icon == 'string' )
	{
		this.children.normalIcon = $('<img/>', { src: this.properties.icon });
		this.element.append(this.children.normalIcon);
	}
	if ( this.properties.backgroundImage )
	{
		this.element.css({
			backgroundImage: "url(%s)".sprintf( this.properties.backgroundImage )
		});
	}
	var txt = this.properties.title || this.element.text().trim();
	if ( txt && txt.length > 0 )
	{
		this.properties.normalTitle = txt;
	}
	else 
	{
		var titles = this.element.children('.title');
		this.properties.normalTitle = this.properties.normalTitle 
									|| titles.find('.normal').html();
		this.properties.highlightedTitle = this.properties.highlightedTitle 
									|| titles.find('.highlighted').html();
		this.properties.disabledTitle = this.properties.disabledTitle 
									|| titles.find('.disabled').html();
		this.properties.selectedTitle = this.properties.selectedTitle 
									|| titles.find('.selected').html();
		titles.remove();
	}
	var states = ['highlighted', 'selected', 'disabled' ];
	for ( var i = 0 ; i < states.length; i++ )
	{
		var iconKey = states[i] + 'Icon';
		var titleKey = states[i] + 'Title';
		if ( this.children[iconKey] && this.children[iconKey].length == 0 )
		{
			this.children[iconKey] = null;
		}
		else if ( this.properties[iconKey] )
		{
			this.children[iconKey] = $('<img/>', { src: this.properties[iconKey] } ).appendTo(this.element).hide();
		}
		if ( this.properties[titleKey] && this.properties[titleKey].length == 0 )
		{
			delete this.properties;
		}
	}
	if ( this.children.normalIcon  && this.properties.normalTitle )
	{
		this.element.text('');
		this.children.icon = $('<div/>').addClass('icon');
		this.children.normalIcon.appendTo(this.children.icon);
		for ( var i = 0 ; i < states.length; i++ )
		{
			var iconKey = states[i] + 'Icon';
			if ( this.children[iconKey] )
			{
				this.children[iconKey].appendTo(this.children.icon);
			}
		}
		this.children.title = $('<div/>').addClass('title').text( this.properties.normalTitle );
		if ( this.properties.layout.indexOf('_') != -1 )
		{
			this.element.css.addClass('vertical');
		}
		else
		{
			this.element.css({
				'align-items' : 'center'
			}).addClass('horizontal');
			this.children.icon.css('display', 'inline-block');
			this.children.title.css('display', 'inline-block');
		}

		if ( this.properties.layout.indexOf('icon') == 0 )
		{
			this.children.icon.appendTo(this.element);				
			this.children.title.appendTo(this.element);				
		}
		else
		{
			this.children.title.appendTo(this.element);				
			this.children.icon.appendTo(this.element);				
		}
	}
	else if ( this.children.normalIcon )
	{
		this.children.icon = this.element;
	}
	else if ( this.properties.normalTitle )
	{
		this.children.title = this.element;
	}
	var state = 0;
	if ( !this.properties.enabled )
	{
		state |= JPButton.State.Disabled;
	}
	if ( this.properties.selected )
	{
		state |= JPButton.State.Selected;
	}
	this.state( state );
	this.element.keypress(function(e){
		if ( !self.properties.enabled ) {
			return;
		}
		if ( e.which == 13 ) {
			e.stopPropagation();
			self.element.trigger('click');
			return false;
		}
	});
	
	
	if ( this.properties.badge !== undefined ) {
		this.children.badge = $('<div/>').addClass('badge').appendTo(this.element);
		this.badge(this.properties.badge);
	}
}

$.plugin(JPButton);

JPButton.prototype = new JPView();

JPButton.State = {
	Normal: 0,
	Highlighted:  1,
	Selected: 2,
	Disabled: 4
}

JPButton.Layout = {
	'Icon-Title': 'icon-title',
	'Title-Icon': 'title-icon',
	'Icon_Title': 'icon_title',
	'Title_Icon': 'title_icon'
}

Object.freeze( JPButton.State );
Object.freeze( JPButton.Layout );

JPButton.prototype.badge = function(v)
{
	if ( !v || v == 0 ) {
		this.children.badge.hide();
	} else {
		this.children.badge.show().text(v);
	}
}

JPButton.prototype.group = function(v)
{
	if ( arguments.length )
	{
		var self = this;
		this.properties.radioGroup = v;
		if ( typeof v == 'string' )
		{
			if ( this.properties.radioGroup[0] == '@' )
			{
				switch( this.properties.radioGroup )
				{
					case '@siblings':
						this.properties.radioGroup = this.element.siblings();
						break;
				}
			}
			else
			{
				this.properties.radioGroup = $(this.properties.radioGroup);
			}
		}
		this.element.unbind('click').click( function(e) {
			e.stopPropagation();
			if ( !self.properties.enabled ) {
				return false;
			}
			if ( self.properties.state & JPButton.State.Selected )
			{
				return false;	
			}	
			self.selected($.consts['true'],false);
			if ( self.element.hasClass('input') ) {
				self.element.trigger('valueChange', [ self.element.data('value') ]);
			}
			return false;
		});
		return;
	}
	return 	this.properties.radioGroup;
}

JPButton.prototype.value = function(v)
{
	if ( this.properties.radioGroup )
	{
		if ( arguments.length > 0 )
		{
			this.selected( this.element.data('value') == v ? $.consts['true'] : $.consts['false'] );
			return;
		}
		var obj = this.properties.radioGroup.filter( function(){
			return $(this).hasClass('selected');
		});
		return obj.data('value');
	}
	return undefined;
}

JPButton.prototype.state = function(value)
{
	if ( arguments.length )
	{
		this.properties.state = value;
		var icon = this.children.normalIcon;
		var title = this.properties.normalTitle;
		// Selected
		if ( value & JPButton.State.Selected )
		{
			this.element.addClass('selected');
			icon = this.children.selectedIcon;
			title = this.properties.selectedTitle || title;
		}
		else
		{
			this.element.removeClass('selected');
		}
		// Highlighted
		if ( value & JPButton.State.Highlighted )
		{
			this.element.addClass('hover');	
			icon = this.children.highlightedIcon;
			title = this.properties.highlightedTitle || title;
		}
		else
		{
			this.element.removeClass('hover');
		}
		// Disabled
		if ( value & JPButton.State.Disabled )
		{
			this.element.addClass('disabled');
			icon = this.children.disabledIcon;
			title = this.properties.disabledTitle || title;
		}
		else
		{
			this.element.removeClass('disabled');
		}
		if ( this.children.icon && icon && this.children.icon != icon )
		{
			var imgs = this.children.icon.children();
			imgs.hide();
			icon.show();
		}
		if ( this.children.title && this.properties.title != title )
		{
			this.properties.title = title;	
			this.children.title.html( title );
		}
	}
	return this.properties.state;
}

JPButton.prototype.enabled = function(value)
{
	if ( arguments.length )
	{
		this.properties.enabled = value;		
		if ( value )
		{
			this.state( this.properties.state & ~JPButton.State.Disabled );
		}
		else
		{
			this.state( this.properties.state | JPButton.State.Disabled );
		}
		return;
	}
	return this.properties.enabled;
}

JPButton.prototype.toggle = function(trigger)
{
	this.selected( !this.properties.selected, trigger );
}

JPButton.prototype.selected = function(value,trigger)
{
	if ( arguments.length )
	{
		if ( $.consts['true'] == value && this.properties.radioGroup ) {
			this.properties.radioGroup.each( function(idx,obj){
				$(obj).instance().selected( $.consts['false'] );	
			});
		}
		this.properties.selected = value;
		if ( value == $.consts['true'] )
		{
			this.state( this.properties.state | JPButton.State.Selected );
		}		
		else
		{
			this.state( this.properties.state & ~JPButton.State.Selected );
		}
		if ( trigger )
		{
			this.element.trigger('valueChange', [ value ] );
		}
		return;
	}
	return this.properties.selected;
}

JPButton.prototype.title = function()
{
	if (arguments.length)
	{
		if ( arguments.length == 1 )
		{
			this.properties.normalTitle = arguments[0];
		}
		else if ( arguments.length == 2 )
		{
			this.properties[ arguments[1] + 'Title'] = arguments[0];
		}
		this.children.title.html( arguments[0] );
		return;		
	}
	return this.properties.normalTitle;
}

JPButton.prototype.validate = function(e)
{
	return true;
}
