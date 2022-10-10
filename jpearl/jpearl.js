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

window.__createInstances = function(main)
{
	if ( $(main).data('plugin') )
	{
		var cls = $(main).data('plugin');
		$(main)[cls]();
	}
	$('[data-plugin]', main).each(function(idx,obj){
		var cls = $(obj).data('plugin');
		try
		{
			$(obj)[cls]();
		}
		catch(ex)
		{
			console.error( 'Class: ' + cls );
			console.error( ex );
		}
	});
}

$(function($){

	$(window).mouseclick(function(e){
		$.js.popup.hide(false, JPDialog.stack.length == 0 );
	});

	$(window).resize(function(e){
		$.js.popup.hide();
		NotificationCenter.postNotification('WindowResized', e );
	});

	$(window).scroll(function(e){
		NotificationCenter.postNotification('WindowScroll', [ $(window).scrollLeft(), $(window).scrollTop() ] );
	});
	
	var mousemoveCb = function(e) {
		if ( !$.js.dragObject ) {
			return;
		}
		if ( e.originalEvent instanceof TouchEvent ) {
		    var touchLocation = e.targetTouches[0];
			$.js.dragObject.dragging(touchLocation.pageX, touchLocation.pageY, e);			
		} else if ( e.which == 1 ) {
			$.js.dragObject.dragging(e.clientX, e.clientY, e);
			return false;		
		}
		
	}
	
	var mouseupCb = function(e) {
		if ( !$.js.dragObject ) return;
		if ( $.js.dragObject._isDragging )
		{
			var x, y;
			if ( e.originalEvent instanceof TouchEvent ) {
				x = undefined;
				y = undefined;			
			} else {
				x = e.clientX;
				y = e.clientY;
			}
			$.js.dragObject.dragDone(x, y, e);
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
		delete $.js.dragObject;
	}

	$(window).mousemove(mousemoveCb);	
	$(window).bind('touchmove',mousemoveCb);
	

	$(window).keydown(function(e){
		if ( e.which == 27  )  {
			if ( $.js.dialog ) {
				$.js.dialog.dismiss();
			} 
			if ( $.js.popup.view instanceof JPPopoverContainer ) {
				$.js.popup.view.dismiss(true);
				$.js.popup.view = null;
			}
		}
	});

	$(window).mouseup(mouseupCb);
	$(window).bind('touchend', mouseupCb);

    var effects = {};
	$.easingOptions = { x: 1.8 };

	for (var i = 2 ; i <= 6; i++) {
		effects['pow' + i] = (function (i) {
			return function (p) {
				return Math.pow(p, i);
			}
		})(i);
	}

	effects.back = function (p) {
		return Math.pow(p, 2) * (($.easingOptions.x + 1) * p - $.easingOptions.x);
	}

	effects.elastic = function (p) {
		return Math.pow(2, 10 * (p - 1)) * Math.cos(20 * Math.PI * $.easingOptions.x / 3 * p);
	}

	effects.bounce = function (p) {
		for (var a = 0, b = 1 ; 1; a += b, b /= 2) {
			if (p >= (7 - 4 * a) / 11) {
				return -Math.pow((11 - 6 * a - 11 * p) / 4, 2) + Math.pow(b, 2);
			}
		}
	}

	// $.easing에 in,out,inout을 각각 등록합니다.

    $.each(effects, function (name, fn) {
		$.easing[name + 'In'] = fn;
		$.easing[name + 'Out'] = function (p) {
			return 1 - fn(1 - p);
		};
		$.easing[name + 'InOut'] = function (p) {
			return (2 - fn(2 * (1 - p))) / 2;
		};
	});

	$.easing.keyframe = function(p) {
		if ( p == 1 ) return p;
		var kf = $.easingOptions.keyframe;
		var pF = kf.length * p;
		var p1Idx = Math.floor(pF);
		var kf2 = Math.ceil(pF) >= kf.length ? 1 : kf[p1Idx+1];
		var v =  kf2 - kf[p1Idx];
		v =  v * ( pF - p1Idx ) + kf[p1Idx];
		return v;
	}

	$.easing.shake = function(p) {
		return Math.exp( 1-p ) * Math.sin(4*Math.PI * p);	
	};

	__createInstances();
	$(window).trigger('initialized');
});

(function(){

	function executeAction(value)
	{
		if ( value[0] == '@' )
		{
			this.trigger('action', [value.substr(1)]);		
		}
		else if ( value[0] == '[' )
		{
			var items = value.substring(1,value.length-1).split(/\s+/);
			$(items[0]).instance()[items[1]]();
		}
		else if ( value[0] == '#' ) // replace hash
		{
			location.hash = value;
		}
		else if ( value[0] == '+' ) // add parameters
		{
			var query = value.substring(1);
			if ( location.hash.length )
			{
				var params = parseParameters(location.hash.substr(1));
				$.extend(params, parseParameters(query));
				location.hash = '#' + $.param(params);
			}
			else
			{
				location.hash = '#' + query;
			}
		}
		else if ( value[0] == '-' ) // remove parameters
		{
			var query = value.substring(1);
			if ( location.hash.length )
			{
				var params = parseParameters(location.hash.substr(1));
				var list = query.split(',');
				for( var i = 0 ; i < list.length; i++ )
				{
					delete params[list[i]];
				}
				location.hash = '#' + $.param(params);
			}
		}
		else if ( value[1] == '&' ) // request to server
		{
			var query = value.substring(1);
			var idx = location.href.indexOf('?');
			if ( idx == -1 )
			{
				location.href += '?' + query;
			}
			else 
			{
				var params = parseParameters( location.href.substr(idx+1) );
				$.extend(params, parseParameters(query));
				location.href = location.origin + location.pathname + '?' + $.param(params);
			}
		}
		else // url
		{
			location.href = value;
		}
	}

	$.fn.PageAction = function (cmd) {
		var self = this;
		if ( this.data('action') )
		{
			this.click(function(e){
				executeAction.call(self, $(self).data('action'));
			});	
		}
		var list = this.find('[data-action]');
		if ( list.length )
		{
			list.click(function(e){
				executeAction.call(self, $(this).data('action'));
			});
		}
	}
})();

NotificationCenter = {
	
	_callbacks : {},
	_observers : {},
	
	addObserver: function(obs,msg,callback) {
		if ( !this._callbacks[msg] ) {
			this._callbacks[msg] = $.Callbacks('stopOnFalse');
			this._observers[msg] = {};
		}
		this._callbacks[msg].add(callback);
		if ( obs instanceof jQuery ) {
			var noty = obs.data('__notifications');
			if ( !noty ) {
				noty = {};
				obs.data('__notifications', noty);
			}
			noty[msg] = callback;
		}
		else
		{
			if ( !obs.__notifications ) { 
				obs.__notifications = {};
			}
			obs.__notifications[msg] = callback;
		}
	},

	removeObserver: function(obs,msg) {
		var noty = !(obs instanceof jQuery) ? obs.__notifications : obs.data('__notifications');
		if ( !noty ) return;
		switch( arguments.length ) {
			case 1:
				for ( var msg in this._callbacks ) {
					var cb = noty[msg];
					if ( cb ) {
						this._callbacks[msg].remove(cb);
					}
				}
				if ( obs instanceof jQuery ) {
					obs.data('__notifications', null);
				} else {
					delete obs.__notifications;
				}
				break;
			case 2:
				if ( !this._callbacks[msg] ) return;
				var cb = noty[msg];
				if ( cb ) {
					this._callbacks[msg].remove(cb);
					delete noty[msg];
				}
				break;
		}
	},

	postNotification: function(msg)
	{
		if ( !this._callbacks[msg] ) {
			return;
		}
		var args = Array.prototype.slice.call( arguments, 1 );
		this._callbacks[msg].fire.apply(this,args);
	}
};


$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
	// check for conditions and support for blob / arraybuffer response type
	if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob)))))
	{
		return {
			// create new XMLHttpRequest
			send: function(_, callback){
				// setup all variables
				var xhr = new XMLHttpRequest(),
				url = options.url,
				type = options.type || 'GET',
				// blob or arraybuffer. Default is blob
				dataType = options.responseType || "arraybuffer",
				data = options.data || null;
				async = options.async || true;
				
				xhr.addEventListener('load', function(){
					var data = {};
					data[options.dataType] = new Uint8Array(xhr.response);
					callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
					// make callback and send data
				});
																																					 
				xhr.open(type, url, async);
				xhr.overrideMimeType('text/plain; charset=x-user-defined');
				xhr.responseType = dataType;
				xhr.send(data);
			},
					  
			abort: function(){
				jqXHR.abort();
			}
		};
	}
});

