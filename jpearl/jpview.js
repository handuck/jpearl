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

function JPView(element,props)
{
	if ( arguments.length == 0 ) return;
	this.properties = $.extend( true, { notdetach: false, enabled: true, animated: true }, props );
	this.element = $(element);
	this.element.addClass('jpview');
	this.children = {};
	var self = this;

	var data = this.element.data();

	for( var k in data )
	{
		if ( k.indexOf('attr') == 0 )
		{
			var name = k[4].toLowerCase() + k.substr(5);
			this.properties[name] = data[k];
		}
	}

	this.element.find('[data-name]').each(function(){
		var name = $(this).data('name');
		if ( name && name.length > 0 ) {
			self.children[name] = $(this);
		}
	});

	this._initTemplate();
	this.element.click(function(e)
	{
		if ( !self.properties.enabled )
		{
			e.stopPropagation();
			e.stopImmediatePropagation();
			return false;
		}
	});

	if ( this.properties.tooltip )
	{
		this.element.bind('mouseenter', function(e){
			self._tooltipTimer = setTimeout( function(){
				self.showTooltip(e);	
				self._tooltipTimer = null;
			}, 500 );
		}).bind('mouseleave', function(e){
			if ( self._tooltipTimer )
			{
				clearTimeout( self._tooltipTimer );
			}
			self.hideTooltip();	
		});
	}
	if ( !this.properties.enabled )
	{
		this.enabled(false);
	}

}

$.plugin( JPView );

JPView.prototype.destroy = function()
{
	this.element.find('.jpview').each(function(){
		var data = $(this).data();
		for( var k in data ) {
			if ( k.substr(0,5) == 'event' ) {
				var name = k.substr(5);
				var name = name[0].toLowerCase() + name.substr(1);
				$(this).unbind(name);
				var inst = $(this).instance();
				if ( inst ) {
					inst.destroy();
				}
			}
		}
	});
}

JPView.prototype._initTemplate = function()
{
	var self = this;
	if ( this.properties.template  && this.properties.template.length > 1  )
	{
		var templates;
		if ( this.properties.template )
		{
			if ( typeof this.properties.template == 'string' ) {
				templates = $(this.properties.template);
			} else {
				templates = this.properties.template;
			}
		}
		else
		{
			templates = this.element.children('template, script[type="text/dataTemplate"],script[type="text/itemTemplate"]');
		}
		if ( templates.length > 1 )
		{
			this.properties.template = {};
			templates.each( function(idx, obj) {
				var s = $(obj)
				var key = s.data('key')
				self.properties.template[key] = new JPTemplate(s);
			});
		} else if ( templates.length == 1) {
			this.properties.template = new JPTemplate(templates.eq(0));
		}
	}
	else if ( this.properties.template )
	{
		if ( $.isPlainObject(this.properties.template) )
		{
			for( var key in this.properties.template )
			{
				this.properties.template[key] = new JPTemplate( this.properties.template[key] );
			}
		}
		else if ( !(this.properties.template instanceof JPTemplate) )
		{
			this.properties.template = new JPTemplate(this.properties.template);
		}
	}
	else
	{
		var templates = this.element.children('template, script[type="text/dataTemplate"]')
		if ( templates.length == 1 )
		{
			this.properties.template = new JPTemplate(templates.eq(0));
		}
	}
}

JPView.prototype.enabled = function(value)
{
    if ( arguments.length > 0 ) {
        this.properties.enabled = value ? true : false;
        if ( value )
        {
            this.element.removeClass('disabled');
        }
        else
        {
            this.element.addClass('disabled');
        }
    }
    return this.properties.enabled;
}

JPView.prototype.property = function(key)
{
	if ( arguments.length == 2 )
	{
		this.properties[key] = arguments[1];
		if ( key.indexOf('template') == 0 ) {
			this._initTemplate();
		}
		return this;
	} else if ( $.isPlainObject(key) ) {
		$.extend( true, this.properties, key );
		return this;
	}
	return this.properties[key] || null;
}

JPView.prototype._getEventPosition = function(e)
{
	var loc = this.element.offset();
	if ( e.type == 'click' || e.type.indexOf('mouse') === 0 || e.type == 'contextmenu' )
	{
		return [e.pageX - loc.left, e.pageY - loc.top];
	}
	else
	{
		return [e.originalEvent.changedTouches[0].pageX - loc.left,
			e.originalEvent.changedTouches[0].pageY - loc.top ];
	}
}

JPView.prototype.appear = function(animated)
{
	if ( !this.properties.notdetach || !this.element.parent() )
	{
		$('body').append(this.element);
	}
	this.element.show();	
}

JPView.prototype.dismiss = function(animated)
{
	if ( this.properties.notdetach )
	{
		this.element.hide();
	}
	else
	{
		this.element.detach();
	}
	this.element.trigger('dismiss');
}

