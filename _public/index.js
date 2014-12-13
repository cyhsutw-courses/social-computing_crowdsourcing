
var questionModel;
var answerModel;
var currentIndex = -1;

var cams = [];

var createTr = function(name, value){

	var tr = document.createElement('tr');
	
	var key = document.createElement('td');
	key.textContent = name;
	
	var val = document.createElement('td');
	if(name === 'Full Spec.'){
		var link = document.createElement('a');
		link.href = value;
		link.target = '_blank';
		link.textContent = value;
		val.appendChild(link);
	}else{
		val.textContent = value;
	}
	
	tr.appendChild(key);
	tr.appendChild(val);

	return tr;
};

var createItem = function(model){

	var node = document.createElement('div');
	$(node).addClass('cam-div');
	node.id = model.id;
	var img = document.createElement('img');
	img.src = model.img;
	img.height = '110';

	var form = document.createElement('form');
	form.name = 'rating';

	for (var i=0; i<5; i++){
		var radio = document.createElement('input');
		radio.type = 'radio';
		radio.value = String(i+1);
		radio.name= 'rating';
		var rid = 'rating_'+String(i+1);
		radio.id = rid;

		if(i==0){
			var label = document.createElement('label');
			label.for = rid;
			label.textContent = 'Not at all';
			form.appendChild(label);
			form.appendChild(radio);
		}else if(i==4){
			var label = document.createElement('label');
			label.for = rid;
			label.textContent = 'Highly Recommend';
			form.appendChild(radio);
			form.appendChild(label);
		}else{
			form.appendChild(radio);
		}
	}

	var tbl = document.createElement('table');
	tbl.border = 1;
	var attrs = Object.keys(model.spec);


	

	tbl.appendChild(createTr('Brand', model.spec.brand));
	tbl.appendChild(createTr('Model', model.spec.model));
	tbl.appendChild(createTr('Mega Pixels', model.spec.mp));
	tbl.appendChild(createTr('Resolution', model.spec.res));
	tbl.appendChild(createTr('Sensor', model.spec.sensor));
	tbl.appendChild(createTr('Auto Focus', model.spec.af));
	tbl.appendChild(createTr('Flash', model.spec.flash));
	tbl.appendChild(createTr('Focal', model.spec.focal));
	tbl.appendChild(createTr('Optical Zoom', model.spec.opt_zoom));
	tbl.appendChild(createTr('ISO', model.spec.ISO));
	tbl.appendChild(createTr('LCD Display', model.spec.display));
	tbl.appendChild(createTr('Display Size', model.spec.display_size));
	tbl.appendChild(createTr('Volume', model.spec.size));
	tbl.appendChild(createTr('Weight', model.spec.weight));
	tbl.appendChild(createTr('Release', model.spec.year));
	tbl.appendChild(createTr('Full Spec.', model.spec.url));


	var span = document.createElement('span');
	span.textContent = 'How would you recommend this camera?';

	var submit = document.createElement('input');
	submit.type ='button';
	submit.value = 'NEXT';

	$(submit).click(buildTask);
	
	
	

	node.appendChild(img);
	node.appendChild(tbl);
	node.appendChild(span);
	node.appendChild(form);
	node.appendChild(submit);
	

	return node;

};

var createUser = function(e){
	var genderV = $('#info input[type=radio]:checked').val();
	
	if(!genderV){
		$("#dialog").prop('title', 'Incomplete Data!');
		$("#dialog").html('Please select your gender!');
		$("#dialog").dialog({modal: true});
		return;
	}

	var txt = $('#info textarea[name=concern]').val();
	if(txt.replace(/\s/ig, '').length <= 0){
		$("#dialog").prop('title', 'Incomplete Data!');
		$("#dialog").html('Please provide your considerations when buying a digital camera!');
		$("#dialog").dialog({modal: true});
		return;
	}

	$.ajax({
		url: '/users',
		type: 'POST',
		data: {
			gender: genderV,
			concern: txt
		},
		dataType: 'json',
		success: function(data){
			loadTasks(data);
		},
		error: function(data){
			console.log(data);
		}
	});



};

