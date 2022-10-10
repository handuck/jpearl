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

function JPNavigatorController(element,props)
{
	JPView.call(this,element,$.extend(true,{

	},props));
	this.element.addClass('navigator');	
	this._stacks = [];
}

$.plugin(JPNavigatorController);

JPNavigatorController.prototype = new JPView();

JPNavigatorController.prototype.push = function(viewCtrl)
{
	if ( this._stacks.length >= 1 )
	{
		var topView = this._stacks[this._stacks.length-1];		
		topView.instance().hide();
	}
	this._stacks.push(viewCtrl);
	this.element.append(viewCtrl);
	viewCtrl.instance().show();
}

JPNavigatorController.prototype.pop = function()
{
	var topView = this._stacks[this._stacks.length-1];		
	topView.instance().hide();
	topView.instance().remove();
	var viewCtrl = this._stacks.pop();
	topView.instance().viewUnload();
	return viewCtrl;
}
