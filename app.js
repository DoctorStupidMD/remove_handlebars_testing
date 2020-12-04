/*global jQuery, Handlebars, Router */
'use strict';

/* Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	}); */

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('todos-jquery');
      //this.todoTemplate = App.todoTemplateNoHandle();
      //this.footerTemplate = Handlebars.compile(document.querySelector('#footer-template').innerHTML);
			this.bindEvents();

      new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');      
		},
		bindEvents: function () {
		  document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this));
      document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this));
		  document.getElementById('footer').addEventListener('click', function(event) {
        var elementClicked = event.target;
		    if (elementClicked.id === 'clear-completed') {
		      this.destroyCompleted();
	      	}    
	      }.bind(this));
        
    /*
		 $('#todo-list') 
		 */
      
      document.getElementById('todo-list').addEventListener('change', function(event) {
        var elementChanged = event.target;
        if (elementChanged.className === 'toggle') {
          this.toggle(event);
        }
      }.bind(this));
      document.getElementById('todo-list').addEventListener('dblclick', function(event) {
        var elementDblClicked = event.target;
        if (elementDblClicked.localName === 'label') {
          this.edit(event);
        }
      }.bind(this));
      document.getElementById('todo-list').addEventListener('keyup', function(event) {
        var elementKeyup = event.target;
        if (elementKeyup.className === 'edit') {
          this.editKeyup(event);
        }
      }.bind(this));
      document.getElementById('todo-list').addEventListener('focusout', function(event) {
        var elementFocusOut = event.target;
        if (elementFocusOut.className === 'edit') {
          this.update(event);
        }
      }.bind(this));
      document.getElementById('todo-list').addEventListener('click', function(event) {
        var elementClicked = event.target;
        if (elementClicked.className === 'destroy') {
          this.destroy(event);
        }
      }.bind(this));
      
	 },
		render: function () {
			var todos = this.getFilteredTodos();
      //ocument.querySelector('#todo-list').innerHTML = this.todoTemplateNoHandle(todos);
      //this.todoTemplateNoHandle(todos);
      var todosUl = document.querySelector('ul');
	    todosUl.innerHTML = '';
	    var i;
      var array = array;
      //for (i = 0; i < this.todos.length; i++) {
	      for (i = 0; i < todos.length; i++) {
		  var makeLi = document.createElement('li');
		  var makeDiv = document.createElement('div');
		  var makeInput = document.createElement('input');
		  var makeLabel = document.createElement('label');
		  var makeButton = document.createElement('button');
		  var makeInputTwo = document.createElement('input');

		    if (todos[i].completed === true) {
			    makeLi.className += 'completed';
			    makeInput.setAttribute('checked', '');
		    }

		  makeLi.setAttribute('data-id', todos[i].id);
		  todosUl.appendChild(makeLi);
      makeDiv.className = 'view';
      makeLi.appendChild(makeDiv);
      makeInput.className = 'toggle';
		  makeInput.type = 'checkbox';
		  makeDiv.appendChild(makeInput);
      makeLabel.innerHTML = todos[i].title;
		  makeDiv.appendChild(makeLabel);
      makeButton.className = 'destroy';
		  makeDiv.appendChild(makeButton);
      makeInputTwo.className = 'edit';
      makeInputTwo.setAttribute('value', todos[i].title);
		  makeLi.appendChild(makeInputTwo);
		  }
      if (todos.length > 0) {
        document.querySelector('#main').style.display = 'block';
      } else {
        document.querySelector('#main').style.display = 'none';
      }			

			document.querySelector('#toggle-all').setAttribute('checked', this.getActiveTodos().length === 0);			
			this.renderFooter();

			document.querySelector('#new-todo').focus();			
			util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
      var todos = this.getFilteredTodos();
		  /* var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter */
      /*var template = this.footerTemplateNoHandle({
        activeTodoCount: activeTodoCount,
        activeTodoWord: util.pluralize(activeTodoCount, 'item'),
        completedTodos: todoCount - activeTodoCount,
        filter: this.filter
      }); */
      var footerEl = document.querySelector('footer');
      footerEl.innerHTML = '';
      //var activeTodoCount = activeTodoCount;
      var activeTodoCount = this.getActiveTodos().length;
      var activeTodoWord = util.pluralize(activeTodoCount, 'item');
      var completedTodos = todoCount - activeTodoCount;
      var filter = this.filter;
  
      var makeSpan = document.createElement('span');
      makeSpan.id = 'todo-count';
      footerEl.appendChild(makeSpan);
      var makeStrong = document.createElement('strong');
      makeSpan.appendChild(makeStrong);
      // makeStrong.innerHTML = activeTodoCount;
      makeSpan.innerHTML = '<strong>' + activeTodoCount + '</strong>' + ' ' + activeTodoWord;

      var makeUl = document.createElement('ul');
      makeUl.id = 'filters';
      footerEl.appendChild(makeUl);
      var makeLiAll = document.createElement('li');
      makeUl.appendChild(makeLiAll);
      var makeAAll = document.createElement('a');
      makeLiAll.appendChild(makeAAll);
      var makeLiActive = document.createElement('li');
      makeUl.appendChild(makeLiActive);
      var makeAActive = document.createElement('a');
      makeLiActive.appendChild(makeAActive);
      var makeLiCompleted = document.createElement('li');
      makeUl.appendChild(makeLiCompleted);
      var makeACompleted = document.createElement('a');
      makeLiCompleted.appendChild(makeACompleted);
      makeAAll.innerHTML = 'All';
      makeAActive.innerHTML = 'Active';
      makeACompleted.innerHTML = 'Completed';
      makeAAll.href = '#/all';
      makeAActive.href = '#/active';
      makeACompleted.href = '#/completed';
      
      if (todoCount > 0) {
        //document.querySelector('#footer').innerHTML = this.footerTemplateNoHandle();
        document.querySelector('#footer').style.display = 'block';
      } else {
        //document.querySelector('#footer').innerHTML = this.footerTemplateNoHandle()
        document.querySelector('#footer').style.display = 'none';
      };
      
      if (this.getCompletedTodos().length > 0) {
        var makeClearCompletedButton = document.createElement('button');
        footerEl.appendChild(makeClearCompletedButton);
        makeClearCompletedButton.id = 'clear-completed';
        makeClearCompletedButton.innerHTML = 'Clear completed';
      };
      
      if (filter === 'all') {
        makeAAll.className = 'selected';
        return;
      } else if (filter === 'active') {
        makeAActive.className = 'selected';
        return;
      } else if (filter === 'completed') {
        makeACompleted.className = 'selected';
        return;
      };
		},
		toggleAll: function (e) {
      var isChecked = e.target.checked;

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.filter = 'all';
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) {
      var id = el.closest('li').getAttribute('data-id');
      
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
          
				}
			}
		},
		create: function (e) {
      var input = e.target;
      var val = document.querySelector('input').value.trim();

			if (e.keyCode !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

      document.querySelector('input').value = '';

			this.render();
		},
		toggle: function (e) {
			var i = this.indexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.render();
		},
		edit: function (e) {
      var input1 = e.target.closest('li')
      input1.classList.add('editing');
      var input = input1.querySelector('.edit');
      input.focus();
		},
		editKeyup: function (e) {
			if (e.keyCode === ENTER_KEY) {
				e.target.blur();
			}

			if (e.keyCode === ESCAPE_KEY) {
        e.target.setAttribute('abort', true);
        e.target.blur();
			}
		},
		update: function (e) {
			var el = e.target;
      var el2 = el;
      var val = el2.value.trim();

			if (!val) {
				this.destroy(e);
				return;
			}

      if (el2.getAttribute('abort')) {
        el2.setAttribute('abort', false);
			} else {
				this.todos[this.indexFromEl(el)].title = val;
			}

			this.render();
		},
		destroy: function (e) {
			this.todos.splice(this.indexFromEl(e.target), 1);
			this.render();
		}
	};

	App.init();