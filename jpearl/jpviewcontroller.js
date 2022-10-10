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

function JPViewController(element,props)
{
	if ( !arguments.length ) return;
	JPView.call(this, element, $.extend(true,{
		cache: false
	},props));
	this.element.addClass('viewcontroller');
	this._loadStatus = JPViewController.loadStatus.NotLoaded;
	this._parentViewController = undefined;
	this._path = {};
	this._subViewControllers = {};
	this.messageCallback = {};
	this.initialize();
	this._dialogs = {};
}

$.plugin(JPViewController);

JPViewController.prototype = new JPView();

JPViewController.loadStatus = {
	Error: -1,
	NotLoaded: 0,
	Loading: 1,
	Loaded: 2
};

JPViewController.errorPages = {
		
}

Object.freeze(JPViewController.loadStatus);

JPViewController.prototype.parentViewController = function()
{
	if ( arguments.length )
	{
		this._parentViewController = arguments[0];
		return;
	}
	return this._parentViewController;
}

JPViewController.prototype.initialize = function()
{
	var self = this;
	if ( this._loadStatus == JPViewController.loadStatus.Loaded )
	{
		this.viewUnload();
	}
	this._path = {};
	this._subViewControllers = {};
	this.messageCallback = {};
	switch( this._loadStatus )
	{
		case JPViewController.loadStatus.Error:
			break;
		case JPViewController.loadStatus.NotLoaded:
			this._loadStatus = 1;
			if ( this.properties.url )
			{
				this.request({
					url: this.properties.url, 
					type: 'GET',
					cache: this.properties.cache || false,
					data: this.properties.data, 
					dataType: 'html',
					headers: {
						"X-JP-TYPE": "viewcontroller"
					}
				}, function(err,html){
					if ( err ) 
					{
						self.viewError(err);
					}
					else 
					{
						self._loadStatus = JPViewController.loadStatus.Loaded;
						if ( $.url ) {
							self.urlParams = $.extend({},$.url.params);
						}
						self.element.html(html);
						self.element.find('[data-action]').PageAction();
						var constraints = self.element.find('[data-constraints-top],[data-constraints-bottom],[data-constraints-left],[data-constraints-right]');
						if ( constraints.length ) {
							NotificationCenter.addObserver(self,'WindowResized', function(){
								self._applyConstratins(constraints);
							});
							setTimeout(function(){
								self._applyConstratins(constraints);
							},0);
						}
						self.viewDidLoaded();
					}
				});
			}
			else
			{
				self._loadStatus = JPViewController.loadStatus.Loaded;
				self.viewDidLoaded();
			}
			break;
		case JPViewController.loadStatus.Loading:
			break;
		case JPViewController.loadStatus.Loaded:
			this.viewWillAppear(this.properties.animated);
			break;
	}
}


JPViewController.prototype._applyConstratins =  function(list)
{
	for( var i = 0 ; i < list.length; i++ ) {
		var view = $(list[i]);
		var top = view.data('constraintsTop');
		var bottom = view.data('constraintsBottom');
		if ( bottom.startsWith('height') ) {
			var bitems = bottom.split(/\s+/);
			var titems = top.split(/\s+/);
			if ( bitems[0] == 'height' ) {
				var h = 0;
				if ( titems[1] == 'before' ) {
					var prev = view.prev();
					var  y = prev.offset().top + prev.height();
					if ( bitems[1] == 'window' ) {
						h = window.innerHeight - y;
					} else if ( bitems[1].mathc('/\d+px/') ) {
						h = window.innerHeight - parseInt(bitems[i]);
					} else if ( bitems[1].mathc('/[\d\.]+%/') ) {
						h = window.innerHeight - parseFloat(bitems[i])/100.0 * window.innerHeight;
					}
				} else if ( titems[1] == 'window' ) {
					
				} else {
					
				}
				view.height(h);
			}
		}
	}
}

JPViewController.prototype.id = function()
{
	return this.body ? this.body.attr('id') : undefined;
}

JPViewController.prototype.url = function(v, parentVCtrl, forcefullly)
{
	if ( this.properties.url != v  || forcefullly ) 
	{
		this.parentViewCtrl = parentVCtrl;
		this.properties.url = v;
		this.initialize();
		return;
	}
	return this.properties.url;
}

JPViewController.prototype.viewUnload = function()
{
	if ( this._loadStatus == JPViewController.loadStatus.NotLoaded ) {
		return;
	}
	this.element.find('.viewcontroller').each(function(){
		$(this).instance().viewUnload();
	});
	this.destroy();
	NotificationCenter.removeObserver(this);
	NotificationCenter.removeObserver(this.body);
	this.body.trigger('viewUnloaded',[this]);
	this.element.empty();
	this.abort();
	this._loadStatus = JPViewController.loadStatus.NotLoaded;
	for ( var key in this._dialogs ) {
		if ( this._dialogs[key].instance ) {
			this._dialogs[key].instance.destroy();
		}
	}
	this._dialogs = {};
}

JPViewController.prototype.viewError = function(xhr)
{
	var self = this;
	this._loadStatus = JPViewController.loadStatus.NotLoaded;
	var page = JPViewController.errorPages[xhr.status];
	if ( page ) {
		this.request({
			url: page, 
			type: 'GET',
			dataType: 'html',
		}, function(err,html){
			self.element.html(html);
		});
	} else {
		this.element.html('Error occured: ' + xhr.status);
	}
}

