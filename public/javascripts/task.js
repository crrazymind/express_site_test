var item_template = '<div class="view"><input class="toggle" type="checkbox" <%= done ? \'checked="checked"\' : \'\' %> /><label><%= title %></label><a class="destroy"></a></div><input class="edit" type="text" value="<%= title %>" />';
var stats_template ='<% if (done) { %><a id="clear-completed">Clear <%= done %> completed <%= done == 1 ? \'item\' : \'items\' %></a><% } %><div class="todo-count"><b><%= remaining %></b> <%= remaining == 1 ? \'item\' : \'items\' %> left</div>';
//var my_Template = 'First name: <input id="first_name"><br/>Last Name: <input id="last_name"><br/><button id="save">Save!</button>';
var my_Template = 'First name: <input id="first_name"><br/>Last Name: <input id="last_name"><br/><button id="save">Save!</button>';

$(document).ready(function(){

    MyModel = Backbone.Model.extend({
    urlRoot: "/task_source",
    id : 123,
    //id : new Date().getTime(),
    silent : true
    });

    MyCollection = Backbone.Collection.extend({
       model: MyModel,
       url : '/task_source',

        initialize: function() {

        }
    });

    var Inst = new MyCollection();

    MyView = Backbone.View.extend({
        template: _.template($('#my_template').html()),

        events: {
          "change #first_name": "setFirstName",
          "change #last_name":"setLastName",
          "click #save": "save"
        },

        initialize: function(){
          var _this = this;
          _.bindAll(this, "saveSuccess", "saveError");

          var data = Inst.fetch({
              error: function(model, response) {
                  console.log('fetch error');
              },
              success: function(model, response)  {
                  _this.model.items = response;
                  myView.render();
              }
          });
          //console.log('args: ', [].splice.call(arguments,0));
        },

        setFirstName: function(e){
            var val = $(e.currentTarget).val();
            this.model.set({first_name: val});
        },

        setLastName: function(e){
            var val = $(e.currentTarget).val();
            this.model.set({last_name: val});
        },

        save: function(e){
            e.preventDefault(); // prevent the button click from posting back to the server
            this.model.save(null, {success: this.saveSuccess, error: this.saveError});
        },

        saveSuccess: function(model, response){
            // do things here after a successful save to the server
        },

        saveError: function(model, response){
            // do things here after a failed save to the server
        },
        render: function(){
            console.log('render', this.model);

            var html;
            for(var _i in this.model.items){
                var item_html = this.template(this.model.items[_i]);
                $(this.el).append($(item_html));
            }
            //var html = _.template(this.template);
        }

    });

    myModel = new MyModel();
    myView = new MyView({model: myModel});
    $("#todoapp").html(myView.el);
});
