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

function JPListview(element,props)
{
	if ( arguments.length == 0 ) return;
	var tmpl = $(element).find('script[type$=itemTemplate]');
	if (tmpl.length) {
		tmpl.detach();
	} else {
		tmpl = $(element).find('tbody > tr');
		if ( tmpl.length ) {
			tmpl.detach();
		}
	}
	JPView.call( this, element, $.extend(true,{
		plugin: 'detail',
		selectable: true,
		multiselect: false,
		rearrangeable: false,
		template: tmpl.length ? tmpl : null
	},props));
	this._selectedIndex = -1;
	this.element.addClass('listview');
	if ( this.properties.editable )
	{
		this.element.addClass('editable');
	}
	this._items = [];
	var header = this.element.children('.header');
	if ( header.length )
	{
		this.properties.pluginOptions = $.extend( this.properties.pluginOptions, 
			{ headerTemplate: header.children() }
		);	
		header.detach();
	}
	else 
	{
		var tmpl = $(element).find('script[type$=headerTemplate]');
		if ( tmpl.length )
		{
			this.properties.pluginOptions = $.extend( this.properties.pluginOptions, 
				{ headerTemplate: tmpl }
			);	
		}
	}

	this.properties.pluginOptions = $.extend( {}, this.properties.pluginOptions, {
		checkable : this.properties.checkable ,
		style : this.properties.style || 'div',
		rearrangeable : this.properties.rearrangeable, 
		cellPadding: this.properties.cellPadding || 0
	});
	if ( typeof this.properties.plugin == 'string' )
	{
		var plugin = $.js.plugins.listview[this.properties.plugin] ? this.properties.plugin : 'detail';
		this.properties.plugin = new $.js.plugins.listview[plugin](this,this.properties.pluginOptions);
	}
	else if (this.properties.plugin)
	{
		this.properties.plugin.init(this,this.properties.pluginOptions);
	}
	this.element.trigger('initiaized');
}

JPListview.prototype = new JPView();
$.plugin(JPListview);

JPListview.prototype.destroy = function()
{
	JPView.prototype.destroy.call(this);
	if ( this.properties.plugin.destroy )
	{
		this.properties.plugin.destroy();
	}
}

JPListview.prototype.rearrangeable = function(value)
{
	this.properties.rearrangeable = value;
	this.properties.plugin.properties.rearrangeable = value;
}

JPListview.prototype.itemViewAt = function(idx)
{
	if ( typeof idx == 'number' )
	{
		return $(this.children.items[idx]);
	}
	else
	{
		for ( var i = 0 ; i < this.children.items.length; i++ )
		{
			if ( this.chlidren.items[i].data('item') == idx ) 
			{
				return $(this.children.items[i]);
			}
		}
	}
}

JPListview.prototype._setValue = function(view,value,context)
{
	var path = $(view).data('key').split('.');
	var len = path.length - 1;
	var obj = context;
	for( var i = 0 ; i < len ; i++ )
	{
		obj = obj[path[i]];	
	}
	obj[path[len]] = value;
}

