taskList = $.taskList = {
	name : "global taskList namespace",
	app : {},
	globalId  : 0
}
//console.log('args: ', [].splice.call(arguments,0));
$(document).ready(function(){

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
		options.timeout = 2000;  
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

	/** application general **/

	$.taskList.AppModel = Backbone.Model.extend({
		idAttribute: '_id',
		silent : true,
		sync: ownSync,
		initialize: function(){
			this.name = "AppModel";
			this.modelId = $.taskList.globalId++;
			//console.log("application model initialize");
		}
	});
	
	$.taskList.tasksCollection = Backbone.Collection.extend({
		model: $.taskList.AppModel,
		url : "http://localhost:5000/api",
		initialize: function(model, options) {
			this.name = "tasksCollection";
		},
		sync: ownSync
	});

	$.taskList.TaskGenerator = Backbone.View.extend({
		template: _.template($('#my_template').html()),
		el: '<div class="app"></div>',
		events: {
			"click .submit-task": "navigate",
			"click .add-one": "addNew"
		},
		initialize: function(){
			var _this = this;
			this.name = "TaskGenerator view";
			_.bindAll(this, "saveSuccess", "saveError", "reset");
			this.model.bind('reset', this.reset);
			this.model.bind('error', this.fetchError);
			this.model.fetch();
		},
		fetchError: function(model, response) {
			console.log('fetch error ', response);
		},
		reset: function(){
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
			var itemModel = new $.taskList.ItemModel(data, this);
			var one = new $.taskList.itemThing(data, itemModel);
			$(this.el).append(one.render().el);
		},
		addNew : function(){
			var newModel = new $.taskList.NewItemModel({}, this);
			newModel.validate();
			var one = new $.taskList.itemThing({}, newModel);
			var newOne = $(one.render().el);
			newOne.insertBefore($(this.el).find('.view:last'));
			//newModel.viewLink.removeEl.hide();
			newOne.hide();
			newOne.slideDown();
		},
		navigate: function(e){
			console.log(this.model);
			$.taskList.AppRouter.navigate("/selected");
			//this.model.save({success: this.saveSuccess, error: this.saveError});
		},
		saveSuccess: function(model, response){
			console.log('save callback');
		},
		saveError: function(model, response){
			console.log('smth went ololo!11');
		}
	});

	/* single item */
	$.taskList.ItemModel = Backbone.Model.extend({
		idAttribute: '_id',
		sync: ownSync,
		urlRoot : "http://localhost:5000/api",
		initialize : function(data, view){
			this.modelId = $.taskList.globalId++;
			this.viewLink = view;
		},
		validate : function(item){
			if(this._id == "") this.id = "new";
			if (typeof this.id == "object") this.id = this.id.$oid;
		}
	});

	$.taskList.NewItemModel = $.taskList.ItemModel.extend({
		defaults: function(){
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
	})

	$.taskList.itemThing = Backbone.View.extend({
		template: _.template($('#my_template').html()),
		el: '<div class="item_hold"></div>',
		events: {
			"click .save": "submitModel",
			"dblclick .item": "changeTtl",
			"click .remove": "remove",
			"change .duration": "calcCost",
			"blur .item input": "itemEditComplete"
		},
		initialize: function(data, model) {
			this.model = model;
			//_.bindAll(this, "saveSuccess", "saveError", "reset");
			_.bindAll(this, 'render');
			this.model.on('destroy', this.unrender, this);
			this.model.on('change', this.modelChangeCallback, this);
		},
		modelChangeCallback : function(add){
			if(this.model.hasChanged){
				this.submitEl.fadeIn();
			}
			//console.log('render_add: ', [].splice.call(arguments,0));
		},
		remove : function(e){
			if(this.model.attributes._id == ""){
				this.$el.slideUp();
				this.model.id = null
				this.model.destroy();
				console.log(this.model);
				return;
			}
			var choise = confirm("are you sure?");
			if(choise){
				this.model.validate();
				this.model.destroy({success: this.removeSuccess, error: this.removeError});
			}
		},
		unrender : function(){
			var root = this;
			this.$el.slideUp(600, function(){
				root.$el.remove();
			});
		},
		removeElement : function(e){
			this.unrender();
		},
		removeSuccess: function(model, response){},
		removeError: function(model, response){
			console.log("wtf?11 - removeError" , this);
		},
		render: function(data) {
			var elCode = $(this.template(this.model.toJSON()));
			this.$el.append(elCode);
			this.submitEl = this.model.viewLink.submitEl = elCode.find(".save");
			this.removeEl = this.model.viewLink.removeEl= elCode.find(".remove");
			this.submitEl.hide();
			return this;
		},
		submitModel: function(e){
			if(this.model.hasChanged()) this.model.save({success: this.saveSuccess, error: this.saveError});
		},
		saveSuccess: function(model, response){
			console.log('ЗБС bro!');
			this.viewLink.submitEl.fadeOut();
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
			for (var i = arr.length - 1; i >= 0; i--) {
				data[arr[i]] = el.find('.' + arr[i]).text();
			};
			if(data['done'] == "") data['done'] = false;
			data['_id'] = num;
			return data;
		},
		checkNumber: function(e){
			if(!e.currentTarget || e.currentTarget.length <= 0) return;
			var reg = /([0-9])/gi;
			var val = $(e.currentTarget).val().match(reg);
			if(val) val = val.join('')*1;
			$(e.currentTarget).val(val ? val : 0)
		},
		calcCost: function (e){
			$(e.currentTarget).closest('.view').find('.cost').text($(e.currentTarget).find('input').val()*15);		
		},
		itemEditComplete: function(e){
			var el = $(e.currentTarget).closest('.item');
			var hold = $(e.currentTarget).closest('.view');
			if(el && el.hasClass('cost') || el.hasClass('eta') || el.hasClass('duration')) this.checkNumber(e);
			var val = $(e.target).val();
			el.text(val);
			$(e.target).remove();
			var data = this.parseData(hold);
			this.model.set(data);
		}
	});
});

$(window).load(function(){
	//http://localhost:3000/task/#/views/10
    var AppRouter = Backbone.Router.extend({
        routes: {
            "views/:id": "getView",
            "selected": "renderSelected",
            "*actions": "defaultRoute"
        }
    });
    // Instantiate the router
    var app_router = $.taskList.app.globalAppRouter = new AppRouter;
    app_router.on('route:getView', function (id) {
        // Note the variable in the route definition being passed in here
        console.log('model save: ', $.taskList.AppRouter);
        alert( "Get post number " + id );   
    });
    app_router.on('route:renderSelected', function (id) {
        alert( "selected" );   
    });
    app_router.on('route:defaultRoute', function (actions) {
    	var appModel = $.taskList.app.appModel = new $.taskList.tasksCollection;
    	var indexApp = $.taskList.app.globalView = new $.taskList.TaskGenerator({model: appModel});
		$("#todoapp").html(indexApp.el);
    });
    // Start Backbone history a necessary step for bookmarkable URL's
    Backbone.history.start();
})
	/*$.taskList.NewItemModel = Backbone.Model.extend({
		idAttribute: '_id',
		initialize: function(data, view){
			console.log("new item model initialize");
			this.viewLink = view;
			this.modelId = $.taskList.globalId++;
		},
		defaults: function(){
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
	});*/