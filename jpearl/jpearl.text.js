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

function KoSearchExp()
{
	this._koDicTable = {};
	var values = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
	var valueList = ['가','까','나','다','따','라','마','바','빠','사','싸','아','자','짜','차','카','타','파','하'];
	var code = '가'.charCodeAt(0);
	for ( var i = 0 ; i < values.length; i++ )
	{
		var c = values[i];
		var begin = valueList[i];
		code = begin.charCodeAt(0);
		var until = String.fromCharCode(code + 588 - 1);
		this._koDicTable[c] = '[' + begin + "-" + until + ']';
		for( var j = 0 ; j < 21 ; j++ )
		{
			begin = String.fromCharCode(code);
			until = String.fromCharCode(code+27);
			this._koDicTable[begin] = '[' + begin + '-' + until + ']';
			code+=28;
		}
	}
	this._koDicTable['ㄳ'] = this._koDicTable['ㄱ'] + this._koDicTable['ㅅ'];
	this._koDicTable['ㄵ'] = this._koDicTable['ㄴ'] + this._koDicTable['ㅈ'];
	this._koDicTable['ㅄ'] = this._koDicTable['ㅂ'] + this._koDicTable['ㅅ'];
	this._koDicTable['ㄺ'] = this._koDicTable['ㄹ'] + this._koDicTable['ㄱ'];
	this._koDicTable['ㄻ'] = this._koDicTable['ㄹ'] + this._koDicTable['ㅁ'];
	this._koDicTable['ㄼ'] = this._koDicTable['ㄹ'] + this._koDicTable['ㅂ'];
	this._koDicTable['ㄽ'] = this._koDicTable['ㄹ'] + this._koDicTable['ㅅ'];
	this._koDicTable['ㄾ'] = this._koDicTable['ㄹ'] + this._koDicTable['ㅌ'];
	this._koDicTable['ㅀ'] = this._koDicTable['ㄹ'] + this._koDicTable['ㅎ'];
	this._koDicTable['ㅄ'] = this._koDicTable['ㅂ'] + this._koDicTable['ㅅ'];
	this._lastCharList  = [null, "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", 
					"ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
	this._lastCharOffsets = [undefined, undefined, [1,'ㄱ'], [2,'ㅅ'], 
					undefined, [1,'ㅈ'], [2,'ㅎ'], 
					undefined, undefined,
					[1,'ㄱ'], [2,'ㅁ'],[3,'ㅂ'],[4,'ㅅ'], [5,'ㅌ'],[6,'ㅍ'],[7,'ㅎ'],
					undefined,undefined,[1, 'ㅅ'],undefined, [1, 'ㅅ']];
	if ( arguments.length == 1 )
	{
		this.compile(arguments[0]);	
	}
}

KoSearchExp.prototype._decomposeKoreanChar = function(c)
{
	var code = c.charCodeAt(0) - '가'.charCodeAt(0);
	if ( code > 0 )
	{
		var idx = code%28;
		if ( this._lastCharList[idx] == null ) 
		{
			return this._koDicTable[c];
		}
		var append;
		var p;
		if ( this._lastCharOffsets[idx] )
		{
			append = this._lastCharOffsets[idx][1];
			idx = this._lastCharOffsets[idx][0]; 
			append = this._koDicTable[append];
			p = this._koDicTable[ String.fromCharCode( c.charCodeAt(0) - idx ) ];
		}
		else 
		{
			append = this._koDicTable[this._lastCharList[idx]] + '?';
			p = '[' + String.fromCharCode( c.charCodeAt(0) - idx ) + '-' + c + ']';
		}
		return p + append;
	}
	return this._koDicTable[c] ? this._koDicTable[c] : c;
}

KoSearchExp.prototype.compile = function(query,options)
{
	if ( !query || query.length == 0 )
	{
		delete this._regexp;
		return;
	}
	if ( arguments.length < 2 )
	{
		options = "g";		
	}
	var q;
	var pattern = '';
	var hasPattern = false;
	
	for( var i = 0 ; i < query.length - 1; i++ )
	{
		if ( this._koDicTable[query[i]] )
		{
			pattern += this._koDicTable[query[i]];
			hasPattern = true;
		}
		else
		{
			pattern += query[i];
		}
	}		
	var lastChar = query[query.length-1];
	var p = this._decomposeKoreanChar( lastChar );
	hasPattern = hasPattern || p != lastChar;
	pattern += p;
	this._regexp = new RegExp(pattern, options);	
	return this;
}

KoSearchExp.prototype.source = function()
{
	if ( this._regexp ) {
		return this._regexp.source;
	}
	return undefined;
}

KoSearchExp.prototype.test = function(value)
{
	if ( this._regexp && value ) {
		this._regexp.lastIndex = 0;
		return 	this._regexp.test(value);
	}
	return false;
}

KoSearchExp.prototype.replace = function(value, cb)
{
   	return value && value.replace( this._regexp,  cb );
}

/* Formatter */

$.fn.formatter = function()
{
	$.each( this, function(idx,obj){
		obj = $(obj);
		var type = obj.data('valueType') || 'text';
		var fmt = obj.data('format');
		var mask = obj.data('mask');
		var value = null;
		var tInst = obj.instance();
		if ( tInst && tInst instanceof JPInput ) {
			value = obj.instance().value();
		} else {
			value = obj.text();	
		}
		
		if ( !value ) return ;
		
		switch( type )
		{
			case 'date':
			{
				var date = value instanceof Date ? value : value.trim().parse('date');
                value = date ? date.format(fmt || $.consts.format.date ) : "";
			}
				break;
			case 'datetime':
			{
				var date = value instanceof Date ? value : value.trim().parse('datetime');
				value = date ? date.format(fmt || $.consts.format.datetime ) : "";
			}
				break;
			case 'datediff':
			{
				var date = value instanceof Date ? value : value.parse('datetime');
				value = date ? date.difference() : '';				
			}
				break;
			case 'time':
			{
				if ( typeof value == 'string' ) {
					if ( value.indexOf(':') > 0 ) {
						return
					}
				}
				value = parseInt(value);
				var h = Math.floor(value/3600);
				var m = Math.floor(value/60);
				var s = Math.floor(value%60);
				if ( value > 3600 )
				{
					value = "%02d:%02d:%02d".sprintf( h, m, s );
				}
				else
				{
					value = "%02d:%02d".sprintf( m, s );
				}
			}
				break;
			case 'number_sep':
			case 'currency':
				if ( typeof value == 'string' ) {
					value = value.replace(',', '');
				} 
				value = typeof value == 'number' ? value : parseFloat(value);
				if ( !isNaN(value) )
				{
					value = value.toLocaleString();
				} else {
					value = 0;
				}
				break;
			case 'companyreg': {
				var v = value.match(/(\d{3})-?(\d{2})-?(\d{5})/);
				if ( v ) {
					value = "%s-%s-%s".sprintf(v[1], v[2], v[3]);
				} else {
					value = null;
				}
			}
				break;
			case 'phone':
			{
				var v = value.match(/(\d{2,3})-?(\d{3,4})-?(\d{4})/);
				if ( v ) {
					value = "%s-%s-%s".sprintf(v[1], v[2], v[3]);
				} else {
					value = null;
				}
			}
				break;
			default:
				value = fmt ? fmt.sprintf(value) : value;
				break;
		}

		if ( $(this).hasClass('input') ) 
		{
			$(this).instance().value(value,false);
		}
		else 
		{
			$(this).html(value);
		}
	});
	return this;
}
