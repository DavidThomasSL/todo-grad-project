var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        complete: false
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.style.fontStyle = todo.complete === true ? "italic" : "normal";
            listItem.style.fontWeight = todo.complete === true ? "normal" : "bold";

            var deleteButton = document.createElement("button");
            deleteButton.textContent = "delete";
            deleteButton.className = "deleteButton";
            deleteButton.addEventListener("click", function() {
                deleteEntry(todo);
            });

            var completeButton = document.createElement("button");
            completeButton.textContent = "complete";
            completeButton.className = "completeButton";
            completeButton.addEventListener("click", function() {
                completeEntry(todo);
            });

            listItem.appendChild(deleteButton);
            listItem.appendChild(completeButton);
            todoList.appendChild(listItem);
        });
    });
}

function deleteEntry(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        if (this.status !== 200) {
            error.textContent = "Failed to delete. Server returned " + this.status + " - " + this.responseText;
            return;
        }
        reloadTodoList();
    };
    createRequest.send();
}

function completeEntry(todo) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.onload = function() {
        if (this.status !== 200) {
            error.textContent = "Failed to update to complete. Server returned " + this.status +
                                " - " + this.responseText;
            return;
        }
        reloadTodoList();
    };
    createRequest.send(JSON.stringify({
        id: todo.id,
        complete: true
    }));
}

reloadTodoList();
