var item_template = '<div class="view"><input class="toggle" type="checkbox" <%= done ? \'checked="checked"\' : \'\' %> /><label><%= title %></label><a class="destroy"></a></div><input class="edit" type="text" value="<%= title %>" />';
var stats_template ='<% if (done) { %><a id="clear-completed">Clear <%= done %> completed <%= done == 1 ? \'item\' : \'items\' %></a><% } %><div class="todo-count"><b><%= remaining %></b> <%= remaining == 1 ? \'item\' : \'items\' %> left</div>';


var Store = function(name) {
  this.name = name;
  var store = localStorage.getItem(this.name);
  this.data = (store && JSON.parse(store)) || {};
};

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Model
  // ----------

  var t_Model = Backbone.Model.extend({

    // Default attributes for the item.
    defaults: function() {
      return {
          title: "empty task",
          duration: 0,
          cost:0,
          eta:'1/1/12',
          link:'http://google.com',
          done: false
        }
      },
/*
 defaults: function() {
      return {
        'task_default':{
          title: "empty task",
          duration: 0,
          cost:0,
          eta:'1/1/12',
          link:'http://google.com',
          done: false
        },
        'task_default2':{
          title: "empty task",
          duration: 0,
          cost:0,
          eta:'1/1/12',
          link:'http://google.com',
          done: false
        }
      }
    },

*/
    // Ensure that each todo created has `title`.
    initialize: function() {

      if (!this.get("title")) {
        this.set({"title": this.defaults.title});
        console.log(this.get('title'));
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      console.log('toggle');
      this.save({done: !this.get("done")});
    },

    // Remove this Todo from *localStorage* and delete its view.
    clear: function() {
      this.destroy();
    }
  });


  // Collection
  // ---------------
  // The collection from remote server.
  var t_Collection = Backbone.Collection.extend({

    // Reference to this collection's model.

    //model: Backbone.Model.extend({urlRoot : '/task_source'}),
    model: t_Model,

    url : '/task_source',
    // Save all of the todo items under the `"t_ModelInstance"` namespace.
    //localStorage: new Store("t_ModelInstance-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
      console.log('collection done', this);
      return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the t_ModelInstance in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // t_ModelInstance are sorted by their original insertion order.
    comparator: function(todo) {
      console.log('get: ', todo);
      return todo.get('order');
    }

  });

  // Create global collection
  var t_ModelInstance = new t_Collection;
  // Single Item View
  // --------------

  // The DOM element for a todo item...
  var t_View = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"   : "toggleDone",
      "dblclick .view"  : "edit",
      "click a.destroy" : "clear",
      "mouseenter" : "hover",
      "mouseleave" : "hoverOut",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // The t_View listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **model** and a **t_View** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      console.log('view initialize model: ', this.model);
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },
    hover : function(){
      this.input.css('background-color', '#f00')
    },
    hoverOut : function(){
      this.input.css('background-color', '#fff')
    },
    // Re-render the titles of the todo item.
    render: function() {
      /*var data = this.model.toJSON();
      for(var _i in data){
        this.$el.html(this.template(data[_i]));
      }*/
     /* this.model.toJSON().each(function(){
        console.log($(this));
      });*/
      console.log('view render model: ', this.model);
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      if (!value) this.clear();
      console.log('model: ', this.model);
      this.model.save({title: value});
      this.$el.removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });

  // The Application View
  // ---------------

  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `t_ModelInstance`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting t_ModelInstance that might be saved in *localStorage*.
    initialize: function() {
      
      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];

      t_ModelInstance.bind('add', this.addOne, this);
      t_ModelInstance.bind('reset', this.addAll, this);
      t_ModelInstance.bind('all', this.render, this);

      this.footer = this.$('footer');
      this.main = $('#main');

      t_ModelInstance.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      
      console.log('app render: ', t_ModelInstance);
      var done = t_ModelInstance.done().length;
      var remaining = t_ModelInstance.remaining().length;


      if (t_ModelInstance.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }

      //this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
      var view = new t_View({model: todo});
      console.log('view: ', view)
      //this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the **t_ModelInstance** collection at once.
    addAll: function() {
      ////console.log('addall', t_ModelInstance);
      t_ModelInstance.each(this.addOne);
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      t_ModelInstance.create({title: this.input.val()});
      this.input.val('');
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.each(t_ModelInstance.done(), function(todo){ todo.clear(); });
      return false;
    },

    toggleAllComplete: function () {
      var done = this.allCheckbox.checked;
      t_ModelInstance.each(function (todo) { todo.save({'done': done}); });
    }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
