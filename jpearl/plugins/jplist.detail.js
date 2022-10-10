(function($){

$.js.plugins.listview.detail = function(listview,props)
{
	this.init(listview,props);
}

var cls = $.js.plugins.listview.detail;

cls.prototype.init = function(listview,props)
{
	this.listview = listview;	
	this.listview.element.addClass('detail').css({
		position: 'relative'
	});
	if ( this.listview.element.get(0).nodeName == 'TABLE') {
		props.style = 'auto';
	}
	this.properties = $.extend(true,{
		style: 'div',
		cellPadding: 0,
		resizable: this.listview.properties.resizable,
		editable: this.listview.properties.editable,
		sortable: this.listview.properties.sortable,
		divider: this.listview.properties.divider
	},props);
	this.children = {};

	var self = this;
	if ( this.properties.headerTemplate )
	{
		if ( typeof this.properties.headerTemplate  == 'string'
		|| ( !Array.isArray( this.properties.headerTemplate )  
		 && this.properties.headerTemplate.get(0).nodeName == 'SCRIPT') )
		{
			this.properties.headerTemplate = new JPTemplate(this.properties.headerTemplate);
		}
	}

	if (this.properties.resizable)
	{
		NotificationCenter.addObserver( this, 'WindowResized', function(e){
			self._locateSeparators();
		});
	}
}

cls.prototype.destroy = function(listview,props)
{
	NotificationCenter.removeObserver( this );
}

cls.prototype.clear = function(args)
{
	delete this._header;		
	if ( this.properties.style != 'auto' ) {
		if ( this.children.list )
		{
			this.children.list.empty();
			delete this.children.list;
		}
		if ( this.children.header ) 
		{
			this.children.header.empty();
			delete this.children.header;
		}
		if ( this.children.body ) {
			this.children.body.empty();
		}
	} else {
		if ( this.children.list )
		{
			this.children.list.empty();
		}
		return true;
	}
}

cls.prototype.preprocess = function(args)
{
	var self = this;
	switch( this.properties.style )
	{
		case 'table':
			var colgrp = this.listview.element.find('colgroup').detach();
			this.children.body = $('<table/>', {
				cellPadding: this.properties.cellPadding,
				cellSpacing: 0
			}).css({
				borderCollapse: 'separate'
			}); // .width('100%');
			if( colgrp.length ) {
				this.children.body.append(colgrp);
			}
			this.children.header = $('<thead/>').addClass('header').appendTo(this.children.body);
			this.children.list = $('<tbody/>').addClass('listbody').appendTo(this.children.body);
			this.children.body.appendTo(this.listview.element);
			break; 
		case 'auto':
			this.children.body = this.listview.element;
			this.children.body.attr({
				cellPadding: this.properties.cellPadding,
				cellSpacing: 0
			}).css({
				borderCollapse: 'separate'	
			})
			this.children.header = this.children.body.children('thead').addClass('header');
			this.children.list = this.children.body.children('tbody').addClass('list');
			break;
		default:
			this.children.body = $('<div/>').css({
				display: 'table',
				boxSizing: 'border-box',
//				tableLayout: 'fixed',
				borderCollapse: 'collapse',
				borderSpacing: 0
			}); //.width('100%');
			this.children.header = $('<header/>').addClass('header').appendTo(this.children.body);
			this.children.list = $('<section/>').addClass('listbody').appendTo(this.children.body);
			this.children.body.appendTo(this.listview.element);
			break;
		
	}

	var row = null;
	if ( this.properties.style != 'auto' && this.properties.headerTemplate ) 
	{
		var obj = null;
		if ( Array.isArray(this.properties.headerTemplate ) )
		{
			var list = this.properties.headerTemplate;
			obj = [];
			var c = null;
			switch( this.properties.style)
			{
				case 'table':
					c = '<th/>';
					break;
				case 'div':
					c = '<div/>';
					break;
			}
			for ( var i = 0 ; i < list.length; i++ )
			{
				obj.push( $(c).html( list[i] ) );
			}
		}
		else if ( typeof this.properties.headerTemplate == 'function' )
		{
			var func = this.properties.headerTemplate;
			var list = func;
			obj = [];
			var c = null;
			switch( this.properties.style)
			{
				case 'table':
					c = '<th/>';
					break;
				case 'div':
					c = '<div/>';
					break;
			}
			var i = 0;
			var item;
			while( item = func($(c), i++) )
			{
				obj.push( item );
			}
		}
		else if ( this.properties.headerTemplate instanceof JPTemplate )
		{
			obj = this.properties.headerTemplate.apply();
		}
		else 
		{
			obj = this.properties.headerTemplate.clone();
		}
		row = this._wrapRow(obj, true);
		row.addClass('header');
		this.children.header.append( row );
		this._header = row;
	} else if ( this.properties.style == 'auto' ){
		this._header = this.children.header;
		if ( this._header.find('.checkbox').length == 0 ) {
			this._wrapRow(this._header, true);
		} else {
			this._header.find('input[type=checkbox]').prop('checked', false);
		}
		row = this._header.children('tr');
	} 
	if ( row && row.find('[data-sort-field] .sort').length == 0  ) {
		row.find('[data-sort-field]')
		.addClass('sortable')
		.append($('<span/>').addClass('sort'))
		.click(function(e){
			var field = $(this).data('sortField');
			if ( self._lastSortField != field )
			{
				row.find('.sort').removeClass('descend ascend');
			}
			var sort = $(this).find('.sort');
			var dir = 0;
			if ( sort.hasClass('descend') )
			{
				sort.removeClass('descend');		
				dir = 0;
			}
			else if ( sort.hasClass('ascend') )
			{
				sort.removeClass('ascend');
				sort.addClass('descend');
				dir = -1;
			}
			else
			{
				sort.addClass('ascend');
				dir = 1;
			}
			self._lastSortField = field;
			if (self.properties.resizable)
			{
				self._locateSeparators();
			}
			self.listview.element.trigger('sort', [field, dir]);
		});
	}
	if ( args )
	{
		if ( args.sortField && args.sortDir != 0 )
		{
			self._lastSortField = args.sortField;
			row.find('[data-sort-field=' + args.sortField + '] .sort')
				.addClass( args.sortDir == 1 ? 'ascend' : 'descend' );
		}
	}
	
	$('.checkbox, input[type=checkbox]', this._header).click(function(){
		var checked = false;
		$(this).removeClass('halfchecked');
		if ( this.nodeName == 'INPUT' ) {
			checked = $(this).prop('checked');
		} else {
			checked = $(this).instance().selected() ? true : false;
		}
		self.children.body.find('.item input[type=checkbox]').prop(checked);
		self.children.body.find('.item .jpview.checkbox').each( (idx, obj) => {
			$(obj).instance().checked(checked);
		});
	});
	
	return row;
}

cls.prototype.findCheckedItems = function()
{
	if ( !this.children.body ) {
		return [];
	}
	var chklist = this.children.body.find('.item .jpview.checkbox');
	var list;
	if ( chklist.length > 0 ) {
		list = chklist.filter( (idx,v) => $(v).hasClass('selected')  ).parents('.item');
	} else {
		list = this.children.body.find('.item input[type=checkbox]:checked').parents('.item');
	}
	return $.map( list, (obj,index) => $(obj).data('item') );
}

cls.prototype.checkItem = function(idx, value)
{
	var chklist = this.children.body.find('.item .jpview.checkbox');
	if ( chklist.length > 0 ) {
		chklist.eq(idx).instance().checked(value);
	} else {
		chklist = this.children.body.find('.item input[type=checkbox]:checked');
		chklist.eq(idx).prop('checked', value);
	}
}

cls.prototype._locateSeparators = function(sep,idx)
{
	var self = this;
	if ( !this._columns ) return;
	var h = this.listview.element.height();
	idx = idx || 0;
	var off;
	this._columns.each( function(i,v){
		if ( !off )
		{
			off = $(v).position(); 
		}
		self._separators[i].css({
			left: off.left + $(v).outerWidth(true),
		}).height(h);
		off.left += $(v).outerWidth(true);
	});
	if ( idx == this._columns.length - 1 )
	{
		var pos = self._separators[this._columns.length-1].position();
		this.listview.element.outerWidth( pos.left );
	}
}

cls.prototype.removeItems = function()
{
	this.children.list.find('.item').remove();
}


cls.prototype.postprocess = function(args)
{
	var row = this._header;
	if( row == null && this.listview.children.items.length == 0 )
	{
		return;
	}
	else if ( row == null)
	{
		row = this.listview.children.items[0];
	}
	var self = this;
	if (this.properties.resizable)
	{
		this.listview.element.find('.separator').remove();
		var h = this.listview.element.height();
		this._columns = cols = row.children();
		this._separators = [];
		for ( var i = 0 ; i < cols.length; i++ )
		{
			var sep = $('<div/>').addClass('separator')
					.height(h).appendTo( self.listview.element )
					.bind('dragStart', function(){
					}).bind('dragging', i, function(e, ptr, delta, position){
					/*
						var v = $(this).data('column');
						var origW = v.width();
						var w = $(this).position().left;
						if ( e.data )
						{
							w -= self._separators[e.data-1].position().left;
						}
						v.outerWidth(w);
						if ( e.data != cols.length - 1 )
						{
							var c = self._columns.eq( e.data + 1);
							c.width( '-=' + delta.x );
						}
						else 
						{
							self.listview.element.outerWidth( w );
						}
						self._locateSeparators($(this), e.data); */
					}).bind('dragDone', i, function(e, ptr, delta, position,edelta) {
						var v = $(this).data('column');
						var origW = v.outerWidth(true);
						var w = position.left - v.position().left;
						var offsetW = w - origW;
						v.outerWidth(w);
						if ( e.data != cols.length - 1 )
						{
							var c = self._columns.eq( e.data + 1);
							c.outerWidth( '+=' + -offsetW );
						}
						else 
						{
							self.listview.element.width( 
								position.left
							);
						}
						self._locateSeparators($(this), e.data);
					}).data('column', this._columns.eq(i) )
/*
					.dblclick(i+1, function(e){
						var cols = self.children.body.find('.row > *:nth-child(' + e.data +')');
						for( var i = 0 ; i < cols.length; i++ )
						{
							console.log( cols.eq(i).width() );
						}
					});
*/
			sep.dragging = new JPDrag(sep,{ 
				copy: true,
				verticalEnabled: false, cursor: 'ew-size' 
			});
			this._separators.push(sep);
		}
		this._locateSeparators();
	}
	
	
	var headerChk = $('.checkbox', this._header).instance();
	if ( headerChk ) {
		$('.jpview.checkbox', this.children.list).bind('valueChange', function(e, value){
			if ( headerChk.checked() ) {
				var numChecked =  $('.checkbox.selected',self.children.list).length;
				var total = self.children.list.children().length;
				if ( numChecked == 0 ) {
					headerChk.checked(false);
				} else if ( numChecked == total ) {
					headerChk.checked(true);
				} else {
					headerChk.halfChecked(true);
				}
			}
		})
	}

}

cls.prototype._wrapRow = function(obj, header)
{
	var row;
	var chkContainer = undefined;
	if ( this.properties.checkable )
	{
		var chkbox = $('<input/>', { type: 'checkbox'} ).addClass('notfield');
		switch( this.properties.style)
		{
			case 'auto':
			case 'table':
				chkContainer = header ? $('<th/>') : $('<td/>');
				break;
			case 'div':
				chkContainer = $('<div/>');
				break;
		}
		chkContainer.append(chkbox).addClass('checkbox');
		var self = this;
		chkContainer.click( function(e){
			var val = $(this).find('input[type=checkbox]').prop('checked');
			if ( header ) {
				self.children.body.find('.item .checkbox input[type=checkbox]').prop('checked', val);
			}
		});
	}
	switch( this.properties.style)
	{
		case 'auto':
		case 'table':
			if ( obj.length ) {
				switch( obj.eq(0).get(0).nodeName ) {
					case 'TD':
						row = $('<tr/>');		
						break;
					case 'THEAD':
						row = obj.children('tr');
						break;
					default:
						row = obj;
						break;
				}
			} else {
				row = obj;
			}
			break;
		case 'div':
			row = $('<div/>').css({
			});
			if ( Array.isArray(obj) )
			{
				obj[0].addClass('first');
				obj[obj.length-1].addClass('last');
			}
			else
			{
				obj.eq(0).addClass('first');
				obj.eq( obj.length-1 ).addClass('last');
			}
			break;
	}
	if ( chkContainer ) {
		if ( row == obj  ) {
			if ( obj.length > 1) {
				chkContainer.attr( { 
					rowspan: obj.length ,
					valign: 'top'
				});
				obj.eq(0).append(chkContainer);
			}
		} else if ( obj.get(0).nodeName == 'THEAD' ) {
			row.prepend(chkContainer);
		} else {
			row.append(chkContainer);
		}
	}
	if ( row != obj  ) {
		if ( obj.get(0).nodeName != 'THEAD') {
			row.append(obj).addClass('row');
		}
	}
	
	return row;
}

cls.prototype.drawDivider = function()
{
	$('<div/>').addClass('divider').appendTo(this.children.body);	
}

cls.prototype.append = function(obj)
{
	var row = this._wrapRow(obj);
	this.children.list.append( row );
	if ( this.properties.divider )
	{
		this.drawDivider();
	}
	return row;
}

cls.prototype.prepend = function(obj)
{
	var row = this._wrapRow(obj);
	this.children.list.prepend( row );
	if ( this.properties.divider )
	{
		this.drawDivider();
	}
	return row;
}

cls.prototype.insertAt = function(index,obj,target)
{
	var row = this._wrapRow(obj);
	row.insertAfter(target);
	return row;
}

cls.prototype.reloadAt = function(index,obj,target)
{
	var row = this._wrapRow(obj);
	target.replaceWith(row);
	return row;
}

cls.prototype.makeDraggable = function(view)
{
	var self = this;
	if ( view.hasClass('notdraggable') ) {
		retur;
	}
	var drag = new JPDrag(view, {
		horizontalEnabled: false,
		copy: 'true'
	});
	view.data('dragInstance', drag);
	view.bind('dragStart', function(e,p,target){
		view.width( view.width() ).height( view.height() );
        if ( view.children.hide ) {
            view.children.hide();
        }
		target.css({
			display: view.css('display') || 'block',
			zIndex: 1,
			width: view.width(),
			border: '0px solid transparent'
		});
		view.addClass('dragging');
	}).bind('dragging', function(e, ptr, delta, position ){
		if ( !self.properties.rearrangeable ) return;
		var loc = position.top;
		if ( delta.top > 0 )
		{
			var pos, t, i;
			var pos = view.position();
			pos.bottom = pos.top + view.outerHeight();
			pos.top += view.height()/3;
			if ( pos.top < loc && loc < pos.bottom )
			{   
				pos.top = loc + view.height();
				for( i = 0 ; i < self.listview._items.length; i++ )
				{   
					t = self.listview.children.items[i];
					if ( view == t ) continue;         
					var p = t.position();               
					p.bottom = p.top + t.outerHeight(); 
					if ( p.top <= pos.top && pos.top <= p.bottom  )
					{   
						view.insertAfter( t );
						break;
					}
				}
			}
		}
		else if ( delta.top < 0 )
		{
			for( var i = 0 ; i < self.listview._items.length; i++ )
			{
				t = self.listview.children.items[i];
				if ( !t || view == t ) continue;
				var pos = t.position();
				pos.bottom = pos.top + t.outerHeight()/3 * 2;
				if ( pos.top < loc && loc < pos.bottom )
				{
					view.insertBefore(t);
					break;
				}
			}
		}
		return false;
	}).bind('dragDone', function(e){
		if ( !self.properties.rearrangeable ) return;
        if ( view.children.show ) {
            view.children.show();
        }
		view.removeClass('dragging');
		self.listview.children.items = self.listview.children.items.sort(function(v1,v2){
			return v1.position().top - v2.position().top;
		});
		self.listview._items = self.listview.children.items.map(function(v){
			return v.data('item');
		});
		self.listview.element.trigger('reordered');
		return false;
	});
}

})(jQuery);
