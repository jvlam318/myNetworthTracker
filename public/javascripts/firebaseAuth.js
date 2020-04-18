function checkIfLoggedIn() {
  firebase.auth().onAuthStateChanged(function (user) {
    const target = document.getElementById('display')
    if (user) {
      // do logged in stuff
      console.log('User signed in')
      console.log(user)
    } else {
      // do logged out stuff
      console.log('user not signed in')
    }
  })
}

window.onload = function () {
  checkIfLoggedIn();
}

function signOut() {
  firebase.auth().signOut();
  checkIfLoggedIn();
}

function signInWithGoogle() {
  const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
  googleAuthProvider.addScope('profile');
  googleAuthProvider.addScope('email');

  firebase.auth().signInWithPopup(googleAuthProvider)
    .then(function (result) {
      checkIfLoggedIn();
    })
    .catch(function (error) {
      console.log(error)
    })
}
