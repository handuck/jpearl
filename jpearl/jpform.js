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

function JPFormBase(element,props)
{
	JPView.call(this,element,$.extend(true,{
					
	}, props));
	this.element.addClass('form');
	this._isNew = true;
	this._data = {};
	this._keyViews = {};
	this._keyErrorViews = {};
	this._initialized();
}

JPFormBase.prototype = new JPView();
$.plugin(JPFormBase);

/*
 *  data-key : object key,
 *  data-type : int, double, string, date
 */
JPFormBase.prototype._initialized = function()
{
	if ( this._keys && this._keys.length ) return;
	var self = this;
	this._keys = this.element.find('[data-key]').map(function(){
		var k = $(this).data('key');
		var path = k.split(/\./);
		self._keyViews[k] = $(this);
		self._keyErrorViews[k] = $('.error[data-link="%s"]'.sprintf(k), self.element);
		if ( !self._keyErrorViews[k].length  ) {
			var msgView = $(this).children('.message');
			if ( msgView.length == 1 ) {
				self._keyErrorViews[k] = msgView; 	
			}
		}
		var keyinfo = { path:path , view: $(this), type: $(this).data('type'), error: self._keyErrorViews[k] };
		$(this).data({
			keypath: path,
			keyinfo: keyinfo,
		});
		return keyinfo;
	}).toArray();
	if ( this._keys.length == 0 )
	{
		this._keys = this.element.children().filter(function(){
				return $(this).data('key');
			}).map(function(){
				var k = $(this).data('key');
				var path = k.split(/\./);
				self._keyViews[k] = $(this);
				self._keyErrorViews[k] = $('.error[data-link="%s"]'.sprintf(k), self.element);
				var keyinfo = { path:path , view: $(this), type: $(this).data('type'), error: self._keyErrorViews[k]};
				$(this).data({
					keypath: path,
					keyinfo: keyinfo,
					error: self._keyErrorViews[k]
				});
				return keyinfo;
			}).toArray();
	}
	this._initDone = true;
}

JPFormBase.prototype.setDefault = function()
{
	var self = this;
	if ( !self._data ) self._data = {};
	this._keys.forEach(function(k){
		var v = undefined;
		if ( k.view.get(0).nodeName == 'SELECT' ) 
		{
			v = k.view.val();		
		} else if ( k.view.get(0).nodeName == 'INPUT' ) {
			if ( k.view.attr('type') == 'checkbox' )
			{
				v = k.view.prop('checked');
			}
			else
			{
				v = k.view.val();
			}
		}
		else
		{
			v =	k.view.hasClass('input') || k.view.hasClass('button') ? k.view.instance().value() : k.view.html();
		}
		var obj = self._data;
		var skip = false;
		if ( self.properties.getsetter ) {
			var cb = this.properties.getsetter[path.join('.')];
			if ( cb != null && cb.set ) {
				cb.set( value, obj );
				skip = true;
			} 
		}
		if ( !skip ) {
			for ( var i = 0 ; i < k.path.length-1; i++ )
			{
				if ( !obj[k.path[i]] )
				{
					obj[k.path[i]] = {};		
				}
				obj = obj[k.path[i]];
			}
			obj[k.path[ k.path.length - 1] ] = v;
		}
	});
}

JPFormBase.prototype.getErrorViewForKey = function(key)
{
	if ( Array.isArray(key) ) {
		key = key.join('.');
	}
	return this._keyErrorViews[key];
}

JPFormBase.prototype.getViewForKey = function(key)
{
	if ( Array.isArray(key) ) {
		key = key.join('.');
	}
	return this._keyViews[key];
}

JPFormBase.prototype._getValue = function(path,context)
{
	if ( !Array.isArray(path) ) {
		path = path.split(/\./);
	}
	if ( this.properties.getsetter ) {
		var cb = this.properties.getsetter[path.join('.')];
		if ( cb != null && cb.get ) {
			return cb.get( context || this._data )
		}
	}
	var v = path.reduce( function(node,k){
		return node ? node[k] : undefined;
	}, context || this._data);
	return v;
}