$.path = {};

$.js = {
	dragDataType: undefined,
	dragData: undefined,
	dragObject: undefined,
	dialog: undefined,
	tooltip: {
		view: $('<div/>').addClass('jpview tooltip'),
		show: function(element,loc){
			loc.top = element.offset().top + element.outerHeight() + 5;
			$('body').append($.js.tooltip.view);
			$.js.tooltip.view.show().css(loc);
		},
		hide: function(){
			$.js.tooltip.view.detach();
		}
	},
	plugins: {
		menu: {},
		listview: {},
		slideshow: {}
	},
	popup: {
		view: null,
		show: function(obj, animated){
			if ( $.js.popup.view != obj )
			{
				$.js.popup.hide(animated);
				$.js.popup.view = obj;
			}
			if ( obj instanceof JPView )
			{
				obj.appear(animated);
			}
			else
			{
				$('body').append(obj);
				if ( animated )
				{
					obj.stop();
					obj.css({ opacity: 0 });
					obj.animate({
						opacity: 1	
					},{
						duration:400
					});
				}
			}
		},
		dismiss: function(animated) {
			if ( $.js.popup.view ) {
				$.js.popup.view.dismiss(animated);
				$.js.popup.view = null;
			}
		},
		hide: function(animated, forcefully){
			if ( $.js.popup.view )
			{
				if ( $.js.popup.view instanceof JPView )
				{
					if ( forcefully || !$.js.popup.view instanceof JPPopoverContainer) {
						$.js.popup.view.dismiss(animated);
						$.js.popup.view = null;
					}
				}
				else
				{
					if ( animated )
					{
						$.js.popup.view.finish();
						$.js.popup.view.animate({
							opacity: 0
						}, {
							duration: 400,
							complete: function(){
								$.js.popup.view.detach();
								$.js.popup.view.trigger('dismiss');
								$.js.popup.view = null;
							}
						});
					}
					else
					{
						$.js.popup.view.detach();
						$.js.popup.view.trigger('dismiss');
						$.js.popup.view = null;
					}
				}
			}
		}
	},

	popupwin: {
		_windows: {},
		
		getWindow:function(n) {
			return this._windows['__popup_' + n];
		},

        _initOptions : function( opts )
        {
            opts = $.extend( {
                menubar: 'no',
                status: 'no',
                titlebar: 'no',
                toolbar: 'no',
                resizable: '1'
            }, opts);
            opts.width = opts.width || 500;
            opts.height = opts.height || 500;
            opts.left = (screen.width - opts.width)/2,
            opts.top = (screen.height - opts.height)/2
            return Object.keys(opts).map(function(k){
                return k + '=' + opts[k];
            }).join(',');
        },

		/*
            req: {
                name: 팝업창 이름
                url: 주소
                method: 'post' || 'get'
                data: { 
                    Parameter들
                }
            },
            opts: {
                width: 
                height:
                menubar: 'no',
                status: 'no',
                titlebar: 'no',
                toolbar: 'no',
           }
         */
        open: function( req, opts )
        {
            var name = '__popup_' + req.name;
            if ( opts && !opts.repoen && this._windows[name] && !this._windows[name].closed ) {
                if ( !opts || !opts.reopen ) {
                    this._windows[name].focus();
                    return this._windows[name];
                }
            }
            if ( req.data ) {
                for( var k in req.data ) {
                    if ( req.data[k] === undefined ) {
                        delete req.data[k];
                    }
                }
            }
            if ( req.method && req.method.toLowerCase() == 'post' )
            {
                this._windows[name] = open('', name, this._initOptions(opts) );
                var form = buildForm(req,name);
                $('body').append(form);
                form.submit();
                form.remove();
            }
			else
            {
                var url = req.url;
                if ( url ) {
	                if ( url[url.length-1] != '?' && url[url.length-1] != '#') {
	                    url += '#';
	                }
	                if ( req.data ) {
	                    url += $.param(req.data);
	                }
				}
                this._windows[name] = open(url, '_blank', this._initOptions(opts));
            }
            return this._windows[name];
        },

		close:function(win) {
			for( var n in this._windows ) {
				if ( this._windows[n] == win ) {
					if ( !win.closed ) {
						win.close();
					}
					delete this._windows[n];		
				}
			}
		}
	}
};

