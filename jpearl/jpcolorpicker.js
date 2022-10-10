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

function JPColorPicker(element,props)
{
	JPView.call(this, element, $.extend({
		size: 200,
		alpha: 255
	}, props));
	this.element.addClass('colorpicker input');
	if ( this.element.children().length == 0 )
	{
		$('<div/>').addClass('alphaPanel').appendTo(this.element);
		var hsvPanel = $('<div/>').addClass('hsvPanel').appendTo(this.element);	
		$('<div/>').addClass('gradient').appendTo(hsvPanel);
		$('<div/>').addClass('huePanel').appendTo(this.element);
	}
	var h = this.properties.size;
	var w = h + 30;
	this.element.height(h).width(w);
	this.children.hsvPanel = this.element.find('.hsvPanel').height(h).width(h);
	this.children.hsvPanel.find('img').width(h);
	this.children.huePanel = this.element.find('.huePanel').height(h);
	this.children.alphaPanel = this.element.find('.alphaPanel');
	this.children.hsvIndicator = $('<div/>').addClass('hsv indicator')
									.appendTo(this.children.hsvPanel);
	this.children.hueIndicator = $('<div/>').addClass('hue indicator')
									.appendTo(this.children.huePanel);
	this.children.alphaTrack  = $('<div/>').addClass('alpha track').width(h)
									.appendTo(this.children.alphaPanel);	
	this.children.alphaIndicator = $('<div/>').addClass('alpha indicator')
									.appendTo(this.children.alphaPanel);
	this.children.alphaValue  = $('<div/>').addClass('alpha value')
									.appendTo(this.children.alphaPanel);

	if ( this.properties.rgbColor )
	{
		this.rgb( this.properties.rgbColor, false);	
	}
	else if ( this.properties.hsvColor )
	{
		this._hsv = this.properties.hsvColor;
		this.hsv( this._hsv.h, this._hsv.s, this._hsv.v, false);
	}
	else
	{
		this._hsv = { h : 0, s: 50, v: 50 };
		this.hsv( this._hsv.h, this._hsv.s, this._hsv.v, false);
	}
	this.registerEvents();
}

JPColorPicker.prototype = new JPView();
$.plugin( JPColorPicker );


JPColorPicker.prototype.registerEvents = function()
{
	var self = this;
	$('.gradient', this.children.hsvPanel).mouseclick( function(e){
		e.stopPropagation();
		var h = self._hsv.h;
		var s = e.offsetX/$(this).width() * 100;
		var v = 100 - (e.offsetY/$(this).height() * 100);
		self._gradientChange = false;
		self.hsv(h,s,v);
		self.element.trigger('valueChange', [ self.value(), self._rgb, self._hsv ] );
		return false;
	}).mousemove(function(e){
		e.stopPropagation();
		self._gradientChange = true;
		var h = self._hsv.h;
		var s = e.offsetX/$(this).width() * 100;
		var v = 100 - (e.offsetY/$(this).height() * 100);
		if ( e.which == 1 )
		{
			self.hsv(h,s,v,false);
			self.element.trigger('valueChange', [ self.value(), self._rgb, self._hsv ] );
			return false;
		}
		else
		{
			var rgb = JPColorPicker.HSVToRGB(h,s,v);
			self.element.trigger('colorpicker.move', [  
				{ x: e.offsetX, y: e.offsetY },
				rgb,
				{ h: h, s: s, v: v }
			]);
		}
		return false;
	}).mouseup(function(e){
		self._gradientChange = false;
	});
	this.children.huePanel.mouseclick( function(e){
		if ( !$(e.target).hasClass('huePanel') ) return;
		e.stopPropagation();
		var h = e.offsetY / $(this).height()  * 360;
		self.hsv( h, self._hsv.s, self._hsv.v);
		self.element.trigger('valueChange', [ self.value(), self._rgb, self._hsv, self.properties.alpha ] );
		return false;
	}).mousemove(function(e){
		if ( !$(e.target).hasClass('huePanel') ) return;
		if ( e.which == 1 && !self._gradientChange )
		{
			var h = e.offsetY / $(this).height()  * 360;
			self.hsv( h, self._hsv.s, self._hsv.v);
			self.element.trigger('valueChange', [ self.value(), self._rgb, self._hsv, self.properties.alpha ] );
			return;
		}
	});
	
	this.children.alphaPanel.mouseclick(function(e){
		if ( !$(e.target).hasClass('track') ) return;
		e.stopPropagation();
		self.properties.alpha = Math.min( 255, e.offsetX /  self.children.alphaTrack.width() * 255);
		self.setAlphaTrackColor();
		self.element.trigger('valueChange', [ self.value(), self._rgb, self._hsv, self.properties.alpha ] );
	})
}

/*
  h : 0 ~ 360
  s : 0 ~ 100
  v : 0 ~ 100
*/
JPColorPicker.HSVToRGB = function(h,s,v)
{
	var r,g,b,i,f,p,q,t;
	h /= 360;
	s /= 100;
	v /= 100;
	i = Math.floor( h * 6 );
	f = h * 6 - i;
	p = v * (1-s);
	q = v * (1-f*s);
	t = v * (1-(1-f)*s);
	switch( i%6 )
	{
		case 0:
			r = v; g = t; b = p;
			break;
		case 1:
			r = q; g = v; b = p;
			break;
		case 2:
			r = p; g = v; b = t;
			break;
		case 3:
			r = p; g = q; b = v;
			break;
		case 4:
			r = t; g = p; b = v;
			break;
		case 5:
			r = v; g = p; b = q;
			break;
	}
	return {r: Math.round(r*255), g: Math.round(g*255), b: Math.round(b*255)};
}