JPListview.prototype._postAddItemView = function(obj,item)
{
	var self = this;
	var idx = self._items.indexOf(item);
	obj.addClass('item').mouseclick( function(e){
		if ( e.target.nodeName == 'A' 
			|| e.target.nodeName == 'INPUT' 
			|| $(e.target).hasClass('ignore') 
			|| $(e.target).hasClass('input')
			|| $(e.target).parent().hasClass('input')   // for checkbox, radio button 
		) {
			self.element.trigger('itemFocused',[item,obj,idx]); 
			return false;
		} 
		else
		{
			var idx = self._items.indexOf(item);
			if ( self.properties.selectable )
			{
				if ( self.properties.multiselect ) {
					obj.toggleClass('selected');
				} else {
					self._selectedIndex = idx;
					self.element.find('.item.selected').removeClass('selected');
					obj.addClass('selected');
				}
			}
			self.element.trigger('itemClicked',[item,obj,idx]); 
//			$.js.popup.hide();
		}
		return false;
	}).data('item', item);

	var ctrls = obj.find('[data-plugin=JPCheckbox],[data-plugin=JPSwitch]').each(function(){
		value = $(this).text();
		$(this).empty();
		var chk = $(this)[$(this).data('plugin')]();
		chk.instance().value(value);
		$(this).addClass('field');
		chk.bind('valueChange', function(e, value){
			self.element.trigger('itemChecked', [ value, obj, item, idx ]);
		});
	});

	if ( this.properties.editable )
	{
		obj.JPForm({});
		obj.instance().value(item);
		obj.find('.input,[data-class]').bind('valueChange', function(e,v){
			var path = $(this).data('keypath');
			if ( path ) {
				obj.instance()._setValue( path, v);
				obj.instance()._dirtyCheck( path, $(this) );
			}
		});
		obj.bind('valueChanged', function(e,value,path,valid){
			self.element.trigger('itemValueChanged', [ item, value, path, valid] );
		});
		if ( this.properties.values )
		{
			for( var k in this.properties.values )
			{
				var v = obj.find('[data-key=' + k + ']');
				if ( v.length ) {
					if ( v.instance() ) {
						v.instance().value(item[k]);	
					} else {
						v.html(item[k]);
					}
				}
			}
		}
		var saveValueCallback = function(editfield) {
			var p = editfield.parent();
			p.removeClass('edit');
			var inst = editfield.instance();
			var txt = inst.value();
			if ( inst.validate ) 
			{
				!inst.validate() ?  p.addClass('error') : p.removeClass('error');
			}
			if ( inst.blur ) {
				inst.blur();
			}
			if ( !(inst instanceof JPCheckbox || inst instanceof JPSwitch) ) {
				editfield.remove();
			}
			var value = txt;
			if ( txt instanceof Date )
			{
				txt = txt.format($.consts.format.date);
				value = txt;
			}
			else if ( value && value.key && value.value )
			{
				txt = value.value;
				value = value.key
			}
			if ( !p.hasClass('error') )
			{
				var path = p.data('keypath');
				obj.instance()._setValue( path, value);
				obj.instance()._dirtyCheck( path, p);
			}
			if ( !(inst instanceof JPCheckbox || inst instanceof JPSwitch) ) {
				p.empty().text(txt || '');
			} 
			self.editfield = undefined;
			self.element.trigger('itemValueChanged', [ item, value, p.data('keypath'), !p.hasClass('error')] );
		}
		obj.find('[data-key]').click(function(e){
			var inst = $(this).instance();
			if ( inst instanceof JPCheckbox || inst instanceof JPSwitch ) {
				var p = $(this).parent();
				var path = $(this).data('keypath');
				obj.instance()._setValue( path, inst.value() );
				obj.instance()._dirtyCheck( path, p);
				return;
			}
			var col = $(this);
			var props = {};
			var data = col.data();
			for( var k in data )
			{
				if ( k.indexOf('attr') == 0 )
				{
					var name = k[4].toLowerCase() + k.substr(5);
					props[name] = data[k];
				}
			}
			var txt = col.text();
			if ( self.editfield ) 
			{
				saveValueCallback(self.editfield);
			}
			if( col.hasClass('checkbox first') )
			{
				return;
			}
			if ( col.data('class') )
			{
				if ( col.data('class') == 'JPTextfield' ) {
					props.hasClear = false;
				}
				self.editfield = $('<div/>')[col.data('class')](props);
			}
			else if ( col.data('type') == 'calendar' ) 
			{
				self.editfield = $('<div/>').JPCombobox($.extend({
					type: 'calendar'
				},props));
			}
			else if ( col.data('type') == 'select' ) 
			{
				var opts = { }
				var list = self.properties.values[ col.data('key') ];
				if ( $.isPlainObject(list) ) 
				{
					opts = {
						data: list,
						drawer: function(item,idx){
							return $('<div/>').html(item.value);
						}
					};
					txt = { key : col.data('value'), value: txt };
				}
				else if ( Array.isArray(list) ) {
					opts = list;
				}
				self.editfield = $('<div/>').JPCombobox(opts);
				self.editfield.instance().focus();
			}
			else if ( !col.data('plugin') && !col.data('readonly') )
			{
				self.editfield = $('<div/>').JPTextfield($.extend({
					hasClear: false,
					type: col.data('type')
				},props));
				self.editfield.instance().focus();
			} else {
				if ( col.data('valueType') ) {
					col.formatter();
				}
			}
			
			if ( self.editfield  ) {
				self.editfield.focusout(function(e){
					if ( col.hasClass('edit') )
					{
						saveValueCallback(col.children().eq(0));
						return false;
					}
				});
			}
			
			col.width( col.width() );
			if ( self.editfield  ) {
				self.editfield.width( col.width() ).click(function(e){
					return false;	
				}).bind('valueChange enter', function(e,v){
					if ( e.type == 'enter' ) {
						saveValueCallback(self.editfield);
					}
					return false;
				});
				inst = self.editfield.instance();
				inst.value(txt);
				col.addClass('edit').empty().append(self.editfield);
				setTimeout(function(){
					if ( self.editfield.instance().focus ) {
						self.editfield.instance().focus();	
					}
				},0);
			}
		});
	}
	else 
	{
/*
		ctrls.each(function(){
			$(this).instance().enabled(false);
		});
*/
	}

	if ( this.properties.rearrangeable 
		&& this.properties.plugin.makeDraggable )
	{
		this.properties.plugin.makeDraggable(obj);
	}
	
	obj.filter('[data-value-type]').formatter();
	obj.find('[data-value-type]').formatter();
}