JPView.prototype.drawTemplate = function(item)
{
	var obj;
	var args = Array.prototype.slice.call( arguments, 0);
	if ( this.properties.template )
	{
		var tmpl;
		if ( this.properties.templateSelector )
		{
			tmpl = this.properties.template[this.properties.templateSelector(item)];
		}
		else
		{
			tmpl = this.properties.template;
		}
		obj = tmpl.apply( item, this.properties.converter );
	}
	else
	{
		var v = this.properties.converter ? this.properties.converter.apply(this, args) : item.toString();
		obj = $('<div/>').html(v);
	}
	if ( this.properties.initTemplate )
	{
		args.unshift(obj); 
		// obj, item, ... 
		this.properties.initTemplate.apply(this, args);
	}
	return obj;
}

JPView.prototype.frame = function(value)
{
	if ( arguments.length )
	{
		var css;
		if ( arguments[0] instanceof Rectangle 
			|| arguments[0] instanceof Point 
			|| arguments[0] instanceof Size )
		{
			css = value.css();
		}
		else 
		{
			css = {};
			var keys = [ 'left', 'top', 'width', 'height' ];
			for( var i = 0 ; i < arguments.length; i++ )
			{
				css[ keys[i] ] = arguments[i];
			}
		}
		this.element.css(css);
		this._layoutSubviews(true);
		this._draw();
		return;
	}
	var off = this.element.position();
	return new Rectangle( off.left, off.top, this.element.width(), this.element.height() );
}

JPView.prototype._layoutSubviews = function()
{

}

JPView.prototype._draw = function()
{

}

JPView.prototype.transform = function(opts,aniOpts)
{
	var cssGen = function( key, v){
		var unit = '';
		switch( key )
		{
			case 'rotate':
			case 'rotateX':
			case 'rotateY':
			case 'rotateZ':
			case 'skewX':
			case 'skewY':
			case 'skew':
				unit = 'deg';
				break;
			case 'translateX':
			case 'translateY':
				unit = 'px';
				break;
		}			
		return key + '(' + v + unit + ')';
	}

	if ( opts.origin )
	{
		this.element.css({
			'-ms-transform-origin': opts.origin,
			'-webkit-transform-origin': opts.origin,
			'-moz-transform-origin': opts.origin,
			'transform-origin': opts.origin
		});	
		delete opts.origin;
	}
	var count = 0;
	for( var key in opts )
	{
		var node = this.element.get(0);
		if ( node[key] === undefined )
		{
			if ( key.indexOf('scale') >= 0 )
			{
				node[key] = 1;
			}
			else
			{
				node[key] = 0;
			}
		}
		count++;
	}
	if ( aniOpts )
	{
		var self = this;
		var idx = 0;
		var css = [];
		this.element.animate(opts, $.extend( aniOpts,{
			step: function( n, fx)
			{
				css.push( cssGen( fx.prop, n ) );
				if ( idx != 0 && idx % count == 0 )
				{
					var v = css.join(' ');
					self.element.css({
						'-ms-transform': v,
						'-webkit-transform': v,
						'-moz-transform': v,
						'transform': v
					});
					css = [];
				}
				idx++;
			}
		}));
	}
	else
	{
		var css = [];
		for( var key in opts )
		{
			css.push( cssGen( key, opts[key] ) );
		}
		var v = css.join(' ');		
		this.element.css({
			'-ms-transform': v,
			'-webkit-transform': v,
			'-moz-transform': v,
			'transform': v
		});
	}	
}

JPView.prototype.showTooltip = function(e)
{
	$.js.tooltip.view.empty();
	switch( typeof this.properties.tooltip )
	{
		case 'string':
			$.js.tooltip.view.html( this.properties.tooltip );
			break;
		case 'function':
			$.js.tooltip.view.append( this.properties.tooltip(this) );
			break;
		default:
			$.js.tooltip.view.append( this.properties.tooltip );
			break;
	}
	$.js.tooltip.show(this.element,{
		left: e.clientX,
		top: e.clientY
	});
}

JPView.prototype.hideTooltip = function()
{
	$.js.tooltip.hide();
}

JPView.prototype.load = function(url,callback)
{
	var self = this;
	this.request({
		url: url,
		type: "GET",
		ifModified: true,
		dataType: 'html'
	},function(err,html){
		if (err) {
			callback(err,undefined);
		} 
		else {
			self.element.html(html);			
			callback(undefined,html);
		}
	});
}

JPView.prototype.request = function(params,callback)
{
	this._ajaxRequest = $.ajax(params).done(function(data){
		callback(undefined,data);			
	}).fail(function(jqXHR,textStatus,errorThrown){
		callback(jqXHR,undefined);
	}).always(function(jqXHR,textStaut){
		delete this._request;
	});
}

JPView.prototype.abort = function()
{
	if ( this._ajaxRequest ) {
		this._ajaxRequest.abort();
		delete this._ajaxRequest;
	}
}

JPView.prototype.initEvents = function(view,callbacks,args)
{
	view.find('.jpview').each(function(){
		var data = $(this).data();
		for( var k in data ) {
			if ( k.substr(0,5) == 'event' ) {
				var name = k.substr(5);
				var name = name[0].toLowerCase() + name.substr(1);
				var v = data[k];
				var cb = callbacks[v];
				if ( cb ) {
					$(this).bind(name,args,cb);
				}
			}
		}
	});
}

JPView.prototype.visible = function()
{
	return this.element.is(':visible');
}

JPView.prototype.show = function()
{
	this.element.show();
}

JPView.prototype.hide = function()
{
	this.element.hide();
}

