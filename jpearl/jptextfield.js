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

function JPTextfield(element,props)
{
	if ( arguments.length == 0 ) return;
	JPInput.call( this, element, $.extend(true,{
		hasClear: true,
		required: false,
		autotrim: true,
		hasRearIcon: false,
		autocomplete: false,
		autocompleteCallback: undefined,
		format: undefined
	},props));
	var txt = this.element.text().trim();
	this.element.text('');
	this.element.addClass('textfield textbox input').addClass(this.properties.type);
	if ( this.properties.autocomplete ) {
		this.element.addClass('autocomplete');
	}
	if ( this.properties.required == true )
	{
		this.element.addClass('required');	
	}
	if ( this.properties.icon )
	{
		this.children.front = $('<div/>')
						.html( this.properties.icon )
						.addClass('front').appendTo(this.element);
	}


	var self = this;
	if ( this.properties.pattern )
	{
		this._initForPattern(txt);
	}
	else
	{
		this._initForSingleInput(txt);
	}
	
	if ( txt.length > 0 ) {
		this.element.addClass('filled');
	}
	
	if ( this.properties.frontImage )
	{
		this.element.addClass('hasIcon');
		this.children.input.addClass('frontImage')
			.css({
				backgroundImage: 'url(' + this.properties.frontImage + ')'
			});
	}

	if ( this.properties.autocomplete ) {
		this.children.input.attr('autocomplete', this.properties.autocomplete);
	}

	if ( this.properties.hasRearIcon || this.properties.hasClear )
	{
		this.children.rear = $('<div/>').css({
			}).appendTo(this.element).addClass('rear');
		this.children.rear.append($('<div/>').addClass('icon'));
	}
	if ( this.properties.hasClear  )
	{
		this.children.rear.addClass('clear').click(function(e){
			self.clear();
			self.element.trigger('clear');	
            self.element.trigger('valueChange', [ self.value(), true ] );
            self.element.trigger('change', [ self.value(), true ] );
		});
	}
	if ( this.properties.readonly ) {
		this.element.addClass('readonly');
	}
	
	this.children.input.mousedown(function(e){
		e.stopPropagation();
	});
	
	this.children.input.mouseup(function(e){
		return false;
	});

	if ( this.properties.autocomplete ) {
		this.children.dropbox = $('<div/>').JPListview({
				converter: this.properties.converter,
				selectable: true,
				template: this.properties.template,
				plugin: 'detail',
				pluginOptions: {
					style: 'auto'
				}
			}).addClass('textfield dropbox').bind('dismiss', function(e){
			 	self._closeDropBox();  
			}).bind('itemClicked', function(e, item, view, idx){
				self._selectedItem = item;
				if ( self.properties.dropboxKey ) {
					item = item[self.properties.dropboxKey];
				}
				self.value(item);
			 	self._closeDropBox();  
			 	self.element.trigger('valueChange', item);			
			 	return false;
			}).appendTo(this.element);
		this.children.dropbox.css({
			top: this.element.height()
		})
		this._initKeyEvents();
	}	
}

JPTextfield.prototype = new JPInput();

$.plugin( JPTextfield );

JPTextfield.prototype._openDropBox = function(forcefully)
{
	if ( this.element.hasClass('opened') && !forcefully ) return;
	this.element.addClass('opened');
    if ( this.children.dropbox.height() + this.element.offset().top - $(window).scrollTop() > window.innerHeight ) {
		var off = this.element.position();
		off.left = 0;
		off.top = -this.children.dropbox.outerHeight(true);
		this.children.dropbox.css(off);
	} else {
		var off = this.element.position();
		off.left = 0;
		off.top = $('.inputbox',this.element).height();
		this.children.dropbox.css(off);
	}
}

JPTextfield.prototype._closeDropBox = function()
{
	this.element.removeClass('opened');
/*
	if ( this.element.hasClass('opened') )
	{

		var self = this;
		setTimeout(function(){
			this.element.removeClass('opened');
		},50);
	}
*/
}