JPFormBase.prototype._setValue = function(path,value,context)
{
	if ( !Array.isArray(path) ) {
		path = path.split(/\./);
	}
	var obj = context || this._data;
	
	if ( this.properties.getsetter ) {
		var cb = this.properties.getsetter[path.join('.')];
		if ( cb != null && cb.set ) {
			cb.set( value, obj );
			return;
		}
	}
	
	var len = path.length - 1;
	if ( len > 0 && !obj[ path[0] ] ) {
		obj[path[0]] = {};
	}
	for ( var i = 0 ; i < len; i++ )
	{
		if ( obj[path[i]] ) {
			obj = obj[path[i]];
		} else {
			obj[path[i]] = {};
			obj = obj[path[i]];
		}
	}
	if ( typeof value == 'string' ) {
		obj[path[len]] = value && value.length > 0 ? value : null;
	} else {
		obj[path[len]] = value;
	}
}

JPFormBase.prototype._parseValue = function(key,value)
{
	var keyinfo = this._keyViews[key];
	if ( !keyinfo ) return value; 
	if ( Array.isArray(keyinfo) ) {
		keyinfo = keyinfo[0].data('keyinfo');
	} else {
		keyinfo = keyinfo.data('keyinfo');
	}
	if ( keyinfo && keyinfo.type ) {
		switch ( keyinfo.type ) 
		{
			case 'int':
				value = (value !== undefined && value !== null) ? parseInt(value) : null;
				break;
			case 'double':
				value = (value !== undefined && value !== null) ? parseFloat(value) : null;
				break;
			case 'date':
				break;
		}
	}
	return value;
}

JPFormBase.prototype.getValue = function(key)
{
	return this._getValue(key);
}


JPFormBase.prototype.setValue = function(key,value)
{
	this._setValue(key,this._parseValue(key,value));
	var view = this.getViewForKey(key);
	if ( Array.isArray(view) ) {
		for ( var i = 0 ; i < view.length; i++ ) {
			if ( view[i].data('value') == value ) {
				switch( view[i].get(0).nodeName ) {
					case 'INPUT':
						view[i].prop('checked', true);
						break;
					default:
						if ( view[i].instance() ) {
							view[i].instance().checked(true);
						}
						break;
				}
				break;
			}
		}
		return;
	}
	if ( view ) {
		switch( view.get(0).nodeName )
		{
			case 'SELECT':
			case 'TEXTAREA':
			case 'INPUT':
				view.val(value);
				break;
			default:
				if ( !view.instance() ) {
					view.text(value);
				} else {
					view.instance().value(value);
					var isValid = view.instance().validate();
					var errmsg = this._keyErrorViews[key];
					if ( errmsg ) {
						if ( isValid ) {
							errmsg.hide();
						} else {
							view.instance().element.addClass('error');
							errmsg.show();
						} 
					}
				}
				if ( view.data('valueType') ) {
					view.formatter(); 
				}
				break;
		}
	}
}

JPFormBase.prototype.enabled = function(value)
{
	if (value==false) {
		
		var disabledFunc = function(v){
			switch( v.get(0).nodeName )
			{
				case 'SELECT':
				case 'TEXTAREA':
				case 'INPUT':
					v.prop('disabled', true);
					break;
				default:
					v.instance().enabled(false);
			}
		}
		
		for( var k in this._keyViews ) {
			var view = this._keyViews[k];
			if ( Array.isArray(view) ) {
				view.forEach(disabledFunc);
			} else {
				disabledFunc(view);
			}
		}
	}
}


