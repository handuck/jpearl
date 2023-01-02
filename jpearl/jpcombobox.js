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

function JPCombobox(element,props)
{
	JPView.call( this, element, $.extend(true,{
		icon: {
			/*
			open: '▲',
			close: '▼'
			*/
		},
		data: null,
		filterData: false,
		itemConverter: undefined
	}, props));
	var childList = this.element.children(); 
	var templates = undefined;
	if ( childList.length == 1 ) {
		if ( childList.eq(0).get(0).tagName == 'SCRIPT' ) {
		//	templates = childList;
			chilldList = [];
		} else if ( childList.eq(0).get(0).tagName == 'TEMPLATE' ) {
			templates = childList.eq(0);
			templates.detach();
			childList = [];
			templates = undefined;
		}
	}
	this.element.addClass('combobox textbox input');
	if ( this.properties.type == 'calendar' ) 
	{
		this.properties.editable = true;
		if ( !this.properties.dateFormatter ) {
			this.properties.dateFormatter  = 'Y-m-d';
			if ( this.properties.time )
			{
				this.properties.dateFormatter += ' ' + this.properties.time;
			}
		}
		if ( !this.properties.validator ) {
			if ( this.properties.time )
			{
				this.properties.validator = function(v){
					$.consts.validate.datetime.lastIndex = 0;
					$.consts.validate.cdatetime.lastIndex = 0;
					return $.consts.validate.datetime.test(v) || $.consts.validate.cdatetime.test(v);
				} 
			}
			else
			{
				this.properties.validator = function(v){
					$.consts.validate.date.lastIndex = 0;
					$.consts.validate.cdate.lastIndex = 0;
					return $.consts.validate.date.test(v) || $.consts.validate.cdate.test(v);
				} 
			}
		}
	}
	else if ( this.properties.type == 'color' )
	{
		this.properties.editable = true;
		this.properties.validator = new RegExp($.consts.validate.color);
	}
	var self = this;
	if ( this.properties.editable )
	{
		this.children.input = $('<input/>',{
			placeholder: this.properties.placeholder,
			maxlength: this.properties.maxlength
		});
		if ( this.properties.type != 'calendar' || this.properties.type != 'color' ) 
		{
			this.children.input.keyup(function(e){
				setTimeout(function(){
					if ( e.which >= 0x30 ) {
						var v = $(self.children.input).val();
						if ( v.length > 0) {
							self.open(true);
						}
						else {
							self.close();
						}						
					}
				},0);
			});
			this.children.input.change(function(e){
				var v = $(this).val().trim();
				if ( !v || v.length == 0 || !self.validate() ) {
					self.value(null);
				}
				if ( v && self.properties.type == 'calendar' ) {
					v = Date.new(v);
				}
				self.value(v);
				self.close();
			});
		}
		else
		{
			this.children.input.change(function(e){
				if ( self.validate() ) {
					self.value(  self.children.input.val()  );
				}
			});
		}
		this.children.input.focus(function(e){
			self.element.addClass('focus');	
		}).blur(function(e){
			self.element.removeClass('focus');	
			self.close();
		});		
	}
	else
	{
		this.children.input = $('<div/>', { tabindex: 0 });
		this.element.mouseclick(function(e){
			self.toggle();
			e.stopImmediatePropagation();
			return false;
		});
	}
	
	this.children.input.appendTo(this.element).addClass('field');
	if (this.properties.value)
	{
		this.value(this.properties.value, true);
	}
	this.children.input.css({
		display: 'table-cell'
	});

	if ( this.properties.type == 'color' )
	{
		this.children.arrow = $('<div/>').appendTo(this.element)
								.addClass('color')
								.css( 'backgroundColor', '#000000');
	}
	else if ( this.properties.type != 'calendar' 
		&& $.isPlainObject(this.properties.icon) )
	{
		this.children.arrow = $('<div/>').appendTo(this.element).addClass('default')
							.html(this.properties.icon.close);
	}
	else
	{
		this.children.arrow = $('<div/>').appendTo(this.element);
		this.children.arrow.icon = $('<div/>').addClass('icon').appendTo(this.children.arrow);
	}
	this.children.arrow.addClass('arrow')
			.mouseclick( function(e){
				self.toggle();
				e.stopImmediatePropagation();
				return false;
			});
	if ( this.properties.type == 'calendar' )
	{
		this.element.addClass( 'cal' );
		this.children.dropbox = $('<div/>').JPCalendar({
			time: this.properties.time
	//		type: 'calendar'
		}).addClass('combobox dropbox cal ' + (this.properties.classes || '')).bind('itemClicked', function(e,date,mode){
			self.value(date);
			self.close();
		}).bind('valueChange',function(e, value){
			self.value(value);	
		})
	}
	else if ( this.properties.type == 'color' )
	{
		this.element.addClass( 'color' );
		this.properties.dropboxWidth = 230;
		this.children.dropbox = $('<div/>').JPColorPicker({
		}).addClass('combobox dropbox ' + (this.properties.classes || '')).bind('valueChange',function(e,rgb,hsv){
			self.value(rgb);
		});
	}
	else
	{
		this.properties.type = 'select';
		this.children.dropbox = $('<div/>').JPListview({
			drawer: this.properties.drawer,
			template: templates || this.properties.template,
			converter: this.properties.converter,
			initTemplate: this.properties.initTemplate,
			selectable: true,
			plugin: this.properties.listPlugin || 'detail',
			pluginOptions: {
				style: 'auto'
			},
			hasOptionViews: !this.properties.editable && ( this.properties.drawer || this.properties.template )
		}).addClass('combobox dropbox ' + (this.properties.classes || '')).bind('dismiss', function(e){
		 	self.close();  
		}).bind('itemClicked', function(e, item, view, idx){
			self._selectedIndex = idx;
			self.value(item);
		 	self.close();  
		});
		
		if ( this.properties.columns ) {
			this.children.dropbox.addClass( 'col' + this.properties.columns );
		}
		
		if ( this.properties.data && !this.properties.filterData ) {
			this.children.dropbox.instance().items( this.properties.data );
		}
		else if ( !this.element.find('script[type$=Template]').length ) {
			if ( this.element.find('[data-value]').length > 0 ) {
				var itemView = this.element.find('[data-selected=true]');
				this.children.dropbox.JPListview('optionViews', this.element.find('[data-value]'));
				if ( itemView.length ) {
					itemView.addClass('selected');
					self.value( itemView.data('value'),true);
				}
			}
			else if ( childList.length > 0 && this.element.children().length > 0 ) {
				this.children.dropbox.instance().optionViews(childList);
			}
		}

		this._initKeyEvents();
		
	}
	this.children.dropbox.bind('dismiss', function(e){
		self.close();
	});
	if ( this.properties.name ) {
		this.children.dropbox.addClass( this.properties.name );
	}
	if ( this.properties.type == 'select' ) {
		this.selectedIndex(this.properties.selectedIndex||0, true);
	}
	this.element.find('script[type$=Template]').remove();
	
	var txt = this.element.data('value');
	if ( txt && txt.length > 0 ) {
		this.value(txt);
	}
}

