let emailEl = document.getElementById("email");
let passwordEl = document.getElementById("password");
var todoItemEl = document.getElementById("todo-item");

// database
var auth = firebase.auth();
var db = firebase.firestore();

function signUp() {
  console.log(emailEl.value, passwordEl.value);

  firebase
    .auth()
    .createUserWithEmailAndPassword(emailEl.value, passwordEl.value)
    .then((result) => {
      console.log("user signup successfully!", result);
    })
    .catch(function (error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
    });
}

function signIn() {
  firebase
    .auth()
    .signInWithEmailAndPassword(emailEl.value, passwordEl.value)
    .then((result) => {
      console.log("Signed in Successfully");
      console.log(result.user.email);
      redirectToHome();
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      console.log(errorCode);
      console.log(errorMessage);
    });
}

function signOut() {
  firebase
    .auth()
    .signOut()
    .then(function () {
      console.log("Signed out succesfully");
    })
    .catch(function (error) {
      console.log(error);
    });
}

function redirectToHome() {
  localStorage.setItem("userInfo", JSON.stringify(auth.currentUser));
  window.location.href = "home.html";
}

function addTodoItem() {
  console.log(auth.currentUser.uid);

  db.collection("todo")
    .add({
      todo: todoItemEl.value,
      uid: auth.currentUser.uid,
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
      todoItemEl.value = "";
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
}

// -- get all todos
// function getAllTodos() {
//   db.collection("todo")
//     .get()
//     .then((querySnapshot) => {
//       querySnapshot.forEach((doc) => {
//         // console.log(`${doc.id} => ${doc.data().uid}`);
//         console.log(doc.id, doc.data());
//       });
//     });
// }

// --- saving with custom id

// saveWithCustomDocID();
// function saveWithCustomDocID() {
//   db.collection("students").doc("javascript").set({
//     studentName: "ahmed",
//     roll: 333,
//   });
// }

// getting data on specific user
// function getCurrentUserTodos() {
//   db.collection("todo")
//     .where("uid", "==", JSON.parse(localStorage.getItem("userInfo")).uid)
//     .get()
//     .then((querySnapshot) => {
//       querySnapshot.forEach((doc) => {
//         console.log(doc.id, doc.data());
//       });
//     });
// }
var unsubscribe;
function getUserTodosRealtime() {
  unsubscribe = db
    .collection("todo")
    .where("uid", "==", JSON.parse(localStorage.getItem("userInfo")).uid)
    .onSnapshot(function (snapshot) {
      snapshot.docChanges().forEach(function (change) {
        if (change.type === "added") {
          // console.log("New Todo: ", change.doc.data());
          makeListing(change.doc);
        }

        if (change.type === "modified") {
          console.log("Modified todo: ", change.doc.data());
          editFromDOM(change.doc);
        }

        if (change.type === "removed") {
          console.log("Removed todo: ", change.doc.id, change.doc.data());
          deleteFromDOM(change.doc.id);
        }
      });
    });
}

var divListingEl = document.getElementById("listing");

function makeListing(todoItem) {
  // console.log(todoItem.data(), "data", todoItem.id);
  //console.log(todoItem.id);
  var todoObject = todoItem;

  //console.log(todoObject.id);
  var p = document.createElement("p", todoItem.data().todo);
  var paraText = document.createTextNode(todoObject.data().todo);
  p.setAttribute("id", todoObject.id);
  p.appendChild(paraText);

  var editBtn = document.createElement("button");
  var editTextNode = document.createTextNode("edit");
  editBtn.setAttribute("onclick", "editItem(this)");
  editBtn.appendChild(editTextNode);

  var deleteBtn = document.createElement("button");
  deleteTextNode = document.createTextNode("delete");
  deleteBtn.setAttribute("onclick", "deleteTodo(this)");
  deleteBtn.appendChild(deleteTextNode);

  p.appendChild(editBtn);
  p.appendChild(deleteBtn);

  divListingEl.appendChild(p);
}

function deleteTodo(itemToDelete) {
  console.log("item delete", itemToDelete.parentNode);

  var docId = itemToDelete.parentNode.id;
  db.collection("todo")
    .doc(docId)
    .delete()
    .then(function () {
      console.log("Successfully deleted");
    })
    .catch(function (error) {
      console.log("Error removing todo ", error);
    });
}

function deleteFromDOM(id) {
  var itemToDelete = document.getElementById(id);
  itemToDelete.remove();
  console.log(id, itemToDelete);
}

var todoBtnEl = document.getElementById("todoBtn");
var editKey;
function editItem(editTodo) {
  //console.log(editTodo.parentNode.childNodes[0].nodeValue);

  editKey = editTodo.parentNode.id;
  todoItemEl.value = editTodo.parentNode.childNodes[0].nodeValue;
  todoBtnEl.innerHTML = "Save Todo";
  todoBtnEl.setAttribute("onclick", "updateTodo()");
}

function updateTodo() {
  db.collection("todo")
    .doc(editKey)
    .update({
      todo: todoItemEl.value,
    })
    .then(function () {
      todoItemEl.value = "";
      todoBtnEl.innerHTML = "Add Todo";
      todoBtnEl.setAttribute("onclick", "addTodoItem()");
      editKey = undefined;
    });
}

function editFromDOM(doc) {
  var updateItem = document.getElementById(doc.id);

  updateItem.childNodes[0].nodeValue = doc.data().todo;
}

function logoutUser() {
  unsubscribe();
  auth.signOut().then(function () {
    localStorage.clear();
    window.location.href = "./index.html";
  });
}
