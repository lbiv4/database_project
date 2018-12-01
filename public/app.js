//const CreateUser = document.querySelector('.CreateUser');
const processQuery = document.querySelector('.rawQuery')

/*CreateUser.addEventListener('submit', (e) => {
  e.preventDefault()
  const username = CreateUser.querySelector('.username').value
  const password = CreateUser.querySelector('.password').value
  post('/createUser', { username, password })
})*/

processQuery.addEventListener('submit', (e) => {
  console.log('In query listener');
  e.preventDefault();
  const query = document.getElementsByName('query')[0].value;
  post('/rawQuery', { query })
	  .then(res => {
    	  const div = document.getElementById('queryResults');
    	  res.text().then(output => {
    		  if (res.status === 200) {
    		      div.innerHTML = output;
    	      } else {
    	    	  div.innerHTML = output;
    	    	  alert('Query failed')
    	      }
    	  });
	  })
})

function post (path, data) {
  return window.fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}