JPTextfield.prototype._initKeyEvents = function()
{
	var self = this;
	this.children.input.keyup(function(e){
        if ( e.ctrlKey || e.altKey || e.metaKey ) return;

        if( e.which == 0x20 || ( 37 <= e.which && e.which <= 40  ) )
        {   
        	e.preventDefault();
        	self._openDropBox();
        	return false;
        }
       
    }).keydown(function(e){
        if ( e.ctrlKey || e.altKey || e.metaKey || e.which == 37 || e.which == 39 || e.which < 0x20  ) {
            if ( e.which != 9 ) {
                return;
            }
            var idx = self._selectedIndex;
			if ( idx >= 0 ) {
   				self.element.trigger('valueChange', self.properties.value);			
			} else {
				self.element.trigger('valueChange', self.text());
			}
			self._closeDropBox();
			return;
        }
        var len = self.children.dropbox.instance().length();
        var idx = self._selectedIndex;
        switch(e.which) {
            case 38: // up
            	if ( self.element.hasClass('opened') ) {
	            	self.selectedIndex((( idx - 1 ) + len) % len, true);
				}
            	return false;
            case 40: // down
                if ( self.element.hasClass('opened') ) {
	        		self.selectedIndex((idx+1) % len, true);
	        	}
            	return false;
            case 9:
           		self._closeDropBox();
                return false;
            case 13:
                if ( self.properties.preventEnter ) {
                    e.preventDefault();
                    return false;
                }
                return false;
        }
    });
}


JPTextfield.prototype._runAutocomplete =  function()
{
	var self = this;
	var txt = this.children.input.val().trim();
	if ( txt.length ) {
		self._selectedIndex = -1;
		self._selectedItem = undefined;
		self.properties.autocompleteCallback( txt, function(list){
			if ( list && list.length  ) {
				self.children.dropbox.instance().items(list); 
				self._openDropBox();
			} else {
				self._closeDropBox();
			}
		}) ;
	} else {
		self._closeDropBox();
	}
}

