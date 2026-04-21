const API = "http://localhost:3000";

// Add transaction
async function addTransaction() {
  const amount = document.getElementById("amount").value;
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;

  await fetch(API + "/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ amount, type, category })
  });

  loadTransactions();
}

// Load transactions
async function loadTransactions() {
  const res = await fetch(API + "/transactions");
  const data = await res.json();

  const list = document.getElementById("list");
  list.innerHTML = "";

  data.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.type}: ${t.amount} (${t.category})`;
    list.appendChild(li);
  });
}

// Load on start
loadTransactions();