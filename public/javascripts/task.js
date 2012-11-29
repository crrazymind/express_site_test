taskList = window.taskList = {
	name : "global taskList namespace"
}
$(document).ready(function(){
	TasksModel = Backbone.Model.extend({
		idAttribute: '_id',
		silent : true,
		sync: ownSync,
		initialize: function(){
			console.log("model initialize");
		},
		defaults: function() {
          return {
          	title: 'task title some other ',
          	_id : '',
          	duration: 0,
          	cost: 0,
          	eta: '0/1/0',
          	link: 'http://localhost',
          	done: false
          };
      	}
	});

	var methodMap = {
		'create': 'POST',
		'update': 'PUT',
		'delete': 'DELETE',
		'read':   'GET'
	};

	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};

	function ownSync(method, model, options){
		options.timeout = 10000;  
		options.dataType = "jsonp";
		options.dataKeyword = "items";

	    var type = methodMap[method];

	    options || (options = {});

	    var params = {type: type, dataType: 'jsonp'};
	    if (!options.url) {
	      params.url = getValue(model, 'url') || urlError();
	    }

	    // Ensure that we have the appropriate request data.
	    if (!options.data && model && (method == 'create' || method == 'update')) {
	      params.contentType = 'application/json';
	      params.data = JSON.stringify(model.toJSON());
	    }
	    
	    if((typeof params.data != "undefined") && options.dataKeyword) {
	    	params.data = options.dataKeyword + "=" + params.data;
	    	params.data += "&_method=" + method;
	    }else{
	    	params.data = "_method=" + method;
	    }
	    
	    return $.ajax(_.extend(params, options));
	
	//return Backbone.sync(method, model, options);
	}


	tasksCollection = Backbone.Collection.extend({
		model: TasksModel,
		//url : 'http://morning-coast-3645.herokuapp.com/api',
		url : "http://localhost:5000/api",
		initialize: function() {
			this.name = "tasksCollection";
			console.log("Collection initialize");
		},
		sync: ownSync
	});


	

	TaskGenerator = Backbone.View.extend({
		template: _.template($('#my_template').html()),
		el: '<div class="app"></div>',
		events: {
			"change .duration": "calcCost",
			"click .eta": "showDatapicker",
			"click .add-one": "addTaskRow",
			"dblclick .item": "changeTtl",
			"blur .item input": "itemEditComplete",
			"change .item": "save",
			"click .save": "save",
			"click .submit-task": "submitModel"
		},
		initialize: function(){
			var _this = this;
			this.name = "TaskGenerator";
			this.rawData = {title: 'task title some other ', _id : '', duration: 0, cost: 0, eta: '0/1/0', link: 'http://localhost', done: false};
			_.bindAll(this, "saveSuccess", "saveError", "reset");
			Inst.bind('reset', this.reset); // binds method to the collection .fetch sucess callback
			Inst.bind('error', this.fetchError);
			Inst.fetch();
			//console.log('args: ', [].splice.call(arguments,0));
		},
		fetchError: function(model, response) {
			console.log('fetch error ', response);
		},
		reset: function(){ // fetch callback / don't know if rename
			this.model.items = Inst.toJSON();
			this.render();
		},
		render: function(){
			console.log(this.model);
			var items = this.model.items[0].items;
			this.itemsCollection = $();
			if(!items) return false;
			$(this.el).append(_.template($('#task_header_template').html()));
			for(var _i=0; _i < items.length; _i++){
				var item_html = $(this.template(items[_i]));
				item_html.data('saveBtn', item_html.find('button.save'));
				this.itemsCollection = this.itemsCollection.add(item_html);
				$(this.el).append(item_html);
			}
			$(this.el).append(_.template($('#submit-btm-tpl').html()));
			return this;
		},
		actualizeModel : function(e){
			console.log("actualizeModel ", e);
		},
		checkNumber: function(e){
			if(!e.currentTarget.firstChild || e.currentTarget.firstChild.length <= 0) return;
			var reg = /([0-9])/gi;
			var val = $(e.currentTarget).children().val().match(reg);
			if(val) val = val.join('')*1;
			$(e.currentTarget).children().val(val ? val : 0)
		},
		addTaskRow: function (e){
			$(this.template(this.model.defaults())).insertBefore($(e.currentTarget).closest('.view'));
			console.log("addTaskRow", this.model.changed);
		},
		calcCost: function (e){
			$(e.currentTarget).closest('.view').find('.cost').text($(e.currentTarget).find('input').val()*15);		
		},
		showDatapicker: function(e){
			e.stopImmediatePropagation();
			console.log('show calendar');
		},
		changeTtl: function(e){
			var el = $(e.currentTarget);
			if(el.hasClass('eta') || el.hasClass('edit') || el.hasClass('buttons')) return;
			var val = el.text();
			el.empty();
			var edit = el.find('input');
			if(edit.length > 0){
				edit.val(val);
				edit.show();
			}else{
				edit = $('<input type="text" value="'+val+'"/>');
				el.append(edit);
			}
			edit.focus();
		},
		itemEditComplete: function(e){
			var el = $(e.currentTarget).closest('.item');
			if(el && el.hasClass('cost') || el.hasClass('eta') || el.hasClass('duration')) this.checkNumber(e);
			var val = $(e.target).val();
			el.text(val);
			$(e.target).remove();
		},
		parseData : function (el) {
			var data = {};
			var num = el.find('._id').val();
			var arr = ["duration","cost","eta","link","done","_id","title"];
			/*data["task"+ num] = {
				"id": num
			};
			for (var i = arr.length - 1; i >= 0; i--) {
				data["task"+ num][arr[i]] = el.find('.'+arr[i]).text();
			};*/
			for (var i = arr.length - 1; i >= 0; i--) {
				data[arr[i]] = el.find('.' + arr[i]).text();
			};
			if(data['done'] == "") data['done'] = false;
			data['_id'] = num;
			return data;
		},
		submitModel: function submitModel(e){
			console.log('model save: ', this.model.toJSON());
			this.model.save({success: this.saveSuccess, error: this.saveError});
		},
		save: function(e){
			var _this = this;
			setTimeout(function(){
				var data = _this.parseData($(e.currentTarget).closest('.view'));
				_this.model.set(data);
			},0);

			//console.log('save: ', data);
			//this.model.save(this.parseData($(e.currentTarget).closest('.view')), {success: this.saveSuccess, error: this.saveError});
			e.preventDefault(); // prevent the button click from posting back to the server
		},

		saveSuccess: function(model, response){
			// do things here after a successful save to the server
			console.log('save callback');
			//console.log(model);
			//$(myView.el).empty();
			//Inst.fetch();
		},

		saveError: function(model, response){
			console.log('smth went ololo!11');
		}
	});

	//window.tasksModel = new TasksModel();
	//var generateTaskTable = new TaskGenerator({model: tasksModel});
	var Inst = new tasksCollection();
	var generateTaskTable = new TaskGenerator();
	$("#todoapp").html(generateTaskTable.el);
});