JPListview.prototype.prepend = function(items)
{
	if ( !this.children.items ) this._init();
	if ( !Array.isArray(items)	)
	{
		items = [items];
	}
	var list = [];
	for ( var i = items.length - 1 ; i >=0 ;  i-- )
	{
		if ( this.properties.filter && !this.properties.filter(items[i]) )
		{
			continue;
		}
		var obj = this._drawItem(items[i],i);	
		if ( this.properties.plugin.prepend )
		{
			obj = this.properties.plugin.prepend(obj);
		}
		else
		{
			this.element.prepend(obj);
		}
		this.children.items.unshift( obj );
		this._items.unshift(items[i]);
		this._postAddItemView(obj,items[i]);
		if ( this.properties.postdraw ) {
			this.properties.postdraw( obj, items[i], i);
		}
	}
	if ( this.length() == 0 ) {
		this.element.addClass('empty');
	} else {
		this.element.removeClass('empty');
	}
}

JPListview.prototype._init = function(args)
{
	if ( this.children.items ) {
		this.children.items.forEach(function(v){
			v.unbind('click mouseclick');
			v.find('.input').unbind('valueChange enter');
		})
	}
	this.children.items = [];
	this._items = [];
	this.properties.plugin.preprocess(args);
}

JPListview.prototype.length = function()
{
	return this._items.length;
}

JPListview.prototype.optionViews = function(options)
{
	var self = this;
	options.detach();
	this.properties.hasOptionViews = true;
	this.children.items = Array.isArray(options) ? options : options.toArray();
	this._items = this.children.items.map(function(obj,idx){
		$(obj).addClass('item');
		$(obj).mouseclick(function(e){
			self.element.trigger('itemClicked',[$(obj).data('value'),$(obj),idx]); 
			$.js.popup.hide();
		});
		return $(obj).data('value');
	});
	this.element.append(options);
}


JPListview.prototype.options = function(dict)
{
	var self = this;
	this.clear();
	this.properties.hasOptionViews = true;
	this.children.items  = Object.keys(dict).map((k) => $('<div/>', {html:dict[k]}).addClass('item').data('value', k).appendTo(self.element) );
	this._items = this.children.items.map(function(obj,idx){
		$(obj).mouseclick(function(e){
			self.element.trigger('itemClicked',[$(obj).data('value'),$(obj),idx]); 
			$.js.popup.hide();
		});
		return $(obj).data('value');
	});
}