function buildForm(args,name)
{
    var form = $('<form/>', {
        method: 'POST',
        target: name,
        action: args.url
    });
    if ( args.data ) {
        for( var k in args.data ) {
        	var v = args.data[k];
            form.append( $('<input/>', {
                type: 'hidden',
                name: k,
                value: typeof v == 'object' ? JSON.stringify(v) : v })
            );
        }
    }
    return form;
}

/* URL */

function JPUrl(callback)
{
	var self = this;
	window.onhashchange = function() {
		self.parse();	
		if ( callback ) {
			callback(self.params);
		}
	}
}

JPUrl.prototype.parse = function()
{
	try
	{
		var q = location.hash.substr(1);
		var args = q.length > 0 ? JSON.parse('{"' + q.replace(/[&|\?]/g, '","').replace(/=/g,'":"') + '"}',
						function(key, value) { return key===""?value:decodeURIComponent(value); }) : {} ;
		for( var k in args ){
			args[k] = decodeURIComponent(args[k]);
			if ( args[k] == null || args[k].length == 0 ) {
				args[k] = null;
			}
		}
		this.params = args;
	}
	catch(err) 
	{
		alert('Malformated URL');
	}
}

JPUrl.prototype.open =  function(args,notExtend,viewMode)
{
	for ( var key in args ) 
	{
		if ( this.params[key] !== undefined && args[key] === undefined )
		{
			delete this.params[key];
		}
	}
	if ( !notExtend )
	{
		args = $.extend( {}, this.params, args );
	}
	var keys = args ? Object.keys(args) : null;
	var hash = '';
	if ( keys && keys.length > 0 )
	{
		switch( viewMode )
		{
			case 'window':
			case 'tab':
				args.size = 'window';
				keys.push('size');
				break;
		}
		hash = keys.filter(function(v){
			return args[v] !== undefined;
		}).map(function(k){
			var p = args[k] !== null ?  args[k].toString() : null;
			if ( p ) {
				//var v = ( p.indexOf('&') >= 0 || p.indexOf('%') >= 0  ) ? encodeURIComponent(p) : p;
				var v = encodeURIComponent(p);
				return "%s=%s".sprintf(k,v);
			} else {
				return k + "=";
			}
		}).join("&");
	}
	location.hash = hash;
}

