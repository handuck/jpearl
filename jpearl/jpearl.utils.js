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

if ( !Math.log10 )
{
	Math.log10 = function(v) {
		return Math.log(v) / Math.log(10);
	}
}

if ( !Object.extract ) {
	Object.extract = function(obj)
	{
		var ret = {};
		var plist;
		if ( Array.isArray(arguments[1]) ) {
			plist = arguments[1];
		} else {
			plist = Array.prototype.slice.call(arguments,1);
		}
		for( var i = 0 ; i < plist.length; i++ )
		{
			var k = plist[i];
			ret[k] = obj[k];
		}
		return ret;
	}
}

if ( !Array.prototype.splice.name ) {
	if ( Object.defineProperty )
	{
		Object.defineProperty(Function.prototype, 'name', {
			get: function() {
				// var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
				var name = this.toString().match(/^\s*function\s*([^\(\s]*)/)[1];
				Object.defineProperty(this, 'name', { value: name });
				return name;
			}
		});
	}
	else
	{
		Function.prototype.getName = function()
		{
			var name = this.toString().match(/^\s*function\s*([^\(\s]*)/)[1];
			return name;
		}
	}
}

if ( !Array.prototype.peek ) {
	Array.prototype.peek = function()
	{
		return this.length ? this[this.length-1] : undefined;
	}
}

// [ min , max )
if ( !Math.randInt ) {
	Math.randInt = function(min,max) {
		if ( arguments.length == 0 ){
			min = 0;
			max = 1000000000000;
		}
		if ( arguments.length == 1 ){
			max = min;	
			min = 0;
		}
		if ( min == max ) return min;
		var r = Math.floor(Math.random() * ( max - min ) + min);
		return Math.min(max-1,r);
	}
}


function unique(len)
{
	var value = '';
	for ( var i = 0 ; i < len ; i++ ) {
		var idx = Math.floor(Math.random() * 36);
		if ( idx < 10 ) {
			value += String.fromCharCode( 0x30 + idx ) ;
		} else {
			value += String.fromCharCode( 0x61 + idx-10) ;
		}
	}
	return value;
}

function humanReadableSize(size) {
	var units = ["", "K", "M", "G"];
	var uidx = Math.min( units.length-1, Math.floor((Math.log(size) * Math.LOG2E) / 10));
	return (size / (1 << (10 * uidx))).toFixed(2) + " " + units[uidx] + "B";
}

function currencyInKorean(v){
    if ( typeof v == 'string') {
        v = v.replace(/\D/g, '');
        v = parseInt(v);
        if ( v == 0 ) return '0';
        else if ( isNaN(v) ) return '0';
    }
    var str = '';
    var subUnits = ['', '십', '백', '천'];
    var nums = ['영','일', '이','삼','사','오','육','칠','팔', '구'];
    var units = [ '', '만 ', '억 ', '조 '];
    var u = 0;
    var sign = Math.sign(v);
    v = Math.abs(v);
    while( v > 0 ) {
        var a = v % 10000;
        if ( a >  0 )  {
            var sub = '';
            for ( var i = 3 ; i >= 0 ; i-- ) {
                var t = parseInt(a/Math.pow(10,i)); 
                if ( t ) {
                    sub += nums[t] + subUnits[i];
                }
                a = a % Math.pow(10,i);
            }
            str = sub + units[u] + str;
        }
        u++;
        v = parseInt( v / 10000 );
    }
    return (sign < 0 ? "-" : "") +  str.trim();  
}

if (!Array.prototype.shuffle)
{
    Array.prototype.shuffle = function()
    {
        var idxs = [];
        for (var i = 0 ; i < this.length ; i++)
        {
            idxs[i] = i;
        }
        var lastIdx = idxs.length - 1;
        for ( var i = 0 ; i < this.length ; i++ )
        {
            var r1 = Math.round(Math.random() * lastIdx);
            var r2 = Math.round(Math.random() * lastIdx);
            if (r1 != r2)
            {
                idxs[r1] ^= idxs[r2]; idxs[r2] ^= idxs[r1]; idxs[r1] ^= idxs[r2];
            }
        }
        var startIdx = Math.round(Math.random() * lastIdx);
        for (var i = 0 ; i < this.length ; i++)
        {
            idxs[i] = (idxs[i] + startIdx) % this.length;
        }
        return idxs.map( (v) => this[v], this);
    }

    Array.shuffleIndex = function(num) 
	{
		var list = [];
		for ( var i = 0 ; i < num ; i++ ) {
			list[i] = i;
		}
		return list.shuffle();
	}
}

if ( !Number.prototype.padZeros)
{
    Number.prototype.padZeros = function(numdigits)
    {
        var zeros = '';
        for( var i = 0 ; i < numdigits ; i++ )
        {
            zeros += '0';
        }
        return (zeros + this).slice(-numdigits);

    }
}

if ( !Number.prototype.toTimeString )
{
	Number.prototype.toTimeString = function(fmt) {
		var h = parseInt(this / 3600);
		var m = parseInt((this - h * 3600)/60);
		var s = this % 60;
		var v = parseInt( Math.round((s - Math.floor(s))*1000) );
		while( v > 0 && Math.floor(v/10) == v/10 ) {
			v /= 10;
		}
		s = parseInt(s);
		return fmt.replace(/[Hh]/, h.padZeros(2))
			.replace(/i/,m.padZeros(2))
			.replace(/s/,s.padZeros(2))
			.replace(/v/,v);
	}
}

if (!String.prototype.pad)
{
    String.prototype.pad = function(chr, len)
    {
        var p = '';
        for (var i = 0 ; i < len ; i++) {
            p += chr;
        }
        return (p + this).slice(-len);
    }
}

if (!String.prototype.parse)
{
	String.prototype.parse = function(fmt,args)
	{
		var regExp;
		var list;
		var ret = undefined;
		switch( fmt )
		{
			case 'date':
				ret = new Date(this);
				if (  !this.match(/^\d+$/) ) {
					list = this.match( args || $.consts.validate.date);			
					if ( list ) 
					{
						if (list[1].length == 2 ) 
						{
							list[1] += 2000;  
						}
						ret = new Date( list[1], list[2]-1, list[3] );
					}
					else 
					{
						list = this.match( args || $.consts.validate.datetime);
						if ( list ) {
							if (list[1].length == 2 ) 
							{
								list[1] += 2000;  
							}
							ret = new Date( list[1], list[2]-1, list[3] );
						}
					}
				} else {
					ret = new Date( parseInt(this) );
				}
				break;
			case 'datetime':
				if (  !this.match(/^\d+$/) ) {	
					list = this.match( args || $.consts.validate.datetime);			
					if ( list ) 
					{
						if (list[1].length == 2 ) 
						{
							list[1] += 2000;  
						}
						ret = new Date( list[1], list[2]-1, list[3]);
						ret.setHours(list[4] || 0, list[5] || 0, list[6] || 0);
					}
				} else {
					ret = new Date( parseInt(this) );
				}
				break;
			case 'time':
				list = this.match( args || $.consts.validate.time);			
				ret = new Date();
				ret.setHours(list[1] || 0, list[2] || 0, list[3] || 0);
				break;
			case 'int':
			case 'integer':
				ret = parseInt(this.replace(',', ''));
				break;
			case 'float':
			case 'double':
				ret = parseFloat(this.replace(',', ''));
				break;
		}
		return ret;
	}
	
	String.prototype.format = function(v) {
		switch(v) {
			case 'phone':
				var v = this.match(/(\d{2,3})-?(\d{3,4})-?(\d{4})/);
				return v ? "%s-%s-%s".sprintf(v[1], v[2], v[3]) : null;
		}
	}
}


if ( !String.prototype.is ) {
	
	String.prototype.is = function(type)
	{
		if (this.length == 0 ) return false;
		var regex = null;
		switch(type) {
			case 'integer':
				regex = /^[+-]?\d+$/;
				break;
			case 'currency':
				regex = /^[+-]?\d{1,3}(,\d{3})*(\.\d{2})?$/;
				break;
			case 'number':
				regex = /^[+-]?\d+(\.\d+)?$/;
				break;
			case 'phone':
			case 'tel':
				regex =  /^0\d{1,2}-?\d{3,4}-?\d{4}$/
				break;
			case 'email':
				regex = /^[\w\.]{3,}@(\w+\.)+\w+$/;
				break;
			case 'color':
				regex = /^(?:#|0x)?[\da-fA-F]{6}$/;
				break;
			case 'url':
				regex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)\S+(?:[^\s`!\[\]{};:'".,?«»“”‘’]))/ig;
				break;
			default:
				break;
		}
		return regex ? this.match(regex) : false;
	}
	
}

if (!String.prototype.sprintf)
{
    String.prototype.sprintf = function()
    {
        var list = Array.prototype.slice.call(arguments, 0);
        return this.replace(/%([+\.\-\d]*)([dxXobfs%])/g, function (match, opt, type) {
            if ( type == '%' ) {
                return type;
            }
            var v = list.shift();
            switch( type )
            {
                // 10진수
                case 'd':
                    v = v ? parseInt(v).toString() : "0";
                    break;
                // String
                case 's':
                    v = v ? v.toString() : '';
                    break;
                // 16진수
                case 'x':
                    v = v ? parseInt(v).toString(16) : '0';
                    break;
                // 16진수 대문자
                case 'X':
                    v = v ? parseInt(v).toString(16).toUpperCase() : '0';
                    break;
                // 8진수
                case 'o':
                    v = v ? parseInt(v).toString(8) : '0';
                    break;
                // 2진수
                case 'b':
                    v = v ? parseInt(v).toString(2) : '0';
                    break;
                // 실수
                case 'f':
                    v = v ? parseFloat(v) : '0';
                    break;
				case '%':
					v = '%';
					break;
                default:
                    v = null;
                    break;
            }
            if (opt.length > 0)
            {
                switch (type)
                {
                    case 'd':
                    case 'x':
                    case 'X':
                    case 'o':
                    case 'b':
                        if (opt[0] == '0')
                        {
                            v = v.pad('0', parseInt(opt.slice(1)));
                        }
                        else
                        {
                            v = v.pad(' ', parseInt(opt));
                        }
                        break;
                    case 'f':
                        var numdigits = Math.floor(opt);
                        var numfloat = Math.round((opt - numdigits) * 10);
                        if (Math.floor(v) != v) numdigits++;
                        v = parseFloat(v).toFixed(numfloat);
                        if ( v.len < numdigits ) v.pad(' ', numdigits);
                        break;
                    case 's':
                        var align = 1
                        var idx = 0;
                        if (opt[0] == '+' || opt[0] == '-')
                        {
                            align = opt[0] == '+' ? 1 : -1;
                            idx++;
                        }
                        var len = parseInt( opt.slice(idx) );
                        if (align == 1)
                        {
                            v = v.pad(' ', len);
                        }
                        else
                        {
                            v = v.slice(0, len);
                            for ( var i = v.length ; i < len ; i++ )
                            {
                                v += ' ';
                            }
                        }
                        break;
                }
            }
            return v;
        });
    }
}

if ( !Date.prototype.format )
{
	Date.prototype.format = function(fmt)
	{
		var h = this.getHours();
		return fmt.replace('Y', this.getFullYear())
					.replace('y', "%02d".sprintf(this.getYear()%100) )
					.replace('m', "%02d".sprintf(this.getMonth()+1))
					.replace('d', "%02d".sprintf(this.getDate()))
					.replace('H', "%02d".sprintf(h))
					.replace('i', "%02d".sprintf(this.getMinutes()))
					.replace('s', "%02d".sprintf(this.getSeconds()))
					.replace('A', this.getHours() > 12 ? '오후' : '오전')
					.replace('a', this.getHours() > 12 ? 'pm' : 'am')
					.replace('h', (h%12 == 0) ? 12 : (h%12) )
                    .replace('w', $.consts.weeks[this.getDay()] )
	}

	Date.prototype.clone = function()
	{
		return new Date(this.getTime());
	}

	Date.prototype.toString = function(fmt)
	{
		return this.format( fmt || 'Y-m-d H:i:s' );
	}
	
	Date.prototype.yearmonth = function() {
		return this.getFullYear() * 100 + ( this.getMonth() + 1 );
	}
	
	Date.prototype.monthDiff = function(ref) {
		ref = ref || new Date();
		return ref.getFullYear() * 12 + ref.getMonth() - (this.getFullYear() * 12 + this.getMonth());
	}
	
	Date.prototype.difference = function(ref)
	{
		var now = ref || new Date();
		var sec = parseInt((now - this)/1000);
		var suffix = sec >= 0 ? '전' : '후';
		sec = Math.abs(sec);
		var str;
		if ( sec < 60 ) {
			str = sec + '초';
		} else if ( sec < 60 * 60 ) {
			str = parseInt(sec / 60)  + '분';
		} else if ( sec < 60 * 60 * 24) {
			var h = parseInt( sec / 3600 );
			var m = parseInt( (sec - h * 3600) / 60  );
			str = h + '시간';
			if ( m > 0 ) {
				str += ' ' + m + '분';
			}
		} else if ( sec < 60 * 60 * 24 * 7) {
			str = parseInt(sec / (60 * 60 * 24)) + '일';
		} else if ( sec < 60 * 60 * 24 * 7 * 5) {
			str = parseInt(sec / (60 * 60 * 24 * 7)) + '주';
		} else if ( sec < 60 * 60 * 24 * 365 ) {
			str = Math.abs((now.getYear() * 12 + now.getMonth()) - ( this.getYear() * 12 + this.getMonth())) + '개월';
		} else {
			str = Math.abs(now.getYear() - this.getYear()) + '년';
		} 
		return str + suffix;
	}
	
	Date.prototype.diff = function(ref,mode)
	{
		var now = ref || new Date();
		var sec = parseInt((now - this)/1000);
		switch( mode ) {
			case 'minute':
				sec = Math.ceil( sec / 60 );
				break;
			case 'hour':
				sec = Math.ceil( sec / (60 * 60 ) );
				break;				
			case 'day':
				sec = Math.ceil(sec / (24 * 60 * 60));
				break;
			case 'week':
				sec = Math.ceil(sec / (24 * 60 * 60 * 7));
				break;
			case 'month':
				sec = (now.getFullYear() * 100 + now.getMonth()) - (this.getFullYear() * 100 + this.getMonth());
				break;
			case 'year':
				sec = Math.ceil(sec / (24 * 60 * 60 * 365));
				break;
		}
		return sec;
	} 
	
	Date.prototype.equals = function(v, type)
	{
		if ( !v ) {
			return false;	
		} else if ( type == 'month' ) {
			return this.getFullYear() == v.getFullYear() && this.getMonth() == v.getMonth();
		} else if ( type == 'date' ) {
			return this.getFullYear() == v.getFullYear() && this.getMonth() == v.getMonth() && this.getDate() == v.getDate();
		} else if ( type == 'year' ) {
			return this.getFullYear() == v.getFullYear();
		}	
	
	}
	
	Date.prototype.getWeekOfMonth = function()
	{
		var first = new Date( this.getFullYear(), this.getMonth(), 1 );
		return parseInt(( this.getDate() + first.getDay() - 1 ) / 7);
	}
	
	Date.new = function(v) {
		var dt;
		if ( typeof v == 'string' ) {
			if ( v.indexOf('-') == -1) {
				if ( v.length > 8 ) {
					dt = new Date( v.substr(0,4), parseInt(v.substr(4,2)) - 1, v.substr(6,2), v.substr(9,2), v.substr(11,2), v.substr(13,2) );
				} else {
					dt = new Date( v.substr(0,4), parseInt(v.substr(4,2)) - 1, v.substr(6,2) );
				}
			} else {
				dt = new Date(v);
			}
			if ( v.length <= 10 ) {
				dt.setHours(0,0,0,0);
			}
		} else if ( typeof v == 'number' ) {
			dt = new Date(v);
		}
		return dt;
	}
	
	Date.prototype.add = function(value, type)
	{
		switch(type) {
			case 'year':
				this.setFullYear( this.getFullYear() + value );
				break;
			case 'month':
				this.setMonth( this.getMonth() + value );
				break;
			case 'week':
				this.setDate( this.getDate() + value * 7);
				break;
			case 'hour':
				this.setHours( this.getHours() + value );
				break;
			case 'minute':
				this.setMinutes( this.getMinutes() + value );
				break;				
			case 'date':
			default:
				this.setDate( this.getDate() + value );
				break;
		}
		return this;
	}
	
	
}


/*  Animation */

window.requestNextAnimationFrame = (function(){
	var self = this;

	if ( window.webkitRequestAnimationFrame )
	{
		var originalWebkitFunc = window.webkitRequestAnimationFrame;
		window.webkitRequestAnimationFrame = function(callback,element){
			originalWebkitFunc(function(time){
				if ( time === undefined	) {
					time = +new Date();
				}
				callback(time);
			},element);
		};
	}
	
	if ( window.mozRequestAnimationFrame )
	{
		var index = userAgent.indexOf('rv:');
		if ( userAgent.indexOf('Gecko') != -1 ) {
			var gversion = userAgent.substr(index+3,3);
			if ( gversion == '2.0' )
			{
				window.mozRequestAnimationFrame = undefined;
			}
		}
	}

	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||	
		window.mozRequestAnimationFrame||	
		window.msRequestAnimationFrame||	
		function(callback) {
			var start, finish;
			return window.setTimeout(function() {
				start = +new Date();
				callback(start);
				finish = +new Date();		
				self.timeout = 1000/60 - (finish-start);
			}, self.timeout);
		};
})();

window.cancelRequestAnimationFrame = (function(){
	return window.cancelRequestAnimationFrame ||
		function(handle) {
			clearTimeout(handle);
		};
})();

function Animation(callback){
	this._callback = callback;
}

Animation.prototype.start = function(cb)
{
	var self = this;
	this._stop = false;
	cb = cb || this._callback;
	var animate = function(time){
		if ( !self._stop )
		{
			cb(time);
			self._timer = window.requestNextAnimationFrame(animate);
		}
	};
	this._timer = window.requestNextAnimationFrame(animate);
}

Animation.prototype.stop = function() 
{
	if ( this._timer )
	{
		this._stop = true;
		window.cancelRequestAnimationFrame(this._timer);
		delete this._timer;
	}
}

if ( !window.parseParameters)
{
	window.parseParameters = function(params)
	{
		return params?JSON.parse('{"' + params.replace(/[&|\?]/g, '","').replace(/=/g,'":"') + '"}',
		   function(key, value) { return key===""?value:decodeURIComponent(value) }):{}
	}
}

if ( !window.Async )
{
	window.Async = {};

	window.Async.waterfall = function( steps, callback ){
		var self = this;
		if ( steps.length == 0 ) {
			callback();
			return;
		}
		(function(idx){
			steps[idx](function __cb(err){
				idx++;
				var args = Array.prototype.slice.call(arguments, 0);
				if ( idx == steps.length )
				{
					callback.apply(self,args);
					return;
				}
				if ( err )
				{
					callback(err);
					return;
				}
				else
				{
					args.shift();
					args.push(__cb);
					steps[idx].apply(self,args);
				}
			});	
		})(0);
	};

	window.Async.map = function( array, iterator, callback ) {
		var self = this;
		var results = [];
		var hasError = false;
		var cnt = 0;
		if ( array.length == 0 ) {
			callback();
			return;
		} 
		for ( var i = 0 ; i < array.length; i++ )
		{
			(function(idx){
				iterator( array[idx], idx, function(err,data){
					if ( hasError ) return;
					else if ( err )
					{
						hasError = true;
						callback(err);
					}					
					else
					{
						results[idx] = data;
						cnt++;
						if ( cnt == array.length )
						{
							callback(err,results);
						}
					}
				});
			})(i);
		}
	};

	window.Async.each = function( array, iterator, callback ){
		var self = this;
		var hasError = false;
		var cnt = 0;
		if ( array.length == 0 ) {
			callback();
			return;
		}
		for( var i = 0 ; i < array.length; i++ )
		{
			(function(idx){
				iterator( array[idx], idx, function(err){
					if ( hasError ) return;
					else if ( err )
					{
						hasError = true;
						callback(err);
					}
					else
					{
						if ( ++cnt == array.length )
						{
							callback();
						}
					}
				});
			})(i);
		}
	};

	window.Async.mapSeries = function(array,iterator,callback){
		var self = this;
		var results = [];
		if ( array.length == 0 ) {
			callback();
			return;
		}
		(function(idx){
			iterator(array[idx], idx, function __cb(err,data){
				if ( err ) 
				{
					callback(err);
				}		
				else
				{
					if ( idx == array.length )
					{
						callback(err,results);	
					}
					else
					{
						++idx;
						results.push(data);
						iterator(array[idx], idx, __cb);
					}
				}
			});
		})(0);
	};

	window.Async.eachSeries = function(array,iterator,callback){
		var self = this;
		if ( array.length == 0 ) {
			callback();
			return;
		}
		(function(idx){
			iterator(array[idx],idx, function __cb(err,data){
				if ( err ) 
				{
					callback(err);
				}		
				else
				{
					++idx;
					if ( idx == array.length )
					{
						callback(undefined,data);	
					}
					else
					{
						iterator(array[idx], idx, __cb);
					}
				}
			});
		})(0);
	};

	window.Async.parallel = function(jobs,callback)
	{
		var hasError = false;
		var results = {};
		var cnt = 0;
		var klen = Object.keys(jobs).length;
		if ( klen == 0 ) {
			callback();
			return;
		}
		for( var k in jobs )
		{
			(function(key){
				jobs[key]( function(err){
					if ( err )
					{
						hasError = true;
						callback(err);
					}
					else if ( !hasError )
					{
						cnt++;
						if ( arguments.length == 2 )
						{
							results[key] = arguments[1];
						}
						else
						{
							results[key] = Array.prototype.slice.call( arguments, 1 );
						}
						if ( cnt == klen )
						{
							callback(null,results);
						}
					}
				});					
			})(k);
		}
	}
}


TreeTraversalOrder = {
	Pre: 0,
	In: 1,
	Post: 2	
};

if ( Object.freeze )
{
	Object.freeze( TreeTraversalOrder );
}

function TreeNode(props,dictionary)
{
	if ( !arguments.length ) return;
	this.properties = props;
	if ( dictionary ){
		for( var k in dictionary ) {
			this.properties[k] = this.properties[dictionary[k]];
		}
	}
}

Object.defineProperties ( TreeNode.prototype, 
{
	name: {
		get: function(){
			return this.properties.name;
		}
	},
	children: {
		get: function() {
			return this._children;
		},
		set: function(v) {
			this._children = v;
		}
	},
	parent: {
		get: function() {
			return this._parent;
		}
	},
	siblings: {
		get: function() {
			return this._root ? this._root.children : this._parent.children;
		}
	},
	isleaf: {
		get: function() {
			return !this._children || this._children.length == 0;
		}
	}
});

TreeNode.parse = function(v, dictionary)
{
	var t = new TreeNode(v,dictionary);
	var clist = t.properties.children;
	if ( clist ) {
		delete t.properties.children;
		t._children = [];
		for (var i = 0 ; i < clist.length; i++) {
			t._children[i] = TreeNode.parse(clist[i],dictionary);
			t._children[i]._parent = t;
		}
	}
	return t;
}

TreeNode.prototype.parents = function()
{
	var self = this;
	var queue = [];
	var p = this._parent;
	while( p )
	{
		queue.unshift( p );	
		p = p._parent;
	}
	return queue;
}

TreeNode.prototype.getTop = function()
{
	var p = this._parent;
	while( p )
	{
		if ( !p._parent ) return p;
		p = p._parent;
	}
	return this;
}

TreeNode.prototype.graft = function(node)
{
	if (this._children)
	{
		this._children = this._children.concat(menu._children);
	}
	else
	{
		this._children = node._children;
	}
	if ( this._children )
	{
		for ( var i = 0 ; i < this._children; i++ )
		{
			this._children[i]._parent = this;	
		}		
	}
	return this;
}


TreeNode.prototype.findChild = function( path, cmpFunc, idx)
{
	var item = undefined;
	idx = idx || 0;
	if ( path.length == idx ) {
		return undefined;
	}
	if ( this.children && this.children.length > 0 ) {
		var clen = this.children.length;
		for ( var i = 0 ; i < clen ; i++ ) {
			if ( cmpFunc( this.children[i], idx) ) {
				item = this.children[i];
				if ( idx + 1 < path.length ) {
					item = item.findChild(path, cmpFunc, idx+1);
				}
				break;
			}
		}
	}
	return item;
}


TreeNode.prototype.traverse = function(cb,order,item, endCallback) {
	var self = this;
	if ( item ) {
		if ( !order ) {
			if ( cb(item) === false )  {
				return false;
			}
		}
		if ( item.children ) {
			var children = item.children;
			
			if ( endCallback )
			{
				(function __eachSerial(idx){
					if ( idx == children.length ){
						endCallback();
					}
					else {
						setTimeout( function(){
							var ret = self.traverse(cb,order,children[idx], function(){
								if ( idx == 0 && order == TreeTraversalOrder.In ) {
									if ( cb(item) === false ) { 
										return false;
									}
								}
								__eachSerial(idx+1);
							});
							if ( ret === false ) return false;
						},0);
					}
				})(0);
			}
			else
			{
				for ( var i = 0 ; i < children.length; i++ ) {
					if ( this.traverse(cb,order,children[i]) === false ) {
						return false;
					}
					if ( i == 0 && order == TreeTraversalOrder.In ) {
						if ( cb(item) === false ) {
							return false;
						}
					}
				}
			}
			if ( order == TreeTraversalOrder.Post ) {
				if ( cb(item) === false ) {
					return false;
				}
			}
		} else {
			if ( order ) {
				if ( cb(item) === false ) {
					return false;
				}
			}
			if ( endCallback ) {
				endCallback();
			}
		}
	} else {
		var children = this.children;
		if ( children ) {
			if ( endCallback ){
				(function __eachSerial(idx){
					if ( idx == childeren.length ){
						endCallback();
					}
					else
					{
						setTimeout(function(){
							if ( self.traverse(cb,order,children[idx], function(){
								__eachSerial(idx+1);
							}) === false ) {
								endCallback();
							}
						});
					}
				})(0);
			}
			else
			{
				for ( var i = 0 ; i < children.length ; i++ ) {
					if ( this.traverse(cb,order,children[i]) === false ) {
						return false;
					}
				}
			}
		} else if ( endCallback ) {
			endCallback();
		}
	}
};

TreeNode.prototype.path = function(delimit,nameFunc)
{
	delimit = delimit || '/';
	var names = [ (nameFunc && nameFunc(this)) || this.name ];
	var p = this._parent;
	while( p )
	{
		var n = ( nameFunc && nameFunc(p) ) || p.name
		names.unshift( n );		
		p = p._parent;
	}
	return names.join(delimit);
}

TreeNode.prototype.toString = function(delimit)
{
	return this.name;
}

TreeNode.prototype.addChild = function(c)
{
	if ( !this._children )
	{
		this._children = [];
	}
	c._parent = this;
	this._children.push(c);
}

TreeNode.prototype.removeChild = function(c, comparator)
{
	if ( !this._children) return;
	if ( comparator ) {
		for ( var i = 0 ; i < this._children.length ; i++ ) {
			if ( comparator(c,this._children[i]) == 0 ) {
				this._children.splice(idx,1);
				break;
			}
		}
	} else {
		var idx = this._children.indexOf(c);
		if ( idx >= 0 ) {
			this._children.splice(idx,1);
		}
	}
}

function Tree(props)
{
	if ( !arguments.length ) return;
	TreeNode.call( this, props);
	this.properties = props || {};
	this._children = [];
	this._depth = 0;
}

Tree.prototype = new TreeNode();

Tree.prototype.init = function() {
	var children = this.children;
	if ( children ) {
		for ( var i = 0 ; i < children.length ; i++ ) {
			children[i]._root = this;
		}
	}
	this.traverse(function(item){
		item._depth = item._parent ? item._parent._depth + 1 : 0;
		var children = item.children;
		if ( !children || children.length == 0 ) return;
		for ( var i = 0 ; i < children.length; i++ ) {
			children[i]._parent = item;		
		}
	});
};

Tree.prototype.initNode = function(nitem) {
	this.traverse(function(item){
		item._depth = item._parent ? item._parent._depth + 1 : 0;
		var children = item.children;
		if ( !children || children.length == 0 ) return;
		for ( var i = 0 ; i < children.length; i++ ) {
			children[i]._parent = item;		
		}
	}, TreeTraversalOrder.Pre, nitem);
}

Tree.prototype.root = function(value)
{
	if ( value instanceof TreeNode )
	{
		this.properties = value.properties;
		this._children = value._children;
	}
	else if ( Array.isArray(value) )
	{
		this._children = value;
	}
	this.init();
}

Tree.parse = function(item,dictionary, parentNode)
{
	var t = Array.isArray(item) ? new Tree() : new Tree(item,dictionary);
	t._children = [];
	var clist = null;
	var p = parentNode;
	if( Array.isArray(item) ) {
		clist = item;
	} else {
		clist = t.properties.children;
		delete t.properties.children;
		p = t;
	}
	
	if ( !Array.isArray(item) ) {
		for ( var i = 0 ; i < clist.length; i++ ) {
			t._children[i] = new TreeNode.parse(clist[i],dictionary);
			t._parent = p;
			t._children[i]._root = t;
		}
	} else {
		var items = {};
		var idName = dictionary ? dictionary.id : "id";
		var parentIdName = dictionary ? dictionary.parentId : "parentId";
		for ( var i = 0 ; i < clist.length; i++ ) {
			var tn = new TreeNode(clist[i],dictionary);
			items[clist[i][idName]] = tn;
			if ( !clist[i][parentIdName] ) {
				t._children.push(tn);
			} else {
				var p = clist[i][parentIdName] ? items[clist[i][parentIdName]] : undefined;
				if ( p ) {
					if ( !p._children ) {
						p._children = [tn];
					} else {
						p._children.push(tn);
					}
				} 
			}
		}
	}
	t.init();
	return t;
}
	
function Menu(props)
{
	Tree.call( this, props);
}

Menu.prototype = new Tree();

Object.defineProperty( Menu.prototype, 'items', {
	get: function() {
		return this._children;
	}
});

Menu.parseTopMenu = function(data, order)
{
	var i = 0;
	var topMenuItems = (function __convert(plist,depth){
		var list = {};
		var cnt = 0;
		while( i < data.length && cnt < 20 )
		{
			var item = data[i];			
			var mId = item.menuNo;
			var pmId = item.upperMenuNo;
			item.id = mId;
			item.name = item.menuNm || item.menuKoreanNm;
			if ( depth == item.menuLevel )
			{
				list[mId] = new MenuItem(item);
				if (plist[pmId])
				{
					if ( !plist[pmId]._children )
					{
						plist[pmId]._children = [];	
					}		
					plist[pmId]._children.push( list[mId] );
				}
				i++;
			}
			else if ( depth < item.menuLevel )
			{
				__convert(list,depth+1);
			}		
			else
			{
				return list;
			}
			cnt++;
		}
		return list;
	})({},1);
	var menu = new Menu();
	if ( order )
	{
		for ( var i = 0 ; i < order.length ; i++ )
		{
			var item = topMenuItems[ order[i] ];
			if (item)
			{
				menu._children.push( item );
			}
			else
			{
				menu._children.push( new MenuItem({
					name: order[i]
				}));
			}
		}
	}
	else
	{
		for( var k in topMenuItems )
		{
			menu._children.push( topMenuItems[k] );
		}		
	}
	menu.init();
	return menu;
}

function MenuItem(props)
{
	TreeNode.call(this,props);
}

MenuItem.prototype = new TreeNode();

Object.defineProperties ( MenuItem.prototype, 
{
	id: {
		get : function(){
			return item.menuNo;
		}
	},
	name: {
		get: function(){
			return this.properties.name;
		}
	}
});

if ( !String.createUnique )
{
	String.createUnique = function(len) {
		var v = "";
		for ( var i = 0 ; i < len ; i++ ) {
			v += $.consts.alphanumerics[ parseInt(Math.random() * $.consts.alphanumerics.length) ];
		}
		return v;
	}

	String.createUUID = function() {
		// http://www.ietf.org/rfc/rfc4122.txt
		var s = [];
 		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";
		var uuid = s.join("");
    	return uuid;
	}
}


if ( !File.prototype.filename ) {
	Object.defineProperties( File.prototype, {
		filename: {
			get: function() {
				var idx = this.name.lastIndexOf('.');
				return this.name.substring( 0, idx );
			}
		},
		extension: {
			get: function() {
				var idx = this.name.lastIndexOf('.') + 1;
				return this.name.substring( idx );
			}
		},
		hsize: {
			get: function() {
				return humanReadableSize(this.size);
			}
		}
	});
}

