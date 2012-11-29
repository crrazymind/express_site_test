taskList = $.taskList = {
	name : "global taskList namespace"
}
//console.log('args: ', [].splice.call(arguments,0));
$(document).ready(function(){

	$.taskList.AppModel = Backbone.RelationalModel.extend({
		idAttribute: '_id',
		silent : true,
		sync: ownSync,
		initialize: function(){
			console.log("application model initialize");
		}
	});
	
	$.taskList.ItemModel = Backbone.RelationalModel.extend({
		idAttribute: '_id',
		sync: ownSync,
		urlRoot : "http://localhost:5000/api",
		validate : function(item){
			if (typeof this.id == "object") this.id = this.id.$oid;
		}
	});

	$.taskList.NewItemModel = Backbone.RelationalModel.extend({
		idAttribute: '_id',
		initialize: function(){
			console.log("item model initialize");
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
		//if(prop == "url" && _.isFunction(object[prop])) console.log(object[prop]())
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
	}


	$.taskList.tasksCollection = Backbone.Collection.extend({
		model: $.taskList.AppModel,
		url : "http://localhost:5000/api",
		initialize: function() {
			this.name = "tasksCollection";
			console.log("Collection initialize");
		},
		sync: ownSync
	});

	$.taskList.itemThing = Backbone.View.extend({
		template: _.template($('#my_template').html()),
		model : new $.taskList.ItemModel,
		el: '<div class="item_hold"></div>',
		events: {
			"click .save": "submitModel",
			"dblclick .item": "changeTtl",
			"blur .item input": "itemEditComplete"
		},
		initialize: function(data) {
			_.bindAll(this, 'render', 'render_add');
			this.model.bind('reset', this.render);
			this.model.bind('change', this.render_add); 
			this.model.bind('destroy', this.remove);
			this.model.set(data);
		},
		render_add : function(add){
			console.log('render_add: ', add);
		},
		render: function(data) {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		},
		submitModel: function(e){
			this.model.save({success: this.saveSuccess, error: this.saveError});
		},
		saveSuccess: function(model, response){
			console.log('ЗБС bro!');
		},

		saveError: function(model, response){
			console.log('smth went ololo!11');
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
		itemEditComplete: function(e){
			var el = $(e.currentTarget).closest('.item');
			var hold = $(e.currentTarget).closest('.view');
			if(el && el.hasClass('cost') || el.hasClass('eta') || el.hasClass('duration')) this.checkNumber(e);
			var val = $(e.target).val();
			el.text(val);
			$(e.target).remove();
			var data = this.parseData(hold);
			console.log(data);
			this.model.set(data);
		}
	});
	

	$.taskList.TaskGenerator = Backbone.View.extend({
		template: _.template($('#my_template').html()),
		el: '<div class="app"></div>',
		events: {
			"click .submit-task": "submitModel",
		},
		/*events: {
			"change .duration": "calcCost",
			"click .eta": "showDatapicker",
			"click .add-one": "addTaskRow",
			"dblclick .item": "changeTtl",
			"blur .item input": "itemEditComplete",
			"change .item": "save",
			"click .save": "save",
			"click .submit-task": "submitModel"
		},*/
		initialize: function(){
			var _this = this;
			this.name = "TaskGenerator";
			_.bindAll(this, "saveSuccess", "saveError", "reset");
			this.model.bind('reset', this.reset);
			this.model.bind('error', this.fetchError);
			this.model.fetch();
		},
		fetchError: function(model, response) {
			console.log('fetch error ', response);
		},
		reset: function(){ // fetch callback / don't know if rename
			this.model.items = this.model.toJSON();
			this.render();
		},
		render: function(){
			var items = this.model.items[0].items;
			this.itemsCollection = $();
			if(!items) return false;
			$(this.el).append(_.template($('#task_header_template').html()));
			for(var _i=0; _i < items.length; _i++){
				this.addChild(items[_i]);
			}
			$(this.el).append(_.template($('#submit-btm-tpl').html()));
			return this;
		},
		addChild: function(data){
			var one = new $.taskList.itemThing(data);
			$(this.el).append(one.render().el);
		},
		submitModel: function(e){
			console.log('model save: ', this.model.toJSON());
			console.log('model save: ', this.model);
			this.model.save({success: this.saveSuccess, error: this.saveError});
		},
		/*save: function(e){
			var _this = this;
			setTimeout(function(){
				var data = _this.parseData($(e.currentTarget).closest('.view'));
				_this.model.set(data);
			},0);

			//console.log('save: ', data);
			//this.model.save(this.parseData($(e.currentTarget).closest('.view')), {success: this.saveSuccess, error: this.saveError});
			e.preventDefault(); // prevent the button click from posting back to the server
		},*/

		saveSuccess: function(model, response){
			console.log('save callback');
		},

		saveError: function(model, response){
			console.log('smth went ololo!11');
		}
	});

	//window.AppModel = new AppModel();
	//var generateTaskTable = new TaskGenerator({model: AppModel});
	//var Inst = new tasksCollection();
	var generateTaskTable = new $.taskList.TaskGenerator({model: new $.taskList.tasksCollection});
	$("#todoapp").html(generateTaskTable.el);
});
