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

function JPSwipe(element, properties)
{
	if ( arguments.length == 0 ) return;
	this.element = $(element);
	this.properties = $.extend({
	  threshold: 75,
	  tapMaxTime: 250,
	  tapMaxDistance: 10,
	  swipeVelocityX : 0.7,	
	  swipeVelocityY : 0.6,	
	  touchOnly: false,
	  checkX: true,
	  checkY: true,
	},properties);

	var self = this;
	if ( !this.properties.touchOnly )
	{
		this.element.bind('mousedown', function(e){
			self.gesture = {
				startTime: Date.now(),
				startPosition: self._mousePoint(e),
			};
			self.gesture.lastPosition = self.gesture.startPosition;
			e.preventDefault();
			e.stopImmediatePropagation();
			self.swiping = false;
			self.ignore = false;
			return false;
		}).bind('mousemove', function(e){
			if ( e.which == 1 )
			{
				return self._move(self._mousePoint(e));
			}
			return true;
		}).bind('mouseenter', function(e){
			self.swiping = false;
		}).bind('mouseleave', function(e){
			if ( self.swiping )
			{
				e.preventDefault();
				e.stopImmediatePropagation();
				self._end(self._mousePoint(e));
				self.swiping = false;
				return false;
			}
		}).bind('mouseup', function(e){
			if ( !self.gesture ) return;
			if ( e.which == 1 && self.swiping )
			{
				e.preventDefault();
				e.stopImmediatePropagation();
				self._end(self._mousePoint(e));
				return false;
			}
			else
			{
				if ( self.swiping )
				{
					self.swiping = false;
					self._end(self._mousePoint(e));
					return false;
				}
				return Date.now() - self.gesture.startTime < 300;
			}
		});
	}	
	
	this.element.click(function(e){
		if ( self.swiping )
		{
			self.swiping = false;
			e.preventDefault();
			e.stopImmediatePropagation();
			return true;
		}
		self.swiping = false;
		if ( Date.now() - self.gesture.startTime < 300 )
		{
			$(e.target).trigger('mouseclick');
		}
		delete self.gesture;
		return;
	});
	
	
	this.element.bind('touchstart', function(e){
		self.gesture = {
			startTime: Date.now(),
			startPosition: self._touchPoint(e),
		};
		self.gesture.lastPosition = self.gesture.startPosition;
		self.ignore = false;
	}).bind('touchmove',function(e){
		return self._move(self._touchPoint(e));
	}).bind('touchend',function(e){
		if ( self.swiping )
		{
			self.swiping = false;
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();
			self._end(self._touchPoint(e));
			return true;
		}
		else
		{
			self.swiping = false;
			if ( Date.now() - self.gesture.startTime < 300 )
			{
				$(e.target).trigger('mouseclick');
			}
		}
	}).bind('touchcancel', function(e){
		if ( self.swiping )
		{
			delete self.gesture;
			self.swiping = false;
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();
			self._end(self._touchPoint(e));
			return false;
		}
	});
}

JPSwipe.prototype._move = function(pos)
{
	var self = this;
	if ( !self.gesture ) return true;
	var distX = pos[0] - self.gesture.lastPosition[0];
	var distY = pos[1] - self.gesture.lastPosition[1];
	var dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY,2));
	if ( !self.ignore && (self.swiping || dist > self.properties.tapMaxDistance) )
	{
		self.gesture.lastPosition = pos;
        var distX = pos[0] - self.gesture.startPosition[0];
        var distY = pos[1] - self.gesture.startPosition[1];
		if ( !self.swiping )
		{
			var aX = Math.abs(distX);
			var aY = Math.abs(distY);
			if ( self.properties.checkX && aX > aY )
			{
				self.swiping = aX > self.properties.tapMaxDistance;
			}
			if ( !self.swiping && self.properties.checkY && aX < aY )
			{
				self.swiping = aY > self.properties.tapMaxDistance;
			}	
		}
		if ( self.swiping )
		{
			self.element.trigger('swipeMove', {
				distance: [ distX, distY ],
				direction: [ distX > 0 ? 'right' : 'left', 
					distY > 0 ? 'top' : 'down' ]
			});
		}
		else
		{
			self.ignore = true;
		}
		return !self.swiping;
	}
	return true;
}

JPSwipe.prototype._end = function(pos)
{
	var self = this;
	if ( self.ignore )
	{
		self.ignore = false;
		return;
	}
	if ( !self.gesture ) return;
	var n = Date.now();
	var distX = pos[0] - self.gesture.startPosition[0];
	var distY = pos[1] - self.gesture.startPosition[1];
	var diff = Date.now() - self.gesture.startTime;
	var skipEnd = false;
	delete self.gesture;
	if ( diff < self.properties.tapMaxTime )
	{
		if ( Math.abs(distX) > Math.abs(distY) &&  Math.abs(distX/diff) > self.properties.swipeVelocityX )
		{
			skipEnd = true;
//			console.log( distX > 0 ? 'swipeRight' : 'swipeLeft');
			self.element.trigger( distX > 0 ? 'swipeRight' : 'swipeLeft');
		}
		if ( Math.abs(distY) > Math.abs(distX) && Math.abs(distY/diff) > self.properties.swipeVelocityY )
		{
			skipEnd = true;
//			console.log( distY > 0 ? 'swipeTop' : 'swipeDown');
			self.element.trigger( distY > 0 ? 'swipeTop' : 'swipeDown');
		}
	}
	if ( !skipEnd )
	{
		self.element.trigger('swipeEnd', {
			distance: [ distX, distY ],
			direction: [ distX > 0 ? 'right' : 'left', 
				distY > 0 ? 'top' : 'down' ]
		});
	}
	return false;
}

JPSwipe.prototype._mousePoint = function(e)
{
	var loc = $(this.element).offset();
	return [e.pageX - loc.left, e.pageY - loc.top];
}

JPSwipe.prototype._touchPoint = function(e)
{
	var loc = $(this.element).offset();
	return [e.originalEvent.changedTouches[0].pageX - loc.left,
		e.originalEvent.changedTouches[0].pageY - loc.top ];
}

$.plugin(JPSwipe);
