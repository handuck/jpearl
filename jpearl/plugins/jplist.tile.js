(function($){

$.js.plugins.listview.tile = function(listview,props)
{
	this.init(listview,props);
}

var cls = $.js.plugins.listview.tile;

cls.prototype.init = function(listview,props)
{
	this.listview = listview;	
	this.listview.element.addClass('tile').css({
		position: 'relative'
	});
	this.properties = $.extend(true,{
	},props);
	this.children = {};
}

cls.prototype.destroy = function(listview,props)
{
	NotificationCenter.removeObserver( this );
}

cls.prototype.clear = function(args)
{
	if ( this.children.body )
	{
		this.children.body.empty();
		delete this.children.body;
	}
}

cls.prototype.preprocess = function(args)
{
	this.children.body = $('<div/>').css({
		borderCollapse: 'separate',
		borderSpacing: 0
	}).addClass('box').width('100%').appendTo(this.listview.element);
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

cls.prototype.removeItems = function()
{
	this.children.body.find('.item').remove();
}


cls.prototype.postprocess = function(args)
{

}

cls.prototype.append = function(obj)
{
	if ( this.children.body == null )
	{
		this.preprocess();
	}
	this.children.body.append( obj );
	return obj;
}

cls.prototype.prepend = function(obj)
{
	if ( this.children.body == null )
	{
		this.preprocess();
	}
	this.children.body.prepend( obj );
	return obj;
}

cls.prototype.insertAt = function(index,obj,target)
{
	this.children.body.insertBefore(target, obj);
	return row;
}

cls.prototype.makeDraggable = function(view)
{
	var self = this;
	if ( view.hasClass('notdraggable') ) {
		retur;
	}
	var drag = new JPDrag(view, {
		copy: true
	});
	view.data('dragInstance', drag);
	view.bind('dragStart', function(e,p,target){
		view.width( view.width() ).height( view.height() ); 
		view.css({ visibility: 'hidden' });
		target.css({
			display: view.css('display') || 'block',
			zIndex: 1,
			width: view.width(),
			border: '0px solid transparent'
		});
		view.addClass('dragging');
	}).bind('dragging', function(e, ptr, delta, position ){
		if ( !self.properties.rearrangeable ) return;
		return false;
	}).bind('dragDone', function(e){
		if ( !self.properties.rearrangeable ) return;
		view.css({ visibility: '' });
		var rect = new Rectangle();
		rect.set( drag.target );
		var area = rect.area;
		var prect = new Rectangle();
		var items = self.listview.children.items.filter(function(t,idx){
			if ( t == view ) return false;
			prect.set(t);	
			var inter = rect.intersect(prect);
			if ( inter != Rectangle.Zero ) {
				t._area = inter.area;
				return inter.area/area > 0.33;
			}	
			return false;
		});
		if ( items.length ) {
			var t;
			if ( items.length > 1 ) {
				t = items.sort( function(a, b) {
					return a._area - b._area;
				})[0];	
			} else {
				t = items[0];
			}
			var pos = t.position();
			var p = view.position();
			if ( pos.left < p.left || pos.top < p.top ) {
				view.insertBefore( t );
			} else {
				view.insertAfter( t );
			}
			items.forEach(function(v){
				delete v._area;
			});
		}
		view.removeClass('dragging');
		self.listview.children.items = self.listview.children.items.sort(function(v1,v2){
			var pos1 = v1.position();
			var pos2 = v2.position();
			if ( pos1.top < pos2.top ) return -1;
			else if ( pos1.top == pos2.top ) {
				return pos1.left - pos2.left;
			}
			return 1;
		});
		self.listview._items = self.listview.children.items.map(function(v){
			return v.data('item');
		});
		self.listview.element.trigger('reordered');
		return false;
	});
}


})(jQuery);