JPListview.prototype.append = function(items)
{
	if ( !this.children.items ) this._init();
	if ( !Array.isArray(items)	)
	{
		items = [items];
	}
	var sIdx = this._items.length;
	for ( var i = 0 ; i < items.length; i++ )
	{
		if ( this.properties.filter && !this.properties.filter(items[i]) )
		{
			continue;
		}
		var obj = this._drawItem(items[i],sIdx+i);	
		if ( this.properties.plugin.append )
		{
			obj = this.properties.plugin.append(obj);
		}
		else
		{
			this.element.append(obj);
		}
		this.children.items.push(obj);
		this._items.push(items[i]);
		this._postAddItemView(obj,items[i]);
		if ( this.properties.postdraw ) {
			this.properties.postdraw( obj, items[i], i);
		}
	}
	if ( this.length() == 0 ) {
		this.element.addClass('empty');
	} else {
		this.element.removeClass('empty');
	}
}

JPListview.prototype.insertAt = function(index,item)
{
	if ( !this.children.items ) {
		this._init();
	}
	if ( this.children.items.length == 0 ) {
		this.append(item);
		return;
	}
	else if (index == 0 ) {
		this.prepend(item);
		return;
	}
	
	this._items.splice(index, 0, item);				
	var target = this.children.items[index-1];
	var rowView = this._drawItem(item,index);
	if ( this.properties.plugin.insertAt )
	{
		rowView = this.properties.plugin.insertAt(index,rowView,target);
	}
	else
	{
		rowView.insertAfter(target);
	}
	this.children.items.splice(index,0,rowView);
	this._postAddItemView(rowView,item);
	if ( this.properties.postdraw ) {
		this.properties.postdraw( rowView, item, index);
	}
}

JPListview.prototype.removeAt = function(index)
{
	var obj = this.children.items[index];
	if ( obj ) {
		obj.unbind('click mouseclick');
		obj.find('.input').unbind('valueChange enter');
	}
	if ( this.properties.plugin.removeAt )
	{
		this.properties.plugin.removeAt(index,obj);
	}
	else
	{
		obj.remove();
	}
	this._items.splice(index, 1);
	this.children.items.splice(index, 1);
}

JPListview.prototype.reloadAt = function(index, value)
{
	if ( index < 0 || index >= this.children.items.length ) return;
	var target = this.children.items[index];
	if ( !target ) return; 
	var isSelected = target.hasClass('selected');
	if ( value !== undefined ) {
		this._items[index] = value;
	}
	var obj = this._drawItem(this._items[index],index);
	if ( this.properties.plugin.reloadAt )
	{
		obj = this.properties.plugin.reloadAt(index,obj,target);
	}
	else
	{
		target.replaceWith(obj);
	}
	this.children.items[index] = obj;
	this._postAddItemView(obj,this._items[index]);
	if ( this.properties.postdraw ) {
		this.properties.postdraw( obj, this._items[index], index);
	}
	if ( isSelected ) {
		obj.addClass('selected');
	}
	return obj;
}

JPListview.prototype.reloadOf = function(item)
{
	if ( !this._items || this._items.length == 0 ) {
		return -1;
	}
	var idx = -1;
	if ( typeof item == 'function' ) {
		for ( var i = 0 ; i < this._items.length; i++ ) {
			if ( item( this._items[i] ) ) {
				idx = i;
				break;
			}
		}
	} else {
		idx = this._items.indexOf(item);
	}
	if ( idx != -1 ) {
		this.reloadAt(idx);
	}
	return idx;
}

JPListview.prototype.reloadSelectedItem = function()
{
	var obj = this.reloadAt( this._selectedIndex );
	if ( obj ) {
		obj.addClass('selected');
	}
	return obj;
}

JPListview.prototype.remove = function(item)
{
	var idx = -1;
	if ( typeof item == 'function' )
	{
		for( var i = 0 ; i < this._items.length; i++ )
		{
			if ( item(this._items[i]) )
			{
				idx = i;
				break;
			}
		}
	}	
	else
	{
		idx = this._items.indexOf(item);
	}
	if ( idx != -1 )
	{
		if ( this._selectedIndex == idx ) {
			this._selectedIndex = -1;
		}
		this.removeAt(idx);
	}
	if ( this.length() == 0 ) {
		this.element.addClass('empty');
	}
	return idx;
}