/*
   r,g,b : 0 ~ 255
*/
JPColorPicker.RGBToHSV = function(r,g,b)
{
	var min, max, delta;
	var h,s,v;
	r /= 255;
	g /= 255;
	b /= 255;
	min = Math.min(r,g,b);
	max = Math.max(r,g,b);
	v = max;
	delta = max - min;
	if ( max != 0 )
	{
		s = delta / max;
	}
	else
	{
		s = 0;
		h = -1;
	}
	if ( r == max )
	{
		h = g == b ? 0 : (( g - b )/delta);
	}
	else if ( g == max )
	{
		h = 2 + ( b - r )/delta;
	}
	else 
	{
		h = 4 + ( r - g )/delta;
	}
	h *= 60;
	if ( h < 0 )
	{
		h += 360;
	}
	return {h:h, s:s * 100, v:v * 100};
}

JPColorPicker.prototype.hsv = function(h,s,v, animated)
{
	if ( arguments.length )
	{
		var bColor = (100-v)/100 * 255;
		bColor = bColor > 70 ? 255 : bColor;
		this.children.hsvIndicator.css({
			borderColor: 'rgb(%d,%d,%d)'.sprintf(bColor,bColor,bColor) 
		});
		var r = this.children.hsvIndicator.width() / 2;
		var css = {
			left: s/100 * this.children.hsvPanel.width() - r,
			top: this.children.hsvPanel.height() - v/100 * this.children.hsvPanel.height() - r
		};
		this.children.hsvIndicator.stop();
		this.children.hueIndicator.stop();
		if ( animated === undefined && this.properties.animated )
		{
			this.children.hsvIndicator.animate( css, {
				duration: 100
			});
		}
		else
		{
			this.children.hsvIndicator.css(css);
		}
		css = {
			 top: this.children.huePanel.height() * h/360
		};
		if ( animated == undefined && this.properties.animated )
		{
			this.children.hueIndicator.animate( css, {
				duration: 100
			});
		}
		else
		{
			this.children.hueIndicator.css(css);
		}
		this._hsv = { h: h, s: s, v: v };
		this._rgb = JPColorPicker.HSVToRGB(h,s,v);
		var hue = JPColorPicker.HSVToRGB(h, 100, 100);
		if ( animated == undefined && this.properties.animated )
		{
			this.children.hsvPanel.stop().colorAnimate( hue.r << 16 | hue.g << 8 | hue.b );
		}
		else
		{
			this.children.hsvPanel.css({
				backgroundColor: 'rgb(%d,%d,%d)'.sprintf( hue.r, hue.g, hue.b )
			});
		}
		this.setAlphaTrackColor();
		return;
	}
	return this._hsv;
}

JPColorPicker.prototype.rgb = function(r,g,b,animated)
{
	if ( arguments.length )
	{
		if ( arguments.length < 3 )
		{
			animated = g;
			if ( typeof r == 'number' )
			{
				var c = r;
				r = (c >> 16) & 0x0FF;
				g = (c >> 8) & 0x0FF;
				b = c & 0x0FF;
			}
			else
			{
				g = r.g;
				b = r.b;
				r = r.r;
			}
		}
		var hsv = JPColorPicker.RGBToHSV(r,g,b);
		this.hsv( hsv.h, hsv.s, hsv.v, animated);
		this._rgb = { r: r, g: g, b: b };
		this.setAlphaTrackColor();
		return;
	}
	return this._rgb;
}

JPColorPicker.prototype.value = function(v)
{
	if ( arguments.length > 0 )
	{
		if ( v === undefined || v === null || v === false ) {
			v = { r: 0, g:0, b: 0, a: this.properties.alpha };
		}
		var r, g, b;
		if ( typeof v == 'string' )
		{
			var sIdx = 0;
			if ( v[0] == '#' ) 
			{
				sIdx = 1;
			} 
			else if ( v[0] == '0' && v[1] == 'x' )
			{
				sIdx = 2;
			}
			r = parseInt( v.substr(sIdx,2), 16);
			g = parseInt( v.substr(sIdx+2,2), 16);
			b = parseInt( v.substr(sIdx+4,2), 16);
			if ( v.length > sIdx + 6) {
				this.properties.alpha = parseInt( v.substr(sIdx+6,2), 16);
			}
		}
		else
		{
			r = v.r; g = v.g; b = v.b;
			if ( v.a !== undefined ) {
				this.properties.alpha;
			}
		}
		this.rgb(r,g,b,false);
		return;
	}
	return "#%02X%02X%02X%02X".sprintf( this._rgb.r, this._rgb.g, this._rgb.b, this.properties.alpha);
}

JPColorPicker.prototype.setAlphaTrackColor = function()
{
	this.children.alphaTrack.css({
		backgroundColor: this.value()
	}).css({
		alpha: this.properties.alpha / 255
	});
	var bgColor;
	if ( this._rgb.r < 128 && this._rgb.g < 128 && this._rgb.b < 128 && this.properties.alpha > 128 ) {
		bgColor = 'white';
	} else {
		bgColor = 'black';
	}
	this.children.alphaIndicator.css({
		left: this.children.alphaTrack.width() / 255 * this.properties.alpha,
		backgroundColor: bgColor
	})
	this.children.alphaValue.text( "%3.2f".sprintf(this.properties.alpha / 255) );
}

JPColorPicker.prototype.clear = function()
{
	this.properties.alpha = 255;
	this.rgb(0,0,0,false);	
}

JPColorPicker.prototype.validate = function()
{
	return true;
}
