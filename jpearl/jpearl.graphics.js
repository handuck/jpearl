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

function Point(x,y)
{
	if ( arguments.length == 1 )
	{
		this.x = arguments[0].x;
		this.y = arguments[0].y;
	}
	else
	{
		this.x = x;
		this.y = y;	
	}
}

Point.fromAbsRadian = function(r,theta)
{
	return new Point( r * Math.cos(theta), r * Math.sin(theta) );	
}

Object.defineProperties( Point.prototype, {
	absolute: {
		get: function(){
			return Math.sqrt(this.x*this.x+this.y*this.y);
		}
	},
	left: {
		get: function(){
			return this.x;
		},
		set: function(value){
			this.x = value;
		}
	},
	top: {
		get: function(){
			return this.y;
		},
		set: function(value){
			this.y = value;
		}
	}
});

Point.prototype.distance = function(ptr)
{
	var x, y;
	if ( arguments.length == 1 )
	{
		x = arguments[0].x;
		y = arguments[0].y;
	}
	else
	{
		x = arguments[0];
		y = arguments[1];
	}
	return Math.sqrt(Math.pow(this.x - x,2) + Math.pow(this.y-y,2));
}

Point.prototype['+'] = Point.prototype.add = function(ptr)
{
	return new Point( this.x + ptr.x, this.y + ptr.y );
}

Point.prototype['-'] = Point.prototype.sub = function(ptr)
{
	return new Point( this.x - ptr.x, this.y - ptr.y );
}

Point.prototype['.']= Point.prototype.dotProduct = function(ptr)
{
	return this.x * ptr.x + ptr.y + ptr.y;
}

Point.prototype.radian = function(ptr)
{
	if ( arguments.length )
	{
		return Math.acos(this['.'](ptr)/this.absolute * ptr.absolute);
	}
	return Math.atan2( this.y, this.x );
}

Point.prototype.degree = function(ptr)
{
	var rad = ptr ?  this.radian(ptr) : this.radian();
	return rad * 180/Math.PI;
}

Point.prototype.css = function()
{
	return { left: this.x, top: this.y };
}

function Size(width,height)
{
	this.width = width;
	this.height = height;
}

Size.prototype.css = function()
{
	return { width: this.width, height: this.height };
}

function Rectangle(x,y,width,height)
{
	this.left = x;
	this.top = y;
	this.width = width;
	this.height = height;	
}

Object.defineProperties( Rectangle.prototype, {
	x: {
		get: function(){
			return this.left;
		},
		set: function(value){
			this.left = value;	
		}
	},
	y: {
		get: function() {
			return this.top
		},
		set: function(value){
			this.top = value;
		}
	},
	right: {
		get: function(){
			return this.left + this.width;
		},
		set: function(value){
			this.width = value - this.left;
		}	
	},
	bottom: {
		get: function() {
			return this.top + this.height;
		},
		set: function(value) {
			this.height = value - this.top;
		}
	},
	area: {
		get: function() {
			return this.width * this.height;
		}
	}	
});

Rectangle.Zero = new Rectangle(0,0,0,0);

Object.freeze( Rectangle.Zero );

Rectangle.createByPoints = function(p1, p2)
{
	var l = Math.min( p1.x, p2.x );
	var t = Math.min( p1.y, p2.y );
	var r = Math.max( p1.x, p2.x );
	var b = Math.max( p1.y, p2.y );
	return new Rectangle( l, t, r-l, b-t );
}

Rectangle.prototype.clone = function()
{
	return new Rectangle( this.left, this.top, this.width, this.height );
}

Rectangle.prototype.css = function()
{
	return { left: this.left, top: this.top, 
			width: this.width, height: this.height };
}

Rectangle.prototype.containsPoint = function(ptr)
{
	return (this.left <= ptr.x && ptr.x <= this.right)
		&& (this.top <= ptr.y && ptr.y <= this.bottom );
}

Rectangle.prototype.isOverlap = function(rect)
{
	var left, top, right, bottom;
	left = Math.max( this.left, rect.left);
	top = Math.max( this.top, rect.top);
	right = Math.min( this.right, rect.right );
	bottom = Math.min( this.bottom, rect.bottom );
	return left < right && top < bottom;
}

Rectangle.prototype.intersect = function(rect)
{
	var left, top, right, bottom;
	left = Math.max( this.left, rect.left);
	top = Math.max( this.top, rect.top);
	right = Math.min( this.right, rect.right );
	bottom = Math.min( this.bottom, rect.bottom );	
	if ( left < right && top < bottom )
	{
		return new Rectangle(left, top, right - left, bottom - top );
	}
	else
	{
		return Rectangle.Zero;
	}
}

Rectangle.prototype.set = function(v)
{
	var p = v.position();
	this.left = p.left;
	this.top = p.top;
	this.width = v.outerWidth();
	this.height = v.outerHeight();
}


function adjustCanvas(element) 
{ 
    var canvas = element.get(0); 
    var context = canvas.getContext('2d'); 
    var ratio = (function () { 
            var ctx = context; 
            var dpr = window.devicePixelRatio || 1; 
            var bsr = context.webkitBackingStorePixelRatio || 
                      context.mozBackingStorePixelRatio || 
                      context.msBackingStorePixelRatio || 
                      context.oBackingStorePixelRatio || 
                      context.backingStorePixelRatio || 1; 
        return dpr / bsr; 
    })(); 
    canvas.width *= ratio; 
    canvas.height *= ratio;
    element.css({
        width: canvas.width/ratio,
        height: canvas.height/ratio,
    });
    element.data('ratio', ratio);
	return ratio;
}