JPListview.prototype._drawItem = function(item, index)
{
	var view;
	if ( this.properties.drawer )
	{
		view = this.properties.drawer(item,index);
	}
	else
	{
		view = this.drawTemplate( item, index );
	}
	return view;
}

JPListview.prototype.length = function()
{
	return this._items ? this._items.length : 0;
}

JPListview.prototype.items = function(values, args)
{
	if ( arguments.length )
	{
		this._selectedIndex = -1;
		if ( $.isPlainObject(values) ) 
		{
			values = Object.keys(values).map(function(k){
				return {
					key: k,
				   	value: values[k]
				}
			});				
		}
		if ( this._items && this._items.length > 0  ) {
			this.clear();
		}
		if ( values && values.length > 0 ) {
			this._init(args);
			this.append(values);
			this.properties.plugin.postprocess(args);
			this.element.removeClass('empty');
		}
		else if ( values ) {
			this._items = values;
			this.element.addClass('empty');
		} 
		else {
			this.element.addClass('empty');
		}
		return;
	}
	return this._items || null;
}

JPListview.prototype.values = function(values, args)
{
	return this.items(values,args);
}

JPListview.prototype.refresh = function(args)
{
	if ( this._items && this._items.length > 0  )
	{
		var list = this._items;
		this.clear();
		this._init(args);
		this.append(list);
		this.properties.plugin.postprocess(args);
	}
}


JPListview.prototype.clear = function() {
	if (this.children.items )
	{
		this.children.items.forEach( function(v){
			$(v).unbind('click mouseclick');
			$(v).find('.input').unbind('valueChange enter');
			$(v).remove();
		});
		delete this.children.items;
	}
	delete this._items;
	if ( !this.properties.plugin.clear() ) {
		this.element.empty();
	}
	this.element.addClass('empty');
}

JPListview.prototype.checkItem = function(idx, value)
{
	this.properties.plugin.checkItem(idx, value);
}

JPListview.prototype.findCheckedItems = function()
{
	return this.properties.plugin.findCheckedItems();
}

JPListview.prototype.findDirtyItems = function()
{
	return this.element.find('.item.dirty').map(function(){
		return $(this).data('item');
	}).toArray();
}

JPListview.prototype.checkItems = function(list,cb)
{
	if( cb ) {
		for ( var i = 0 ; i < list.length; i++ ) {
			var idx = -1;
			for ( var j = 0 ; j < this._items.length; j++ ) {
				if ( cb( list[i], this._items[j]) ) {
					idx = j;
					break;
				}
			}
			if ( idx >= 0 ) {
				this.children.items[idx].find('input[type=checkbox]').prop('checked', true);
				this.children.items[idx].find('.jpview.checkbox').instance().checked(true);
			}
		}
	} else {
		for ( var i = 0 ; i < list.length; i++ ) {
			var idx = this._items.indexOf(list[i]);
			if ( idx >= 0 ) {
				this.children.items[idx].find('input[type=checkbox]').prop('checked', true);
				this.children.items[idx].find('.jpview.checkbox').instance().checked(true);
			}
		}
	}
}

JPListview.prototype.checkItemAt = function(idx)
{
	this.children.items[idx].find('input[type=checkbox]').prop('checked', true);
	this.children.items[idx].find('.jpview.checkbox').instance().checked(true);
}

JPListview.prototype.toggleCheckItemAt = function(idx)
{
	var chks = this.children.items[idx].find('input[type=checkbox]');
	if ( chks.length > 0 ) {
		chks.prop('checked', !chk.prop('checked'));
	}
	chks = this.children.items[idx].find('.jpview.checkbox');
	if ( chks.length == 1 ) {
		chks.instance().checked( !chks.instance().checked()   );
	}
}


JPListview.prototype.uncheckItems = function()
{
	if ( this.children.items ) {
		this.children.items.forEach( (v) => {
			v.find('input[type=checkbox]').prop('checked', false);
			v.find('.jpview.checkbox').instance().checked(false);
		});
	}
}


JPListview.prototype.removeItems = function(values)
{
	if ( !values ) return;
	for( var i = 0 ; i < values.length; i++ )
	{
		this.remove(values[i]);
	}
}