JPFormBase.prototype.enabledForKey = function(key,value)
{
	var view = this.getViewForKey(key);
	var disabledFunc = function(v) {
		switch( v.get(0).nodeName ) {
			case 'SELECT':
			case 'TEXTAREA':
			case 'INPUT':
				v.prop('disabled', !value);
				break;
			default:
				v.instance().enabled(value);
	            break;
	
		}
	}
	if ( Array.isArray(view) ) {
		view.forEach( disabledFunc );
	} else {
		disabledFunc(view);
	}
}

JPFormBase.prototype.applyValues = function(data)
{
	var self = this;
	$.extend( data, this._data, {} );
	this._ignoreChanged = true; // temporary block value changed event
	this._keys.forEach( function(k){
		var value = self._getValue(k.path,data);
		switch( k.view.get(0).nodeName )
		{
			case 'SELECT':
			case 'TEXTAREA':
				k.view.val(value === undefined || value === null ? '' : value);
				break;
			case 'INPUT':
				switch( k.view.attr('type') )
				{
					case 'checkbox':
					case 'radio':
						k.view.prop('checked', value);
						break;
					default:					
						k.view.val( value === undefined || value === null ? '' : value);
						break;
				}
				break;
			default:
				k.view.hasClass('input') ? k.view.instance().value(value,false) : k.view.html(value);
				break;
		}
		k.view.removeClass('dirty');
	});
	delete this._ignoreChanged;
	this.element.removeClass('dirty');
}

JPFormBase.prototype.refresh = function()
{
	var self = this;
	this.applyValues();
	this._keys.forEach( function(k){
		self._dirtyCheck(k.path,k.view);
	});
}

JPFormBase.prototype.updated = function()
{
	var data = {};	
	var self = this;
	this._keys.forEach( function(k){
		if ( k.hasClass('dirty') )
		{
			self._setValue( k.path, v, data);
		}
	});
	return data;
}

JPFormBase.prototype.clear = function()
{
	this._data = {};
	this._keys.forEach( function(k) {
		if ( k.view.hasClass('input') ) {
			k.view.instance().clear();
		}
		else if ( k.view.get(0).nodeName == 'TEXTAREA' 
			|| k.view.get(0).nodeName == 'SELECT' 
			|| k.view.get(0).nodeName == 'INPUT' ) {
			k.view.val('');	
		}
		else {
			k.view.empty();
		}
		k.view.removeClass('dirty error empty');
	});
	$( '.error[data-link]', this.element).hide();
	this.element.removeClass('dirty');
}

JPFormBase.prototype.revert = function()
{
	this._data = $.extend(true,{}, $this._revert);
	this.applyValues();
}

JPFormBase.prototype.isValid = function(key)
{
	var v = this.getViewForKey(key);
	if ( v == undefined ) {
		return true;	
	}
	if ( Array.isArray(v) ) {
		return v.some( (k)=> k.hasClass('error') );
	}
	return v.hasClass('error');
}

JPFormBase.prototype.validate = function(callback)
{
	var self = this;
	var valid = true;
	this._keys.forEach( function(k) {
		var inst = k.view.instance();
		var v;
		var keyPath = k.path.join('.');
		var errmsg = self._keyErrorViews[keyPath];
		if ( errmsg ) {
			errmsg.hide();
		}
		if ( inst ) 
		{
			v = inst.value();
			if ( inst.properties.required )
			{
				if ( v === null || v === undefined || v.length == 0)
				{
					k.view.addClass('empty');
					k.view.addClass('error');
					valid = false;
				}
			}
			else if ( inst.validate && !inst.validate() )
			{
				valid = false;	
				k.view.addClass('error');
			}
		}
		else if ( k.view.data('attrRequire') )
		{
			v = k.view.val();
			if ( v.length == 0 ) 
			{
				k.view.addClass('empty');
				k.view.addClass('error');
				valid = false;
			}
		}
		if ( valid && self.properties.validators && self.properties.validators[keyPath] ) {
			valid = self.properties.validators[keyPath]( v, errmsg );
			if ( valid ) {
				k.view.removeClass('error');
			} else {
				k.view.addClass('error');
			}
		}
		if (callback) {
			if ( callback(k,v, valid, errmsg) == false ) {
				k.view.addClass('error');
				valid = false;
			} 
		}
		if ( errmsg ) {
			if ( k.view.hasClass('error') ) {
				errmsg.show();
			} else {
				errmsg.hide();
			}
		}
	});
	return valid;
}

