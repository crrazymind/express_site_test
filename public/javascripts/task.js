//var item_template = '<div class="view"><input class="toggle" type="checkbox" <%= done ? \'checked="checked"\' : \'\' %> /><label><%= title %></label><a class="destroy"></a></div><input class="edit" type="text" value="<%= title %>" />';
//var stats_template ='<% if (done) { %><a id="clear-completed">Clear <%= done %> completed <%= done == 1 ? \'item\' : \'items\' %></a><% } %><div class="todo-count"><b><%= remaining %></b> <%= remaining == 1 ? \'item\' : \'items\' %> left</div>';
//var my_Template = 'First name: <input id="first_name"><br/>Last Name: <input id="last_name"><br/><button id="save">Save!</button>';
//var my_Template = 'First name: <input id="first_name"><br/>Last Name: <input id="last_name"><br/><button id="save">Save!</button>';

$(document).ready(function(){

	TasksModel = Backbone.Model.extend({
	  urlRoot: "/task_source",
	  //id : new Date().getTime(),
	  silent : true
	});

	tasksCollection = Backbone.Collection.extend({
		model: TasksModel,
		url : '/task_source',
		initialize: function() {
			this.name = "MyCollection";
		}
	});

	var Inst = new tasksCollection();

	TaskGenerator = Backbone.View.extend({
		template: _.template($('#my_template').html()),
		el: '<div class="app"></div>',
		events: {
			//"change #first_name": "setFirstName",
			"change .item": "itemEditComplete",
			"change .duration": "calcCost",
			//"hover .item":"setFirstName1",
			//"click .edit": "changeTtl",
			//"keydown .cost, .eta, .duration": "checkNumber",
			//"dblclick .title": "changeTtl",
			"click .eta": "showDatapicker",
			"dblclick .item": "changeTtl",
			//"blur .item input": "itemEditComplete",
			"click .save": "save",
			"click .submit-task": "submitModel"

		},

		initialize: function(){
			var _this = this;
			this.name = "TaskGenerator";

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
			this.model.items = Inst.toJSON()[0];
			this.render();
		},
		render: function(){
			var items = this.model.items;
			this.itemsCollection = $();
			if(!items) return;
			var html;
			//$('<div class="new-item-wrapper"><input type="text" /></div>').insertBefore($(this.el));
			$(this.el).append(_.template($('#task_header_template').html()));
			for(var _i in items){
				var item_html = $(this.template(items[_i]));
				item_html.data('saveBtn', item_html.find('button.save'));
				this.itemsCollection = this.itemsCollection.add(item_html);
				$(this.el).append(item_html);
			}
			$(this.el).append(_.template($('#submit-btm-tpl').html()));
			return this;
		},
		checkNumber: function(e){
			if(!e.currentTarget.firstChild.length <= 0) return;
			var reg = /([0-9])/gi;
			var val = $(e.currentTarget).children().val().match(reg);
			if(val) val = val.join('')*1;
			$(e.currentTarget).children().val(val ? val : 0)
		},
		calcCost: function calcCost(e){
			$(e.currentTarget).closest('.view').find('.cost').text($(e.currentTarget).find('input').val()*15);		
		},
		setItem: function(e){
			var val = $(e.currentTarget).val();
			this.model.set({first_name: val});
		},
		showDatapicker: function(e){
			e.stopImmediatePropagation();
			console.log('show calendar');
		},
		changeTtl: function(e){
			var el = this.itemsCollection.find($(e.currentTarget));
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
			//this.model.set({first_name: val});
		},
		itemEditComplete: function(e){
			var el = $(e.currentTarget);
			if(el && el.hasClass('cost') || el.hasClass('eta') || el.hasClass('duration')) this.checkNumber(e);
			var val = $(e.target).val();
			var edit = $('<div class="ttl-holder">'+val+'</div>');
			el.append(edit);
			$(e.target).hide();
			//this.model.set({first_name: val});
		},
		setLastName: function(e){
			var val = $(e.currentTarget).val();
			this.model.set({last_name: val});
		},
		parseData : function (el) {
			var data = {};
			var num = el.find('.id').val();
			var arr = ["title", "duration","cost","eta","link","done"];
			data["task"+ num] = {
				"id": num
			};
			for (var i = arr.length - 1; i >= 0; i--) {
				data["task"+ num][arr[i]] = el.find('.'+arr[i]).text();
			};
			return data;
		},
		submitModel: function submitModel(e){
			console.log(this.model);
			console.log(this.model.toJSON());
			this.model.save();
		},
		save: function(e){
			console.log('save');
			e.preventDefault(); // prevent the button click from posting back to the server
			console.log(this.parseData($(e.currentTarget).closest('.view')));
			this.model.set(this.parseData($(e.currentTarget).closest('.view')));
			//this.model.save(this.parseData($(e.currentTarget).closest('.view')), {success: this.saveSuccess, error: this.saveError});
			console.log('md: ',this.model.toJSON());
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

	tasksModel = new TasksModel();
	generateTaskTable = new TaskGenerator({model: tasksModel});
	$("#todoapp").html(generateTaskTable.el);
});