JPListview.prototype.containItem = function(cb)
{
	for ( var i = 0; i < this._items.length; i++ )
	{
		if ( cb(this._items[i]) ) return true;
	}
	return false;
}

JPListview.prototype.indexOf = function(item, idx)
{
	if ( !this._items || this._items.length == 0 ) return -1;
	idx = idx || 0;
	if ( typeof item == 'function' ) {
		for ( var i = idx ; i < this._items.length; i++ ) {
			if ( item( this._items[i] ) ) {
				return i;
			}
		}
		return -1;
	}
	return this._items.indexOf(item);
}

JPListview.prototype.findItems = function(cb)
{
	return this._items ? this._items.filter(cb) : undefined;
}

JPListview.prototype.filterDirtyItems = function(callback)
{
	var cnt = 0;
	if ( this.properties.editable ) 
	{
		this.children.items.forEach(function(v,idx){
			if ( $(v).hasClass('dirty') )
			{
				cnt++;
				var inst = $(v).instance();
				callback(inst.value(),inst.revertValue(),$(v),idx);
			}
		});
	}
	return cnt;
}

JPListview.prototype.selectedItems = function()
{
	return this.element.find('.item.selected').data('item').toArray();
}

JPListview.prototype.selectedItem = function(item)
{
	if ( arguments.length )
	{
		if ( !this.properties.multiselect )
		{
			this.element.find('.item.selected').removeClass('selected');
		}
		var i = 0;
		if ( item ) {
			for ( i = 0; i < this._items.length; i++ )
			{
				if( typeof item == 'function' && item(this._items[i]) ) {
					this.children.items[i].toggleClass('selected');
					this._selectedIndex = i;
					break;
				} else if ( item == this._items[i] ) {
					this.children.items[i].toggleClass('selected');
					this._selectedIndex = i;
					break;
				}
			}
		} else {
			i = this._items.length;
		}
		if ( i >= this._items.length || !this.children.items[i].hasClass('selected') ) {
			this._selectedIndex = -1;
		} 
		return;
	}
	return this._selectedIndex >= 0 ? this._items[this._selectedIndex] : undefined;
}

JPListview.prototype.selectedItemAt = function(idx)
{
	if ( !this.properties.multiselect )
	{
		this.element.find('.item.selected').removeClass('selected');
	}
	if ( idx == -1 ) {
		if ( this._selectedIndex != -1 ) {
			$(this.children.items[this._selectedIndex]).removeClass('selected');
		}
		this._selectedIndex = -1;
		return undefined;
	} else {
		$(this.children.items[idx]).addClass('selected');
		this._selectedIndex = idx;
		return this.children.items[idx];
	}
}

JPListview.prototype.removeSelectedItem = function()
{
	if ( this.properties.multiselect ) {
		var items = this.element.find('.item.selected').data('item');
		for ( var i = 0 ; i < items.length; i++ ) {
			this.remove(items[i]);
		}	
	} else {
		if ( this._selectedIndex >= 0 ) {
			this.element.find('.item.selected').removeClass('selected');
			this.removeAt( this._selectedIndex);
			this._selectedIndex = -1;
		}		
	}
}

JPListview.prototype.unselectItem = function()
{
	this.element.find('.item.selected').removeClass('selected');
	this._selectedIndex = -1
}

JPListview.prototype.selectedIndex = function(idx)
{
	if ( arguments.length ) {
		this.selectedItemAt(idx)
		return;
	}
	return this._selectedIndex;
}

JPListview.prototype.filter = function(cb)
{
	if ( this.children.items ) {
		for( var i = 0 ; i < this.children.items.length ; i++ ) {
			if ( cb(this._items[i]) ) {
				this.children.items[i].removeClass('hidden');
			} else {
				this.children.items[i].addClass('hidden');
			}		
		}
	}
}

JPListview.prototype.findViews = function(cb)
{
	var viewList = [];
	if ( this.children.items ) {
		for( var i = 0 ; i < this.children.items.length ; i++ ) {
			if ( cb(this._items[i]) ) {
				viewList.push(this.children.items[i]);
			}		
		}
	}
	return viewList;
}
