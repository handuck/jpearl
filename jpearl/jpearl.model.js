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

function JPModelBase(props)
{
	if ( arguments.length == 0 ) return;
	this.setProperties(props);
}

JPModelBase.prototype.setProperties = function(props)
{
	this.properties = props;
}

JPModelBase.State = {
	Insert: 1,
	Update: 2,
	Delete: -1
}

Object.freeze(JPModelBase.State);


/* JSON format
{
	class: JavaScript Class Name,
	columns: [ Column name, ... ],
	list: [ 
		[ value, ... ],
		...
	]
}
 */
JPModelBase.parseJSON = function(json)
{
	var objs = [];
	if ( json && json.list && json.list.length > 0 
		&& json.columns && json.columns.length > 0 )
	{
		var clsName = json['class'];
		if ( clsName )
		{
			json.list.forEach(function(item){
				var props = {};
				json.columns.forEach(function(cname, cidx){
					props[cname] = item[cidx];
				});
				objs.push(new window[clsName](props));
			});
		}
		else
		{
			json.list.forEach(function(item){
				var props = {};
				json.columns.forEach(function(cname, cidx){
					props[cname] = item[cidx];
				});
				objs.push(props);
			});
		}
	}
	return objs;
}

JPModelBase.parseHierarchyJSON = function(json)
{
    var columns = json.columns.map(function(v){
        var list = v.split('_');
        var v = list[0].toLowerCase();
        for( var i = 1 ; i < list.length; i++ )
        {
	    	v += list[i][0].toUpperCase() + list[i].substr(1).toLowerCase();
		}
        return v;
	});

	var data = json.list;
    var i = 0;
	var clsName = json['class'] || 'TreeNode';
	var tree = new window[clsName]();
	var root = (function __convert(plist,depth){
		var list = {};
		var cnt =0;
		while( i < data.length )
		{
			var props = {};
			columns.forEach( function(v,idx){
				props[v] = data[i][idx];
			});
			var level = props.level;
			var node = new window[clsName](props);
			var id = props.id;
			var pId = props.parentId || 'root';
			if ( depth == level ) {
				list[id] = node;
				if ( plist[pId] ) {
					if ( !plist[pId]._children ) {
						plist[pId]._children = [];
					}
					plist[pId]._children.push( list[id] );
				}
				i++;
			}
			else if ( depth < level ) {
				__convert(list, depth+1 );
			}
			else {
				return list;
			}
			cnt++;
		}
		return list;
	})({ root: tree },1);
	return tree;
}

JPModelBase.prototype._response = function(cmd,data,err) { return data; };
JPModelBase.prototype._apis = undefined;
JPModelBase.prototype.checkResponseSuccess = function() { return true; }

JPModelBase.prototype.submit = function(cmd,args,progress) 
{
	var dobj = $.Deferred();
	var self = this;
	var opts;
	if ( typeof args == 'function' )
	{
		progress = args;
		args = undefined;
	}
	if (  this.__proto__._apis[cmd] ) {
		opts = this.__proto__._apis[cmd].request.call(this,args);
	}
	if ( !opts ) {
		throw new ReferenceError(cmd + ' is not a command');
	}
	if ( progress )
	{
		opts.xhr = function() {
			 var xhr = new window.XMLHttpRequest();
             // upload
			 xhr.upload.addEventListener('progress', function(e){
			 	if ( e.lengthComputable )
			 	{
			 		dobj.notifyWith(self, [e.loaded, e.total, 'upload']);
			 	}
			 }, false);
			 // download
			 xhr.addEventListener("progress", function(e){
			 	if ( e.lengthComputable )
			 	{
			 		dobj.notifyWith(self, [e.loaded, e.total, 'download']);
			 	}
			 }, false);
			 return xhr;
		};
	}
	var self = this;
	this._ajaxRequest = $.ajax( opts ).done(function(data){
		if ( self.checkResponseSuccess(data) ) {
			if ( self.__proto__._apis[cmd] && self.__proto__._apis[cmd].response ) {
				var ret = self.__proto__._apis[cmd].response.call(self,data);
				if ( ret ) {
					data = ret;
				}
			}
			dobj.resolveWith(self,[data]);
		} else { 
			dobj.rejectWith(self,[data]); 
		}
	}).fail(function(jqXHR,textStatus,errorThrown){
		dobj.rejectWith(self,[jqXHR,textStatus,errorThrown]);
	}).always(function(jqXHR,textStaut){
		
	});
	dobj._ajaxRequest =  this._ajaxRequest;
	return dobj.promise();
}

JPModelBase.prototype.clone = function(name)
{
	return new window[name]( $.extend( true, {}, this.properties) );
}

JPModelBase.upload = function(url,files)
{
	var dobj = $.Deferred();
	var self = this;
	var formData = new FormData();
	formData.append('count', files.length);
	for ( var i = 0 ;  i < files.length; i++ ) {
		formData.append( 'file' + i, files[i] );
	}
	var opts = {
		url: url,
		type: 'POST',
		dataType: 'json',
	  	data: formData,
        contentType: false,
        processData: false	
	};
	opts.xhr = function() {
		 var xhr = new window.XMLHttpRequest();
		 // upload
		 xhr.upload.addEventListener('progress', function(e){
			if ( e.lengthComputable )
			{
		 		dobj.notifyWith(self, [e.loaded, e.total, 'upload']);
			}
		 }, false);
		 // download
		 xhr.addEventListener("progress", function(e){
			if ( e.lengthComputable )
			{
		 		dobj.notifyWith(self, [e.loaded, e.total, 'download']);
			}
		 }, false);
		 return xhr;
	};
	$.ajax( opts ).done(function(data){
		dobj.resolveWith(self,[data]);
	}).fail(function(jqXHR,textStatus,errorThrown){
		dobj.rejectWith(self,[jqXHR,textStatus,errorThrown]);
	});
	return dobj.prmoise();
}