$.fn.colorAnimate = function(color,opts){
	var self = $(this);
	var rgba = self.css('backgroundColor');
	rgba = rgba.substring( rgba.indexOf('(')+1, rgba.length-1 ).split(',');
	self.get(0).bgRed = rgba[0];
	self.get(0).bgGreen = rgba[1];
	self.get(0).bgBlue = rgba[2];
	var idx = 0;
	var red = (color >>> 16) & 0x0ff;
	var green = (color >>> 8) & 0x0ff;
	var blue = color & 0x0ff;
	self.animate({
		bgRed: red,
		bgGreen: green,
		bgBlue: blue
	},$.extend(opts,{
		step: function(n,fx){
			switch( fx.prop )			
			{
				case 'bgRed':
					red = parseInt(n);
					break;
				case 'bgGreen':
					green = parseInt(n);
					break;
				case 'bgBlue':
					blue = parseInt(n);
					break;
			}
			if ( idx != 0 && idx%3 == 0 )
			{
				self.css('backgroundColor', 
					'rgba(%d,%d,%d,%d)'.sprintf(red,green,blue,1) );
			}
			idx++;
		}	
	}));
	return $(this);
}

$.fn.mouseclick = function(data,callback)
{
	var pressDT;
	var pos;
	if ( arguments.length == 1 )
	{
		callback = data;
		data = undefined;
	}
	var clickfunc = function(e){
		if ( Date.now() - pressDT  < 500 )
		{
			e.stopPropagation();
			e.stopImmediatePropagation();
			$.js.dragObject = undefined;
            if ( window['s$'] ) {
                s$.js.dragObject = undefined;
            }
			e.data = data;
			return callback.call(e.currentTarget,e);
		}
	};
	$(this).mousedown( function(e){
		if ( e.which == 1 )
		{
			pressDT = Date.now();
			pos = {
				x: e.clientX,
				y: e.clientY
			};
			
		}
	}).mouseup(function(e){
		if ( e.target.nodeName == 'INPUT' || e.target.nodeName == 'SELECT' ) {
			return;
		}
		if ( pos && ( !$.js.dragObject || !$.js.dragObject._isDragging ) && e.which == 1 )
		{
			var dist = Math.sqrt(Math.pow(pos.x - e.clientX, 2) + Math.pow(pos.y - e.clientY, 2));
			if ( dist < 5 ) {
				return clickfunc(e);
			}
			pos = undefined;
		}
		
	});
	return $(this);
}

