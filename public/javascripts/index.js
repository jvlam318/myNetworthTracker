// DOM elements
const btns = document.querySelectorAll('.selection button');
const form = document.querySelector('form');
const error = document.querySelector('.error');
const date = document.querySelector('#date');
const networth = document.querySelector('#networth');
const notes = document.querySelector('#notes');


let selection = 'summary';

btns.forEach(btn => {
  btn.addEventListener('click', e => {
    // get activity
    selection = e.target.dataset.selection;

    // remove and add active class
    btns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    // call update function
    // update(data);
  })
});

// form submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const networthValue = parseInt(networth.value);
  const dateValue = date.value.toString();

  if (dateValue && notes.value && !isNaN(networthValue)) {

    db.collection('networth').add({
      user: 'joe',
      date: dateValue,
      networth: networthValue,
      notes: notes.value
    })
      .then(() => {
        error.textContent = "";
        date.value = "";
        networth.value = "";
        notes.value = "";
      })
  } else {
    error.textContent = 'Please enter valid values before submitting';
  }
});
