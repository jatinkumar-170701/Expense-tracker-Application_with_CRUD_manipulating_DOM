const API_BASE_URL = 'https://crudcrud.com/api/d49d225d57d447d1a4718dfdf3bab6ad';

// DOM elements
const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

// Function to generate a unique ID for each transaction
function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

// Function to fetch transactions from the server
async function fetchTransactions() {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    return response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

// Function to add a transaction to the server
async function addTransactionToServer(transaction) {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transaction)
    });
    return response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

// Function to remove a transaction from the server
async function removeTransactionFromServer(id) {
  try {
    await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error removing transaction:', error);
    throw error;
  }
}

// Function to add a transaction to the DOM
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const listItem = document.createElement('li');
  listItem.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  listItem.innerHTML = `
    ${transaction.text} <span>${sign}$${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransactionFromDOM('${transaction._id}')">x</button>
  `;
  list.appendChild(listItem);
}

// Function to remove a transaction from the DOM
function removeTransactionFromDOM(id) {
  list.querySelectorAll('li').forEach(item => {
    if (item.dataset.id === id) {
      item.remove();
    }
  });
}

// Function to update balance, income, and expense values
function updateValues(transactions) {
  const amounts = transactions.map(transaction => transaction.amount);
  const total = amounts.reduce((acc, item) => acc + item, 0).toFixed(2);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => acc + item, 0).toFixed(2);
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => acc + item, 0) * -1).toFixed(2);

  balance.textContent = `$${total}`;
  money_plus.textContent = `$${income}`;
  money_minus.textContent = `$${expense}`;
}

// Initialize the app
async function initApp() {
  let transactions = [];

  // Fetch transactions from the server
  transactions = await fetchTransactions();
  
  // Add transactions to the DOM
  transactions.forEach(addTransactionDOM);
  
  // Update balance, income, and expense values
  updateValues(transactions);

  // Add event listener for form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (text.value.trim() === '' || amount.value.trim() === '') {
      alert('Please add text and amount');
      return;
    }

    const newTransaction = {
      id: generateID(),
      text: text.value.trim(),
      amount: +amount.value.trim()
    };

    // Add transaction to the server
    try {
      const addedTransaction = await addTransactionToServer(newTransaction);
      transactions.push(addedTransaction);
      addTransactionDOM(addedTransaction);
      updateValues(transactions);
      text.value = '';
      amount.value = '';
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  });
}

initApp(); // Call the initApp function to start the application