JPViewController.prototype.viewDidLoaded = function()
{
	var self = this;
	this.body = this.element.children('div,section,article,nav,p,center').eq(0);
	if ( this.body.length == 0 ) return; 
	this.body.bind('viewLoaded',function(e){
		e.stopPropagation();
	});
	this.body.bind('viewUnloaded',function(e){
		e.stopPropagation();
	});
	this.body.bind('viewWillAppear',function(e){
		e.stopPropagation();
	});
	this.body.bind('viewDidAppear',function(e){
		e.stopPropagation();
	});
	this.body.bind('viewWillDisappear',function(e){
		e.stopPropagation();
	});
	this.body.bind('viewDidDisappear',function(e){
		e.stopPropagation();
	});
	var subVctrlsRemainCnt = 0;
	var subVctrls = [];
	this.element.find('[data-plugin]').each( function(idx,obj){
		try
		{
			var cls = $(obj).data('plugin');	
			var name = $(obj).data('name');
			if ( !$(obj)[cls] ) {
				throw "Plugin, " + cls + " not found";
			}
			var inst = $(obj)[cls]();
			if ( inst.instance() instanceof JPViewController )
			{
				self._subViewControllers[name] = inst;
				subVctrls.push(inst);
				inst.instance()._parentViewController = self;	
			}
			else 
			{
				self.children[name] = inst;
			}
		}
		catch(ex)
		{
			console.log("Error: " + cls, ex);
		}
	});	
	subVctrlsRemainCnt = subVctrls.length;
	subVctrls.forEach(function(v){
		self.element.bind('subviewLoaded',function(e){
			e.stopPropagation();
			subVctrlsRemainCnt--;
			if ( subVctrlsRemainCnt == 0 ) {
				setTimeout(function(){
					self.element.trigger('loadAllSubviews');
				},0);
			}
			return e;
		});
	});
	this.element.PageAction();
	var name = this.element.data('name');
	if ( !this._parentViewController )
	{
		$.path[name] = this.element;
		this._path[name] = this.element;
	}
	this.element.find('[data-plugin]').each( function(idx,obj){
		var inst = $(obj).instance();
		if ( inst && inst._initialized ) {
			inst._initialized();
		}
	});
	this.body.trigger('viewLoaded', [this]);
	if ( this._parentViewController ) {
		this._parentViewController.element.trigger('subviewLoaded');
	}
	this.viewWillAppear();
	if ( this._msgCbReady ) {
		this._msgCbReady.forEach(function(v){
			if ( self.messageCallback[v.command] ) {
				self.messageCallback[v.command].apply( self, v.args );
			} 
		});
		delete this._msgCbReady;
	}
}

JPViewController.prototype._layoutSubviews = function()
{
		
}

JPViewController.prototype.viewWillAppear = function(animated)
{
	if ( this.body ) this.body.trigger('viewWillAppear', [this]);
}

JPViewController.prototype.viewDidAppear = function(animated)
{
	if ( this.body ) this.body.trigger('viewDidAppear', [this]);
}

JPViewController.prototype.viewWillDisappear = function(animated)
{
	if ( this.body ) this.body.trigger('viewWillDisappear', [this]);
}

JPViewController.prototype.viewDidDisappear = function(animated)
{
	if ( this.body ) this.body.trigger('viewDidDisappear', [this]);
}

JPViewController.prototype.show = function(options, animated)
{
	this.options = options;
	this.viewWillAppear(animated);
	this.element.show();
	this.viewDidAppear(animated);
}

JPViewController.prototype.hide = function(options, animated)
{
	this.options = options;
	this.viewWillDisappear(animated);
	this.element.hide();
	this.viewDidDisappear(animated);
}

JPViewController.prototype.remove = function(animated)
{
	NotificationCenter.removeObserver(this.body);
	NotificationCenter.removeObserver(this);
	this.viewWillDisappear(animated);
	this.element.hide();
	this.viewDidDisappear(animated);
	this.body.trigger('viewUnloaded', [this]);
	this.element.remove();
}

JPViewController.prototype.refresh = function()
{
	this.viewUnload();
	this.initialize();
}

JPViewController.prototype.sendMessage = function(cmd) 
{
	var args = Array.prototype.slice.call(arguments, 1);
	if ( this.messageCallback[cmd] ) {
		this.messageCallback[cmd].apply( this, args );
	} else {
		if ( !this._msgCbReady ) {
			this._msgCbReady = [];
		}
		this._msgCbReady.push( { command: cmd, args: args }); 
	}
}

JPViewController.prototype.dialog = function(name,params)
{
	if ( !this._dialogs[name] ) {
		if( params ) {
			params.removeAfterDismiss = false;
		} 
		this._dialogs[name] = {
			instance: undefined,
			params: params,
			show: function(args,callback) {
				if ( !this.instance ) {
					var diag = $('<div/>').JPDialog(this.params);
					this.instance = diag.instance();
				}
				this.instance.show(args,callback);
				return this;
			},
			title: function(value) {
				this.instance.title(value);
			}			
		}
	}
	return this._dialogs[name]; 
}