JPFormBase.prototype.value = function(value)
{
	if ( arguments.length )
	{
		var self = this;
		this._isNew = false;
		this._data = value || {};
		this._keys.forEach( function(k) {
			var v = self._getValue(k.path);
			if ( v === undefined || v === null ) {
				if ( k.view.hasClass('input') ) {
					// self._data[k.path.join('.')] = '';
					self._setValue(k.path, k.view.instance().clear());
				}
				else if ( k.view.get(0).nodeName == 'TEXTAREA' 
					|| k.view.get(0).nodeName == 'SELECT' 
					|| k.view.get(0).nodeName == 'INPUT' ) {
					self._setValue(k.path, '');
					k.view.val('');	
				}
				else {
					k.view.html(v);
				}
				k.view.removeClass('dirty');
			}
		});
		this._revert = $.extend(true,{},value);
		return;
	}
	return this._data;
}

JPFormBase.prototype.extend = function(value)
{
	var self = this;
	this._isNew = false;
	this._data = $.extend( this._data || {}, value );
	for( var k in value ){
		self.setValue(k, value[k]);
	}
}

JPFormBase.prototype.revertValue = function()
{
	return this._revert;
}


JPFormBase.prototype._dirtyCheck = function(path, obj)
{
	if ( !Array.isArray(path) ) {
		path = path.split(/\./);
	}
	var dirty = this._getValue(path,this._revert) != this._getValue(path,this._data);
	if ( dirty )
	{
		obj.addClass('dirty');
		this.element.addClass('dirty');
	}
	else
	{
		obj.removeClass('dirty');
		if ( this.element.find('.dirty').length == 0  )
		{
			this.element.removeClass('dirty');
		}
	}
	return dirty;
}

JPFormBase.prototype.isDirty = function(path)
{
	var v = this.getViewForKey(path);
	if ( Array.isArray(v) ) {
		return v.some( (k)=>k.hasClass('dirty') );
	}
	return v && v.hasClass('dirty');
}


JPFormBase.prototype.focus = function(key)
{
	var v = this.getViewForKey(key);
	if ( v ) {
		if ( Array.isArray(v) ) {
			v = v[0];	
		} 
		if ( v.instance() )  {
			v.instance().focus();
		} else {
			v.focus();
		}
	}
}

JPFormBase.prototype.hasDirty = function()
{
	return this._keys.some(function(k){
		return k.view.hasClass('dirty');
	})		
}

JPFormBase.prototype.clearDirty = function()
{
	this._keys.forEach(function(k){
		k.view.removeClass('error dirty empty');
	})		
	$('.error[data-key]', this.element).hide();
}

function JPForm(element,props)
{
	if ( arguments.length == 0 ) return;
	JPFormBase.call(this,element,$.extend(true,{
				
	}, props));
	if (!this.properties.beforeSend )
	{
		this.properties.beforeSend = this.element.attr('event-beforeSend');
	}
	if (!this.properties.afterSend)
	{
		this.properties.afterSend = this.element.attr('event-beforeSend');
	}
	if ( !this.properties.callback )
	{
		this.properties.callback = window[this.element.data('callback')];
	}
}

JPForm.prototype = new JPFormBase();

$.plugin(JPForm);

