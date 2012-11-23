$(document).ready(function(){
	TasksModel = Backbone.Model.extend({
		//urlRoot: "//morning-coast-3645.herokuapp.com/api",
		urlRoot: "http://localhost:5000/api",
		idAttribute: '_id',
		silent : true,
		sync: function(method, model, options){  
			options.timeout = 10000;  
			options.dataType = "jsonp";
			//options.dataKeyword = "data";
			options.dataKeyword = false;
			return Backbone.sync(method, model, options);
		}  
	});


	tasksCollection = Backbone.Collection.extend({
		model: TasksModel,
		//url : 'http://morning-coast-3645.herokuapp.com/api',
		url : "http://localhost:5000/api",
		initialize: function() {
			this.name = "tasksCollection";
		},
		sync: function(method, model, options){  
			options.timeout = 10000;  
			options.dataType = "jsonp";
			options.dataKeyword = "data";  
			return Backbone.sync(method, model, options);
		}  
	});

	var Inst = new tasksCollection();

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
			
			/*var data = Inst.fetch({
				error: function(model, response) {
					console.log('fetch error');
				},
				success: function(model, response)  {
					_this.model.items = response;
					myView.render();
				}
			});*/
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
			var items = this.model.items[0].items;
			this.itemsCollection = $();

			if(!items) return false;
			$(this.el).append(_.template($('#task_header_template').html()));

			
			//for(var _i in items){
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
			console.log(e);
		},
		checkNumber: function(e){
			if(!e.currentTarget.firstChild || e.currentTarget.firstChild.length <= 0) return;
			var reg = /([0-9])/gi;
			var val = $(e.currentTarget).children().val().match(reg);
			if(val) val = val.join('')*1;
			$(e.currentTarget).children().val(val ? val : 0)
		},
		addTaskRow: function addTaskRow(e){
			$(this.template(this.rawData)).insertBefore($(e.currentTarget).closest('.view'));
			console.log(this.model.toJSON());
		},
		calcCost: function calcCost(e){
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

	window.tasksModel = new TasksModel();
	var generateTaskTable = new TaskGenerator({model: tasksModel});
	$("#todoapp").html(generateTaskTable.el);

	/*$.ajax({
		url : 'http://morning-coast-3645.herokuapp.com/api/',
		type : 'POST',
		//dataType : 'jsonp',
		data : 'ololo',
		success : function(){
			alert(1);
		}
	})*/
});
