taskList = $.taskList = {
	name : "global taskList namespace"
}
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
		model : $.taskList.ItemModel,
		el: '<div class="item_hold"></div>',
		initialize: function() {
	      this.model.bind('change', this.render, this);
	      this.model.bind('destroy', this.remove, this);
	    },
	    render: function() {
	      //this.$el.html(this.template(this.model.toJSON()));
	      //this.$el.toggleClass('done', this.model.get('done'));
	      //this.input = this.$('.edit');
	      return this;
	    }
		/*
			for(var _i=0; _i < items.length; _i++){
				var item_html = $(this.template(items[_i]));
				item_html.data('saveBtn', item_html.find('button.save'));
				this.itemsCollection = this.itemsCollection.add(item_html);
				$(this.el).append(item_html);
			}

		*/
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
			this.rawData = {title: 'task title some other ', _id : '', duration: 0, cost: 0, eta: '0/1/0', link: 'http://localhost', done: false};
			_.bindAll(this, "saveSuccess", "saveError", "reset");
			this.model.bind('reset', this.reset); // binds method to the collection .fetch sucess callback
			this.model.bind('error', this.fetchError);
			this.model.fetch();
			//console.log('args: ', [].splice.call(arguments,0));
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