JPForm.prototype._initialized = function()
{
	var self = this;
	if ( this._keys && this._keys.length ) return;
	this._keys = this.element.find('[data-key]').map(function(){
		if ( !$(this).instance() )
		{
			var cls = $(this).data('plugin');
			if ( cls )
			{
				if ( $(this)[cls] ) {
					$(this)[cls]();
				} else {
					throw "Plugin, " + cls + " not found";
				}
			}
		}
		var k = $(this).data('key');
		var path = k.split(/\./);
		if ( self._keyViews[k] ) {
			if ( !Array.isArray(self._keyViews[k]) ) {
				self._keyViews[k] = [ self._keyViews[k] ];
			}
			self._keyViews[k].push($(this));
		} else {
			self._keyViews[k] = $(this);
		}
		self._keyErrorViews[k] = $('.error[data-link="%s"]'.sprintf(k), self.element);
		if ( !self._keyErrorViews[k].length ) {
			var msgView =  $(this).children('.message');
			if ( msgView.length == 1 ) {
				self._keyErrorViews[k] = msgView; 	
			}
		}		
		var keyinfo = { path:path , view: $(this), type: $(this).data('type'), error: self._keyErrorViews[k] };
		
		$(this).data( {
			keypath: path,
			keyinfo: keyinfo,
		});
		if ( $(this).hasClass('radio') ) 
		{
			var grp = $('[data-key="' + k + '"]', self.element);
			$(this).instance().group(grp);
		}
		var val;
		var eventName;
		if ( this.nodeName != 'TEXTAREA' && this.nodeName != 'INPUT' 
			&& $(this).instance() )
		{
			val = $(this).instance().value();
			eventName = 'valueChange enter';
		}
		else
		{
			eventName = 'change';
		}
		if ( val )
		{
			self._setValue(path,self._parseValue(k,val));
		}
		$(this).unbind(eventName).bind(eventName, function(e,value){
			if ( value === undefined ) {
				if ( this.nodeName == 'INPUT' ) {
					if ( $(this).attr('type') == 'checkbox' ) {
						value = $(this).prop('checked');
					} else {
						value = $(this).val();
					}		
				} else {
					value = $(this).val();
				}
			}
			var orig = self._getValue(path);
			if ( orig == value ) return;
			self._setValue(path,self._parseValue(k,value));
			if ( !self._isNew ) 
			{
				self._dirtyCheck( path, $(this) );
			}
			var inst = $(this).instance();
			
			// temporary block value changed event
			if ( !self._ignoreChanged) {
				var isValid = true;
				if ( inst ) {
					isValid = inst.validate();
				}
				if ( isValid  && self.properties.validators && self.properties.validators[k] ) {
					isValid = self.properties.validators[k](value, self._keyErrorViews[k] )
				}
				var errmsg = self._keyErrorViews[k];
				if ( errmsg ) {
					if ( isValid ) {
						errmsg.hide();
						if ( inst && inst.element ) {
							inst.element.removeClass('error');
						} 
					} else {
						if ( inst && inst.element ) {
							inst.element.addClass('error');
						} 
						errmsg.show();
					} 
				}
				self.element.trigger('valueChanged', [value, path, isValid]);
			}
			return false;
		});
		return keyinfo;
	}).toArray();
	this.setDefault();
	this._initDone = true;
}

JPForm.prototype.value = function(value)
{
	JPFormBase.prototype.value.apply(this,arguments);
	if ( arguments.length )
	{
		this.applyValues();
		this.element.find('[data-value-type]').formatter();
		return;
	}
	return this._data;
}

JPForm.prototype.send = function(callback)
{
	var self = this;
	callback = callback || this.properties.callback;
	if ( this.properties.beforeSend )
	{
		if ( this.properties.beforeSend() === false )
		{
			return false;
		}
	}
	if ( !this.validate() )
	{
		return false;
	}
	$.ajax({
		url: this.element.data('url'),
		method: this.element.data('method') || 'post',
		dataType: 'json',
		data: this.value()
	}).done(function(data){
		if ( callback )
		{
			callback(null,data);
		}
	}).fail(function(err){
		if ( callback )
		{
			callback(err);	
		}
	}).always(function(){
		if ( self.properties.afterSend )
		{
			self.properties.afterSend();
		}
	});	
}
