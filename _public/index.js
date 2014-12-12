
var createItem = function(model){

	var node = document.createElement('div');

	var img = document.createElement('img');
	img.src = model.img;

	var tbl = document.createElement('table');
	var attrs = Object.keys(model.spec);
	attrs.forEach(function(e){
		var tr = document.createElement('tr');
		
		var key = document.createElement('td');
		key.textContent = e;
		
		var val = document.createElement('td');
		val.textContent = model.spec[e];
		
		tr.appendChild(key);
		tr.appendChild(val);

		tbl.appendChild(tr);
	});

	var span = document.createElement('span');
	
	var slider = document.createElement('input');
	slider.type = 'range';
	slider.min = 1;
	slider.max = 5;
	
	var current = document.createElement('span');

	node.appendChild(img);
	node.appendChild(tbl);
	node.appendChild(span);
	node.appendChild(slider);
	node.appendChild(current);

	return node;

};

onload = function(){
	var model = {
		'img':'http://ichef.bbci.co.uk/naturelibrary/images/ic/credit/640x395/b/be/bear/bear_1.jpg',
		'spec':{
			'brand':'Hello',
			'jvs':'gel',
			'model':'wtg'
		}
	};
	document.body.appendChild(createItem(model))
};