$.plugin(JPCombobox);
JPCombobox.prototype = new JPView();

JPCombobox.prototype.enabled = function()
{
	if ( arguments.length ) {
		if ( this.children.input ) {
			this.children.input.prop('disabled', !arguments[0]);
		}
	}
	return JPView.prototype.enabled.apply( this, arguments );
}

JPCombobox.prototype._initKeyEvents = function()
{
	var self = this;
	this.children.input.keyup(function(e){
		if ( !self.properties.enabled ) {
			return false;
		}
        if ( e.ctrlKey || e.altKey || e.metaKey ) return;
        if ( e.which == 0x9 ) {
        	e.preventDefault();
//        	self.toggle();
        	return false;
        }
        if( e.which == 0x20 || ( 37 <= e.which && e.which <= 40  ) )
        {   
        	e.preventDefault();
        	self.open();
        	return false;
        }
        else if ( e.which == 13 ) // enter
        {   
            e.preventDefault();
            self.close();
            if( self.properties.editable && self.properties.value ) {
    			self.element.trigger('valueChange', self.properties.value);			
            }
            return false;
        }
    }).keydown(function(e){
		if ( !self.properties.enabled ) {
			return false;
		}
        if ( e.ctrlKey || e.altKey || e.metaKey || e.which == 37 || e.which == 39 || e.which < 0x20  ) {
            if ( e.which != 9 ) {
                return;
            }
			return;
        }
        var len = self.children.dropbox.instance().length();
        var idx = self._selectedIndex;
        switch(e.which) {
            case 38: // up
            	self.selectedIndex((( idx - 1 ) + len) % len, true);
            	return false;
                break;
            case 40: // down
            	self.selectedIndex((idx+1) % len, true);
            	return false;
            	break;
            case 9:
                self.selectedIndex(idx);
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

JPCombobox.prototype.open = function(forcefully)
{
	if ( !this.properties.enabled ) {
		return;
	}
	if ( this.element.hasClass('opened') && !forcefully ) return;
	if ( (this.properties.type != 'calendar' && this.properties.type != 'color') 
		&& $.isPlainObject(this.properties.icon) )
	{
		this.children.arrow.html( this.properties.icon.open );	
	}
	this.element.addClass('opened');
	this.element.addClass('focus');	
	var self = this;
	if ( !this.children.dropbox.is(':visible') )
	{
		var off = this.element.offset();
		off.top += this.element.outerHeight() - 1;
		if (  this.properties.dropboxHeight ) {
			off.height =  this.properties.dropboxHeight;
			off.overflowY = 'auto';
		}
		this.children.dropbox.width( this.element.outerWidth() );
		this.children.dropbox.css(off);
		$.js.popup.show(this.children.dropbox);
	}
	if ( this.properties.type == 'calendar' )
	{
		if ( this.properties.dropboxWidth )
		{
			this.children.dropbox.width( this.properties.dropboxWidth );
		}
		if (  this.properties.dropboxHeight ) {
			this.children.dropbox.height( this.properties.dropboxHeight ); //|| this.element.outerWidth(true) );
		}
		this.children.dropbox.JPCalendar('date', this.properties.value );
	}
	else if ( this.properties.type == 'color' )
	{
		this.children.dropbox.width( this.properties.dropboxWidth );
		this.children.dropbox.instance().value(this.properties.value, true);
	}
	else
	{
	//	this.children.dropbox.find('.item.selected').removeClass('selected');
		if ( this.properties.editable )
		{
			var val = this.children.input.val();
			self._selectedIndex = -1;
			delete self.properties.value;
			if ( val && val.trim().length > 0 ) {
				val = val.trim();
				if ( typeof this.properties.data == 'function' )
				{
					this.properties.data(val, function(list){
						if ( list ) {
							self.children.dropbox.JPListview('items', list);
						} else {
							self.close();
						}
					});
				}
				else if ( this.properties.filterData )
				{
					var flist = this.properties.data.filter(function(v){
								return v.indexOf(val) >= 0;
							});
					if ( flist.length )
					{
						this.children.dropbox.JPListview('items', flist);
					}
					else
					{
						$.js.popup.hide();
					}
				}
			} else {
				this.close();
				return;
			}
		}
		else if ( this.properties.data )
		{
			this.children.dropbox.JPListview('items', this.properties.data );
			var value = this.value();
			for ( var i = 0 ; i < this.properties.data.length; i++ )
			{
				if ( this.properties.data[i] == value )
				{
					var itemView = this.children.dropbox.instance().itemViewAt(i);
					itemView.addClass('selected');
					break;
				}
			}
		}
		
		if ( this.properties.type == 'select' ) {
			if (  this._selectedIndex != -1 ) {
				this.selectedIndex(this._selectedIndex || 0, true);
			}
		}
		
		if ( this.properties.dropboxWidth )
		{
			this.children.dropbox.width( this.properties.dropboxWidth );
		}
	}
	
	var off = this.element.offset();
	if ( this.children.dropbox.outerWidth(true) + this.element.offset().left > window.innerWidth ) {
		off.left = window.innerWidth - this.children.dropbox.outerWidth(true) - 5;
	}
    if ( this.children.dropbox.outerHeight(true) + this.element.offset().top - $(window).scrollTop() > window.innerHeight ) {
		off.top -= this.children.dropbox.outerHeight(true);
	} else {
		off.top += this.element.height();
	}
	this.children.dropbox.css(off);	
}

JPCombobox.prototype.close = function()
{
	if ( this.element.hasClass('opened') )
	{
		this.element.removeClass('opened');
		this.element.removeClass('focus');	
		if ( (this.properties.type != 'calendar' 
			&& this.properties.type != 'color')
			&& $.isPlainObject(this.properties.icon) )
		{
			this.children.arrow.html( this.properties.icon.close );	
		}
		$.js.popup.hide();
		this.element.trigger('focusout');
	}
}

JPCombobox.prototype.focus = function(e)
{
	if ( this.properties.type == 'calendar' || !this.properties.editable )
	{
		var self = this;
		setTimeout(function(){
			self.open();
		},0);
	}
	else if ( this.children.input )
	{
		this.children.input.focus();
	}
}

JPCombobox.prototype.blur = function(e)
{
	this.close();
}

JPCombobox.prototype.toggle = function()
{
	if ( this.element.hasClass('opened') )
	{
		this.close();
	}
	else
	{
		this.open();
	}
}

JPCombobox.prototype.clear = function()
{
	if ( this.properties.type == 'select' ) {
		this.selectedIndex(0, true);
		return this.properties.value;
	}
}

JPCombobox.prototype.validate = function(v)
{
	var success = true;
	var v = this.children.input.val();
	if ( v.length > 0 && this.properties.validator )
	{
		if ( typeof this.properties.validator == 'function' ) 
		{
			success = this.properties.validator(v);
		}
		else if ( this.properties.validator instanceof RegExp )
		{
			success = this.properties.validator.test(v);
		}
		else if ( this.properties.type == 'calendar' ) {
			success = $.consts.validate.date.test(v);
		}
	}
	if ( success )
	{
		this.element.removeClass('error');
	}
	else
	{
		this.element.addClass('error');
	}
	return success;
}

JPCombobox.prototype.items = function(values)
{
	if ( this.properties.type != 'select' ) return;
    var listInst = this.children.dropbox.instance();
	if ( arguments.length ) {
		listInst.items(values);
		return this;	
	}
	return listInst.items();
}

JPCombobox.prototype.options = function(dict)
{
	if ( this.properties.type != 'select' ) return;
    var listInst = this.children.dropbox.instance();
	if ( arguments.length ) {
		listInst.options(dict);
		return this;	
	}
	return listInst.items();
}


JPCombobox.prototype.selectedIndex = function(v,ignoreChange)
{
	if ( this.properties.type != 'select' ) return;
	var inst = this.children.dropbox.instance();
	if ( inst && inst.length() > 0 && arguments.length ) {
		this._selectedIndex = v;
		inst.selectedIndex(v);
		var item = inst.items()[v];
		this.value( item, ignoreChange);	
	}
	return this._selectedIndex;
} 

JPCombobox.prototype.selectedItemView = function()
{
	var inst = this.children.dropbox.instance();
	return inst.itemViewAt( this._selectedIndex   );
}


JPCombobox.prototype.value = function(v,ignoreChange)
{
	if ( arguments.length )
	{
		if ( this.properties.itemConverter ) {
			v = this.properties.itemConverter(v);
		}
		this.properties.value = v;
		if ( this.properties.type == 'calendar' )
		{
			if ( !v && this.properties.defaultValue == 'today' ) {
				v = new Date();
			}
			if ( v ) {
				if ( !(v instanceof Date) ) {
					v = Date.new(v);
				}
				v = v.format(this.properties.dateFormatter);
			} else {
				delete this.properties.value;
				v = undefined;
			}
		}
		else if ( this.properties.type == 'color' )
		{
			if ( $.isPlainObject(v) ) {
				v = "#%02X%02X%02X".sprintf( v.r, v.g, v.b );
			}
			this.children.arrow.css('backgroundColor', v);
		}
		if ( this.properties.editable )
		{
			if ( v && this.properties.valueKey ) {
				this.children.input.val( v[this.properties.valueKey] );
			} else {
				this.children.input.val( v );
			}
		}
		else
		{
			if ( this.properties.drawer ) {
				this.children.input.empty().append( this.properties.drawer(v) );
			}
			else if ( this.properties.template )
			{
				var itemView = this.drawTemplate(v);
				this.children.input.empty().append( itemView ); 
			}
			else if ( v !== undefined && v !== null )
			{
				var inst = this.children.dropbox.instance();
				if ( v.key && v.value ) 
				{
					this.children.input.html(v.value);
				}
				else if ( inst.properties.hasOptionViews ) 
				{
					for( var i = 0 ; i < inst._items.length; i++ ) {
						if ( inst._items[i] == v ) {
							this._selectedIndex = i;
							this.children.input.html( $(inst.children.items[i]).html() );
							break;
						}
					}
				} 
				else 
				{
					if ( v && this.properties.valueKey ) {
						this.children.input.html( v[this.properties.valueKey] );
					} else {
						this.children.input.html( v );
					}
				}
			}
		}
		if( !ignoreChange ) {
			this.element.trigger('valueChange', v);			
		}
		return;
	}
	return this.properties.value;
}

JPCombobox.prototype.setInterval = function(begin,end)
{
	var cal = this.children.dropbox.instance(); 
	cal.properties.minDate = begin ? begin : new Date(1900,0,1);
	cal.properties.maxDate = end ? end : new Date(9999,11,31);
	cal.properties.minDate.setHours(0,0,0,0);
	cal.properties.maxDate.setHours(23,59,59);
}

