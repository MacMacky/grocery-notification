window.addEventListener('DOMContentLoaded', () => {
  const ulElement = document.querySelector('.grocery-list');
  const submitElement = document.querySelector('.submit');
  const inputElement = document.querySelector('#grocery-input');
  const errorElement = document.querySelector('.error');
  const successElement = document.querySelector('.success');
  let dateSelected = null;


  const showNotificationMessage = (element, errorMessage) => {
    if (element.classList.contains('show')) {
      return;
    }
    element.textContent = errorMessage;
    element.classList.add('show');

    setTimeout(() => {
      element.classList.remove('show');
    }, 2000)
  }

  const datePicker = new easepick.create({
    element: '#datepicker',
    css: [
      "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.0/dist/index.css"
    ],

    zIndex: 10,
    setup(picker) {
      picker.on('select', (e) => {
        dateSelected = e.detail.date;
      })
    }
  });

  ulElement.addEventListener('click', (e) => {
    if (e.target.tagName === 'I') {
      ulElement.removeChild(e.target.closest('li'));
    }
  })

  inputElement.addEventListener('keyup', (e) => {
    const value = e.target.value;

    if (e.keyCode === 13 && value.trim()) {
      const li = document.createElement('li');
      li.classList.add('grocery-list-item');

      const span = document.createElement('span');
      span.classList.add('grocery-item');
      span.textContent = value;

      const icon = document.createElement('i');
      icon.classList.add('uil', 'uil-trash', 'delete-icon');

      li.appendChild(span);
      li.appendChild(icon);

      ulElement.appendChild(li);

      inputElement.value = '';
    }
  });

  submitElement.addEventListener('click', (e) => {
    const groceryItems = [...document.querySelectorAll('span.grocery-item')].map(element => ({
      item: element.textContent
    }));

    if (!dateSelected) {
      return showNotificationMessage(errorElement, 'Please select the grocery date.');
    }

    const date2DaysBefore = new Date(dateSelected.setDate(dateSelected.getDate() - 1));

    if (new Date() > date2DaysBefore) {
      return showNotificationMessage(errorElement, 'Please select a date two days or more after this day.');
    }

    if (!groceryItems.length) {
      return showNotificationMessage(errorElement, 'Please add grocery items.');
    }

    fetch('http://localhost:3000/grocery-schedule', {
      method: 'POST',
      body: JSON.stringify({
        scheduledGroceryDate: dateSelected.toISOString(),
        groceryItems
      }),
      headers: {
        'content-type': 'application/json'
      },
      mode: 'cors'
    })
      .then(resp => resp.json())
      .then((resp) => {

        while (ulElement.lastChild) {
          ulElement.removeChild(ulElement.lastChild);
        }
        showNotificationMessage(successElement, resp.message);
      })
      .catch(e => console.log(e))
  })
})