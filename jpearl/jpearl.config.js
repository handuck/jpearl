$.consts = {
	'true': 1,
	'false': 0,
	// y : year, M: month, d: date, h: hours(1-12), 
	// HH: hours(0-23), m: minute, s: second, S: millisecond, 
	// E: day of week(monday), a: AM/PM, z: time zone
	validate: {
		date: /^(\d{2,4})-(\d{1,2})-(\d{1,2})$/,
		cdate: /^(\d{4})(\d{2})(\d{2})$/,
		datetime: /^(\d{2,4})-(\d{1,2})-(\d{1,2}).?(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
		cdatetime: /^(\d{4})(\d{2})(\d{2}) (\d{2}):(\d{2}):(\d{2})$/,
		time: /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
		ctime: /^(\d{2})(\d{2})(\d{2})$/,
		color: /^(#|0x)[\da-fA-F]{6}$/
	},
	format: {
		date: 'Y-m-d',
		datetime: 'Y-m-d H:i:s',
	},
	TreeTraversalOrder: {
		Pre: 0,
		In: 1,
		Post: 2	
	},
	alphanumerics: [],
	extensions: {
		images: [ 'jpg', 'png', 'jpeg' ]
	},
	weeks : [ '일','월','화','수','목','금','토' ],
	input: 'body > input.uploadFile', 
};

(function(){
	var k = 0;
	for ( var i = 0 ; i < 10 ; i++ ) {
		$.consts.alphanumerics[k++] = String.fromCharCode(0x30+i);
	}
	for ( var i = 0 ; i < 26 ; i++ ) {
		$.consts.alphanumerics[k++] = String.fromCharCode(0x41+i);
	}
	for ( var i = 0 ; i < 26 ; i++ ) {
		$.consts.alphanumerics[k++] = String.fromCharCode(0x61+i);
	}
})();

$.configure = {
	isMobile: false,
	OS: undefined,
	isApp: false,
};

(function($){

	var mobileDict = {
		android: 'Android', 
		iPhone: 'iOS', 
		iPad: 'iOS', 
		iPod: 'iOS', 
//		'window': 'IEMobile',
		blackberry: 'BlackBery'
	}

	for( var dev in mobileDict ) {
		var regex = new RegExp( dev, 'i' );
		if ( regex.test(navigator.userAgent) ) {
			$.configure.isMobile = true;
			$.configure.OS = mobileDict[dev];
			$.configure.device = dev;
			if( $.configure.OS == 'iOS' ) {
				$.configure.isApp = window.webkit && window.webkit.messageHandlers ? true : false;
			} else if( $.configure.OS == 'Android' ) {
				$.configure.isApp = navigator.userAgent.includes('wv');			
			}
			break;
		}
	}
	if ( !$.configure.OS ) {
		if ( /Mac OS X/i.test(navigator.userAgent) ) {
			$.configure.OS = "MAC";
			if ( window.webkit && window.webkit.messageHandlers ) {
				$.configure.isMobile = true;
				$.configure.OS = "iOS";
				$.configure.isApp = true;
			}
		} else if ( /Linux/i.test(navigator.userAgent) ) {
			$.configure.OS = "Linux";
		} else if ( /Windows NT/i.test(navigator.userAgent) ) {
			$.configure.OS = "Windows";
		}
	}


	var loadingCount = 0;

	$.ajaxSetup({
		dataType: 'json',
		beforeSend: function(jqXHR,settings) {
			if ( loadingCount == 0 ) 
			{
				waiting = $('<div/>').addClass('jpview loading').appendTo('body');
			}
			else
			{
				waiting = $('.jpview.loading');
			}
			if ( settings.block )
			{
				$('<div/>').addClass('jpview screenblock').insertBefore(waiting);
			}
            loadingCount++;
            $.js.loadingCount = loadingCount;
		},
		complete: function() {
			loadingCount--;
			if ( loadingCount <= 0 ) {
				$('div.jpview.loading').remove();
				$('div.jpview.screenblock').remove();
				loadingCount = 0;
			}
			$.js.loadingCount = loadingCount;
		}
	});
})(jQuery);

Object.freeze($.consts);
Object.freeze($.configure);
