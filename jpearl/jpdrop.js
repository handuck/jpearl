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

function JPDrop(element,props)
{
	var self = this;
	this.element = $(element);
	this.properties = $.extend( {}, props );
	this.element.bind('dragenter', function(e){
		self.element.removeClass('dragwrong');
		var origE = e.originalEvent;
		if ( self.properties.checkDropData ) {
			var data = origE.dataTransfer.getData( self.properties.dataType );
			if ( self.properties.checkDropData(data) ) {
				self.element.addClass('dragwrong');
			} else {
				self.element.addClass('dragenter');
			}
		} else {
			self.element.addClass('dragenter');
		}
		e.preventDefault();
	}).bind('dragover', function(e){
		self.element.addClass('dragover');
		self.element.removeClass('dragenter');
		e.preventDefault();
	}).bind('drop', function(e){
		self.element.removeClass('dragover');
		self.element.removeClass('dragenter');
		e.preventDefault();
		var origE = e.originalEvent;
		if ( self.properties.extensions ) {
			if (  origE.dataTransfer.files.length > 0 ) {
				e.stopPropagation();
				self._processFile(origE);
				return false;
			} else {			
				var data = origE.dataTransfer.getData( self.properties.dataType );
				if ( data && $(e.currentTarget).get(0) == self.element.get(0) ) {
					e.stopPropagation();
					self.element.trigger('dropDone',[data, { offsetX: e.offsetX, offsetY: e.offsetY  }]);
				}
				return false;
			}
		}
		else {
			if ( origE.dataTransfer.files.length > 0 ) {
				e.stopPropagation();
				self.element.trigger('dropDone',[ origE.dataTransfer.files ]);
			} else {
				var data = origE.dataTransfer.getData( self.properties.dataType );
				if ( data && $(e.currentTarget).get(0) == self.element.get(0) ) {
					e.stopPropagation();
					self.element.trigger('dropDone',[data, { offsetX: e.offsetX, offsetY: e.offsetY  }]);
				}
			}
		}
		return false;		
	}).bind('dragleave', function(e){
		self.element.removeClass('dragwrong');
		self.element.removeClass('dragover');
		self.element.removeClass('dragenter');
	});
}


JPDrop.prototype.destroy = function()
{
	this.element.unbind('dragleave drop dragover dragenter dropDone');
}

JPDrop.prototype._checkFiles = function(fileList)
{
	var files = [];
	if ( this.properties.extensions ) {
		for ( var i = 0 ; i < fileList.length; i++ ) {
			var file = fileList[i];
			var fname = file.name;
			var idx = fname.lastIndexOf('.');
			if ( idx > 0 ) {
				fname = fname.substr(idx+1).toLowerCase();
				if ( this.properties.extensions.indexOf(fname) >= 0 ) {
					files.push(file);
				}
			} 
		};
	} else {
		for ( var i = 0 ; i < fileList.length; i++ ) {
			var file = fileList[i];
			files.push(file);
		}
	}
	return files;
}


JPDrop.prototype._processFile = function(e)
{
	var self = this;

  	var files = this._checkFiles(e.dataTransfer.files);
	if ( files.length )
	{
		if ( typeof this.properties.postprocess == 'function' ) {
			this.properties.postprocess(files);
			self.element.trigger('dropDone',[files]);
		}
		else if ( self.properties.multiple ) {
			self.element.trigger('dropDone',[files]);
		}
		else {
			var target = self.properties.target || self.element;
			if ( typeof target == 'function' ) {
				target = target();
				if( target ) {
					this.element.append(target);
				}
			}
			if ( self.properties.postprocess == 'backgroundImage' ) {
				target.css({
					backgroundImage: 'url(' + URL.createObjectURL(files[0]) + ')'
				});
			} else {
				target.attr('src', URL.createObjectURL(files[0]) );
			}
			self.element.trigger('dropDone',[files[0]]);
		}
	}
	else
	{
		alert('file not allowed');
	}
}