var loadTasks = function(data){
	questionModel = data;
	currentIndex = -1;
	cams = [];
	answerModel = {};
	answerModel.taskId = questionModel.taskId;
	answerModel.userId = questionModel.userId;
	answerModel.cams = [];

	$('#info-wrapper').hide();
	
	for (var i=0; i< data.cams.length; i++){
		var ele = createItem(data.cams[i]);
		cams.push(ele);
		//$('#vote1').append(ele);
	}

	buildTask(undefined);
	
	$('#vote1').show();

	$("#dialog").prop('title', 'Instructions');
	$('#dialog').html('Please rate the camera based on the data provided.<br/>You may click the link if you need detailed descriptions.<br>When you\'ve done the task, click "NEXT" to load the next HIT.');
	$("#dialog").dialog({modal: true});

};

var buildTask = function(e){
	
	if(currentIndex >= 0 && currentIndex < 5){
		var rating = $('#vote1 input[name=rating]:checked').val();
		if(!rating){
			$("#dialog").prop('title', 'Incomplete Data!');
			$('#dialog').html('Please rate this camera!');
			$("#dialog").dialog({modal: true});
			return;
		}else{
			var ans = {
				id: questionModel.cams[currentIndex].id,
				t1Score: parseInt(rating)
			};
			answerModel.cams.push(ans);
		}
	}else if (currentIndex == 5){
		var scores = {};
		for(var i=0; i < questionModel.cams.length; i++){
			var cam = questionModel.cams[i];
			var node = $('#'+cam.id);
			var t2Score = $(node).find('input[name=rating]:checked').val();
			if(!t2Score){
				$("#dialog").prop('title', 'Incomplete Data!');
				$("#dialog").html('Please rate these 5 cameras!');
				$("#dialog").dialog({modal: true});				
				return;
			}else{
				scores[cam.id] = parseInt(t2Score);
			}
		}

		for(var i=0; i<answerModel.cams.length; i++){
			var ansId = answerModel.cams[i].id;
			answerModel.cams[i].t2Score = scores[ansId];
		}

		loadSurveyCode(answerModel);
		return;

	}else if(currentIndex != -1){
		return;
	}
	
	if(currentIndex < 4){
		$('#vote1').empty().append(cams[++currentIndex]);
		$('#title').html('Step 2 of 3: Rate Cameras (' + String(currentIndex+1) + '/5)');
	}else{
		$('#vote1').empty();
		$('#title').html('Step 3 of 3: Rate Cameras');
		for(var i=0; i < cams.length; i++){
			var node = cams[i];
			$(node).find('input[type=button]').remove();
			$(node).find('input[type=radio]:checked').attr('checked', false);
			$('#vote1').append(node);
		}
		var submit = document.createElement('input');
		submit.type ='button';
		submit.value = 'FINISH';
		$(submit).click(buildTask);
		$('#vote1').append(submit);
		currentIndex++;
		$("#dialog").prop('title', 'Instructions');
		$("#dialog").html('Please rate these 5 cameras again, you may have different ratings on them compared to your previous ratings.<br>Once you\'ve done the tasks, click "FINISH" to observe your survey code.');
		$("#dialog").dialog({modal: true});	
	}

};

var loadSurveyCode = function(model){
	
	$.ajax({
		url: '/tasks',
		type: 'POST',
		data: JSON.stringify(model),
		contentType: 'application/json; charset=UTF-8',
		success: function(data){
			var node = document.createElement('span');
			$(node).addClass('code-head');
			node.textContent = 'Your survey code:';

			var code = document.createElement('div');
			$(code).addClass('code');
			code.textContent = data.code;

			$('#vote1').empty().append(node).append(code);
			$('#title').html('Thank You!');
		},
		error:function(data){
			console.log(data);
		}
	});
};

onload = function(){
	$('#c_user').click(createUser);
	$('#vote1').hide();
	$('#vote2').hide();
};