JPTextfield.prototype._initForSingleInput = function(txt)
{
	var self = this;
	if ( this.properties.type == 'currency' && txt && txt.length > 0 )
	{
		txt = parseInt(txt).toLocaleString();	
	}
	var input = $('<input/>',{
					placeholder: this.properties.placeholder,
					autocomplete: 'off',
					value: txt && txt.length ? txt : undefined,
					maxlength: this.properties.maxlength
				}).addClass('field')
				.keyup(function(e){
					self.element.trigger('keyup', [$(this).val()]);
					if ( e.which == 13 )
					{
						if ( self.properties.autotrim ) {
							var txt = input.val().trim();
							input.val(txt);
						}
						if ( self.properties.autocomplete == 'enter' ) {
							e.preventDefault();
							e.stopPropagation();
							e.stopImmediatePropagation();
							if ( !self._autocompletTimer ) {
								self._autocompletTimer = setTimeout(function(){
									if ( !self.element.hasClass('opened') ) {
										self._runAutocomplete()
									} else {
										self._closeDropBox();
										if( self._selectedItem ) {
							    			self.element.trigger('valueChange', self.properties.value);			
							            }
									}
									self._autocompletTimer = undefined;							
								}, 200);
							}
							return false;
						} 
						else 
						{
							self.element.trigger('enter', [input.val() ]);
						}
						return false;
					}
					
					if( e.which <= 32  || (37 <= e.which && e.which <= 40) ) {
				        if ( e.which == 0x9 ) {
        					self._closeDropBox();
        				}
						return;
					}
					
					if ( self.properties.autocomplete && self.properties.autocomplete != 'enter' ) {
						self._runAutocomplete()
					}				
				})
				.focusin(function(e){
					if ( self.properties.enabled ) {
						self.element.addClass('focus');
						if ( !($.js.popup.view instanceof JPPopoverContainer) ) {
							$.js.popup.hide();
						} 
					//	self.element.trigger('focus', [$(this).val()]);
					}
				}).focusout(function(e){
					if ( self.properties.enabled ) {
						self.element.removeClass('focus');
						if ( !self.element.hasClass('opened') ) {
							self.blur();
						}
					//	self.element.trigger('blur', [$(this).val()]);
						if ( self.properties.autocomplete == 'enter' ) {
							setTimeout(function(){
								if ( !self._selectedItem ) {
//									self.clear();
								}
							}, 500);
						}
					}
				})
				.appendTo(this.element);
	if ( this.properties.type == 'password' )
	{
		input.attr( {
			type: this.properties.type,
			autocomplete: 'new-password',
			"data-lpignore": true,
			maxlength: 32
		//	autocomplete: "new-password"
		}).change(function(e){
			e.stopPropagation();
			if ( self.properties.autotrim ) {
				var txt = input.val().trim();
				input.val(txt);
			}
			var v = $(this).val().trim(); 
			if ( self.properties.required && v.length == 0 )
			{
				self.element.addClass('error');
				self.element.addClass('empty');
			}
			else
			{
				self.element.removeClass('error');
				self.element.removeClass('empty');
			}
			self.element.trigger('valueChange', [ v, undefined ] );
		});
	}
	else if ( this.properties.type )
	{
		input.keydown(function(e){
			return self._filter(e);
		}).change(function(e){
			e.stopPropagation();
			var v = $(this).val().trim();
			if ( self.properties.type == 'currency' )
			{
				v = v.replace(/,/g, '');
			}
			self.element.trigger('valueChange',
				[ v, self.properties.validator ?  self.validate(e) : undefined ] );
			return false;
		});

		if ( !this.properties.validator )
		{
			switch (this.properties.type)
			{
				case 'integer':
					this.properties.validator = /^[+-]?\d+$/;
					break;
				case 'currency':
					this.properties.validator = /^[+-]?\d{1,3}(,\d{3})*(\.\d{2})?$/;
					break;
				case 'number':
					this.properties.validator = /^[+-]?\d+(\.\d+)?$/;
					break;
				case 'companyreg':
					this.properties.validator = /^\d{3}-?\d{2}-?\d{5}$/;
					break;
				case 'phone':
				case 'tel':
					this.properties.validator =  /^0\d{1,2}-?\d{3,4}-?\d{4}$/
					break;
				case 'email':
					this.properties.validator = /^[\w_\-\.]{3,}@(\w+\.)+\w+$/;
					break;
				case 'color':
					this.properties.validator = /^(#|0x)?[\da-fA-F]{6}$/;
					break;
				case 'date':
					this.properties.validator =  /^\d{4}-?\d{1,2}-?\d{0,2}$/
					break;
			}	
		}
	}
	else
	{
		input.change(function(e){
			e.stopPropagation();
			if ( self.properties.autotrim ) {
				var txt = input.val().trim();
				input.val(txt);
			}
			var v = $(this).val().trim(); 
			if ( self.properties.required && v.length == 0 )
			{
				self.element.addClass('error');
				self.element.addClass('empty');
			}
			else
			{
				self.element.removeClass('error');
				self.element.removeClass('empty');
			}
			if ( !self.properties.autocomplete ) {
				self.element.trigger('valueChange', [v]);
			}
			return false;
		});
	}
	if ( this.properties.enabled === false )
	{
        this.properties.readonly = true;
		input.prop('disabled', true );
		this.element.addClass('disabled');
	}
	if ( this.properties.readonly )
	{
        this.properties.enabled = false;
		input.prop('disabled', true );
		this.element.addClass('readonly');
//		this.properties.hasClear = false;
	}
	this.children.input = input;
	if ( this.properties.value )
	{
		input.val(this.properties.value);		
	}
}

JPTextfield.prototype._initForPattern = function(txt)
{
	var self = this;
	var len = this.properties.pattern.length;	
	this.children.pattern = $('<div/>').addClass('pattern').appendTo(this.element);
	var ptrn = this.properties.pattern.replace(/[dw]/g, '_');
	var input = $('<input/>',{
					maxlength: len,
					value: ptrn && ptrn.length ? ptrn: undefined
				}).addClass('field').keydown(function(e){
					if ( e.which == 0x8 ) return false;	
				}).keyup(function(e){
					var offset = 1;
					if ( e.which < 0x30 || e.metaKey || ( 112 <= e.which && e.which <= 123 ) ) 
					{
						if ( e.which != 0x20 )
						{
							return;
						}
					}	
					var character;
					if ( 96 <= e.which && e.which < 106 )
					{
						character = (e.which - 96).toString();
					}
					else if ( e.which == 0x20 )
					{
						character = '_';
					}
					else
					{
						character = String.fromCharCode(e.which);
					}
					idx = input.get(0).selectionStart;
					if ( idx >= len ) return true;
					if ( ptrn[idx] == '-' )
					{
						idx++;
					}
					var p = $(this).val();
					var v = '';
					for ( var i = 0 ; i < len; i++ )
					{
						if ( ptrn[i] != '-' )
						{
							if ( i == idx )
							{
								v += character;	
							}
							else
							{
								v += p[i];
							}
						}
						else 
						{
							v += '-';			
						}
					}
					if ( e.which == 13 )
					{
						self.element.trigger('enter', [$(this).val()]);
					}
					$(this).val(v.substr(0,len));
					input.get(0).selectionStart = idx+offset;
					input.get(0).selectionEnd = idx+offset;
					self.element.trigger('keyup', [$(this).val()]);
					return false;
				}).focusin(function(e){
					self.element.addClass('focus');
					self.element.trigger('focus', [$(this).val()]);
				}).focusout(function(e){
					self.element.removeClass('focus');
					self.element.trigger('blur', [$(this).val()]);
				}).appendTo(this.children.pattern);
	this.children.input = input;
}

JPTextfield.prototype.selectedItem = function(v)
{
	if ( arguments.length ) {
		this._selectedItem = v;
	}
	return this._selectedItem;
}

JPTextfield.prototype.selectedIndex = function(v,ignoreChange)
{
	if ( !this.properties.autocomplete ) return;
	var inst = this.children.dropbox.instance();
	if ( inst && inst.length() > 0 && arguments.length ) {
		this._selectedIndex = v;
		inst.selectedIndex(v);
		var item = inst.items()[v];
		this._selectedItem = item;
		if ( item  ){
			if ( this.properties.dropboxKey ) {
				item = item[this.properties.dropboxKey];
			}
			this.value( item);	
		}
//		this.element.trigger('valueChange', [ this.value(), undefined ] );
	}
	return this._selectedIndex;
} 

JPTextfield.prototype.placeholder = function(v)
{
	$('input', this.element).attr('placeholder', v);	
}

JPTextfield.prototype.enabled = function(value)
{
    if ( arguments.length ) { 
        arguments[0] = !arguments[0];
    }
    return this.readonly.apply(this, arguments);
}

JPTextfield.prototype.length = function()
{
	return this.children.input.val().trim().length;
}

JPTextfield.prototype.text = function()
{
	if( arguments.length )
	{
		this.children.input.val( arguments[0] );
		return;
	}
	return this.children.input.val().trim();	
}

JPTextfield.prototype.value = function()
{
	if ( arguments.length > 0 )
	{
		var v = arguments[0];
		if ( v !== undefined && v !== null) {
			switch( this.properties.type ) {
				case 'currency':
					v = parseInt(v).toLocaleString();	
					break;
				case 'companyreg':
					var list = v.match(/^(\d{3})-?(\d{2})-?(\d{5})$/);
					if ( list ) {
						v = "%s-%s-%s".sprintf(list[1], list[2], list[3]);
					}
					break;
				case 'phone':
					var list = v.match(/(\d{2,3})-?(\d{3,4})-?(\d{4})/);
					if ( list ) {
						v = "%s-%s-%s".sprintf(list[1], list[2], list[3]);
					}
					break;
				case 'date':
					if ( v instanceof Date ) {
						v = v.format('Y-m-d');
					} else if ( typeof v == 'number' ) {
						v = new Date(v).format('Y-m-d');
					} else {
						var list = v.match(/(\d{4})-?(\d{1,2})-?(\d{1,2})/);
						if ( list ) {
							v = "%s-%02d-%02d".sprintf(list[1], list[2], list[3]);
						}
					}
					break;
			}
		}
		this.properties.value = v;
//		this.children.input.prop('disabled', !this.properties.enabled && !this.properties.readonly );
		this.children.input.val(v);
		return;
	}
	var v = this.children.input.val().trim();
	switch( this.properties.type ) {
		case 'phone':
		case 'companyreg':
			v = v.replace(/-/g, '');
			break;
		case 'currency':
			v = v.replace(/,/g, '');
			break;
	}
	return v; 
}

JPTextfield.prototype.clear = function()
{
	if ( !this.properties.enabled ) return;
	this.children.input.val('');
	
	if ( this.properties.autocomplete  ) {
		this._selectedItem = undefined;
		this._selectedIndex = -1;
		this._closeDropBox();
	}
	
	if ( this.properties.pattern )
	{
		var ptrn = this.properties.pattern.replace(/[dw]/g, '_');
		this.children.input.val(ptrn);
	}
	this.element.removeClass('error');
}

JPTextfield.prototype._checkPattern = function(e)
{
	return true;
}

JPTextfield.prototype.focus = function(e)
{
	this.children.input.focus();
}

JPTextfield.prototype.blur = function(e)
{
	if( e ) {
		this.children.input.blur();
	}
	if ( this.properties.autotrim ) {
		var txt =  this.children.input.val().trim();
		 this.children.input.val(txt);
	}
	var v = this.children.input.val();
	if ( v && v.length > 0 ) {
		this.element.removeClass('empty');
		switch( this.properties.type ) {
			case 'phone':
				var list = v.match(/(0\d{1,2})-?(\d{3,4})-?(\d{4})/);
				if ( list ) {
					v = "%s-%s-%s".sprintf( list[1], list[2], list[3] );
				}
				this.children.input.val(v);
				break;
			case 'date':
				var list = v.match(/(\d{4})-?(\d{1,2})-?(\d{1,2})/);
				if ( list ) {
					v = "%s-%02d-%02d".sprintf(list[1], list[2], list[3]);
				}
				this.children.input.val(v);
				break;				
			case 'currency':
				v = v.replace(/,/g, '');
				if ( v.match(/^\d+$/) ) {
					v = parseInt(v).toLocaleString();	
					this.children.input.val(v);
				}
				break;
		}
	}
	if ( this.properties.autocomplete  ) {
		this._closeDropBox();
	}
}

JPTextfield.prototype._filter = function(e)
{
	if ( e.ctrlKey || e.which < 0x30 || e.metaKey || ( 112 <= e.which && e.which <= 123 ) ) return true;
	switch( this.properties.type )
	{
		case 'integer':
			return   (0x30 <= e.which && e.which <= 0x39) 
				  || (96 <= e.which && e.which <= 105) 
				  || e.which == 187 || e.which == 189;   // +, -
		case 'currency':
			return   (0x30 <= e.which && e.which <= 0x39) 
				  || (96 <= e.which && e.which <= 105) 
				  || e.which == 187 || e.which == 189   // +, -
				  || e.which == 190 || e.which == 188;  // comma, peroid
		case 'number':
			return   (0x30 <= e.which && e.which <= 0x39) 
				  || (96 <= e.which && e.which <= 105) 
				  || e.which == 107 || e.which == 109   // +, -
				  || e.which == 187 || e.which == 189   // +, -
				  || e.which == 190 || e.which == 110; // comma
		case 'companyreg':
		case 'phone':
		case 'tel':
		case 'date':
			return  (0x30 <= e.which && e.which <= 0x39) 
				  || (96 <= e.which && e.which <= 105) 
				  || e.which == 109
				  || e.which == 187;
				 
		case 'date': 
			return  (0x30 <= e.which && e.which <= 0x39) 
				  || (96 <= e.which && e.which <= 105) 
				  || e.which == 109
				  || e.which == 189;
		case 'color':
			return   (0x30 <= e.which && e.which <= 0x39) 
				  || (0x41 <= e.which && e.which <= 0x46)
				  || (0x61 <= e.which && e.which <= 0x66)
				  || (96 <= e.which && e.which <= 105) 
				  || e.which == 51 // #
				  || e.which == 88 // x
	}
	return true;
}

JPTextfield.prototype.validate = function(e)
{
	var success = true;
	this.blur();
	var v = this.children.input.val();
	this.element.addClass('error empty');
	if ( this.properties.required && v.length == 0 ) {
		return false;
	} else if ( !this.properties.required && v.length == 0 ) {
		this.element.removeClass('error');
		this.element.removeClass('empty');
		return true;
	} else if ( typeof this.properties.validator == 'function' ) {
		success = this.properties.validator(v);
	} else if ( this.properties.validator ) {
		success = this.properties.validator.test(v)
		this.properties.validator.lastIndex = 0;
	} 

	if ( success ) {
		if ( this.properties.type == 'date' ) {
			var dt = new Date(v);
			success = !isNaN( dt.getTime());
		} else if ( this.properties.type == 'companyreg') {
			var keys =[ 1, 3, 7, 1, 3, 7, 1, 3, 5 ];
			var num = v.replaceAll('-', '' );
			var s = 0;
			for ( var i = 0 ; i < keys.length ; i++ ) {
				s += keys[i] * parseInt(num[i] || 0);
			}
			s +=  parseInt( (keys[8] * parseInt(num[8]||0))/10 );
			if ( num[9] !=  10 - s % 10 ) {
				success = false;
			}
		}
	}

 	if ( success )
	{
		this.element.removeClass('error');
		this.element.removeClass('empty');
	}
	else 
	{
		this.element.addClass('error');
	}
	return success;
}

JPTextfield.prototype.readonly = function(v)
{
	if ( arguments.length ) {
		this.properties.readonly = v;
        this.properties.enabled = !v;
		if ( this.properties.readonly ) {
			this.element.addClass('readonly');
		} else {
			this.element.removeClass('readonly');
		}
		this.children.input.prop('disabled', v);
		return;
	}
	return this.properties.readonly;
}