$.fn.instance = function() {
	return this[0] && this[0].__instance;
}

$.plugin = function (cls) {
	if ( typeof cls == 'function' )
	{
		var clsname = cls.name;
		if ( !clsname )
		{
			clsname = cls.getName();
		}
	}
	else if ( typeof cls == 'string' )
	{
		clsname = cls;
		cls = window[clsname];
	}
	if ($.fn[clsname]) return;
	$.fn[clsname] = function (cmd) {
		var ret = this;
		var self = this;

		if (typeof (cmd) == "string") {
			if (cmd[0] == '_')
			{
				throw new ReferenceError(cmd + ' is a private function');
			}
			var params = Array.prototype.slice.call(arguments, 1);
			$.each(this, function (idx, value) {
				if (this.__instance === undefined )
				{
					this.__instance = new cls(this);
				}
				if (this.__instance[cmd]) {
					var v = this.__instance[cmd].apply(this.__instance, params);
					if (v !== undefined) {
						if (self == ret) {
							ret = [v];
						}
						else {
							ret.push(v);
						}
					}
				}
				else {
					throw new ReferenceError( cmd + " does not exist");
				}
			});
		}
		else if ( !cmd || $.isPlainObject(cmd) ) {
			$.each(this, function (idx, value) {
				if ( !this.__instance )
				{
					this.__instance = new cls(this, cmd);
				}
			});
			return self;
		}
		if (ret == self) {
			return self;
		}
		return ret.length == 1 ? ret[0] : ret;
	}
};

$.fn.viewLoaded = function(callback){
	return $(this).bind('viewLoaded',callback);
};

$.fn.viewUnloaded = function(callback){
	return $(this).bind('viewUnloaded',callback);
};


$.fn.viewWillAppear = function(callback){
	return $(this).bind('viewWillAppear',callback);
};

$.fn.viewWillDisappear = function(callback){
	return $(this).bind('viewWillDisappear',callback);
};

$.fn.viewEvents = function(callbacks,args){
	var list = ['click', 'mouseover', 'mouseout', 'mouseleave', 'mouseclick', 'dblclick'];
	list.forEach(function(v){
		$(this).find('[data-event-' + v + ']').each(function(e){
			var k = $(this).data('event' + v[0].toUpperCase() + v.substr(1));
			if ( callbacks[k] ) {
				$(this).bind(v,args,callbacks[k]);
			}
		});	
	}, this);
}

var JPMessageQueue = {
	_queues: {},	
	/*
	 * callback : function( host, return )
	 */
	sendMessage:function(to,msg,params,callback) {
		if ( typeof to != 'string' ) {
			to = $(to).attr('id');
		}
		if ( arguments.length == 3 && typeof params == 'function') {
			callback = params;
			params = undefined;
		}
		if ( !this._queues[to] ) {
			this._queues[to] = { ready: [ { message: msg, parameters: params, callback: callback } ] };
		} else {
			if ( this._queues[to].ready ) {
				this._queues[to].ready.push( { message: msg, parameters: params, callback: callback } );
			} else if ( this._queues[to].queue ) {
				var qlist = this._queues[to].queue;
				for ( var i = 0 ; i < qlist.length; i++ ) {
					if ( callback ) {
						callback( qlist[i].host, qlist[i].func(msg,params) );
					} else {
						qlist[i].func(msg,params);
					}
				}
			}
		}
	},
	register:function(host,msgCallback) {
		if ( typeof host != 'string' ) {
			host = $(host).attr('id');
		}
		var q = this._queues[host];
		if ( q && q.ready ) {
			for ( var i = 0 ; i < q.ready.length; i++ ) {
				if( q.ready[i] && typeof q.ready[i].callback == 'function' ) {
					q.ready[i].callback( host,  msgCallback(  q.ready[i].message, q.ready[i].parameters  )  );
				} else {
					console.log('JPMessageQueue.register no callback: ' +  host );
				}
			}
			delete q.ready;
		}
		if ( !q || !this._queues[host].queue ) {
			this._queues[host] = { queue: []  };
		}
		this._queues[host].queue.push( { host: host, func:msgCallback } );
	},
	unregister: function(to) {
		if ( this._queues[to] ) {
			delete this._queues[to];
		}
	},
	cancel: function(to) {
		if ( this._queues[to] &&  this._queues[to].ready ) {
			delete this._queues[to].ready;
		}
	}
}
