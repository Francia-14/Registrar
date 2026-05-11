const transactions = {
  appointment: [
    "Transcript of Records",
    "Diploma Copy",
    "Certificate Request",
    "Form 137 / SF10"
  ],

  evaluation: [
    "Enrollment Evaluation",
    "Subject Evaluation",
    "Graduation Evaluation",
    "Inquiry",
    "Authentication"
  ]
};

// STEP 1 → TYPE SELECTED
document.getElementById("type").addEventListener("change", function(){

  if(this.value){
    document.getElementById("formSection").style.display = "block";
  }

  // load transactions based on type
  let transaction = document.getElementById("transaction");
  transaction.innerHTML = "<option value=''>Select Transaction</option>";

  if(transactions[this.value]){
    transactions[this.value].forEach(t=>{
      let opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      transaction.appendChild(opt);
    });
  }

});


// STEP 2 → SUBMIT FORM
document.getElementById("queueForm").addEventListener("submit", function(e){
  e.preventDefault();

  let formData = new FormData(this);

  fetch("generate.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())   // IMPORTANT: avoid JSON crash
  .then(data => {

    console.log("RAW RESPONSE:", data);

    let json;

    try {
      json = JSON.parse(data);
    } catch (err) {
      alert("Server returned invalid response. Check PHP.");
      console.log("PARSE ERROR:", err);
      return;
    }

    if(!json.success){
      alert(json.error || "Error generating queue");
      return;
    }

    printTicket(json);

    this.reset();
    document.getElementById("formSection").style.display = "none";

  })
  .catch(err => {
    console.log("FETCH ERROR:", err);
    alert("Cannot connect to server (generate.php)");
  });

});


// STEP 3 → PRINT TICKET
function printTicket(data){

  const now = new Date();
  const dateTime = now.toLocaleString();

  let win = window.open('', '', 'width=300,height=600');

  win.document.write(`
    <html>
    <head>
      <title>Queue Ticket</title>

      <style>
        @page {
          size: 57mm 80mm;
          margin: 0;
        }

        body {
          width: 57mm;
          margin: 0;
          padding: 5px;
          font-family: monospace;
          text-align: center;
          font-size: 11px;
        }

        .title {
          font-weight: bold;
          color: #1f6b3a;
        }

        .queue {
          font-size: 26px;
          font-weight: bold;
          margin: 12px 0;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

      </style>

    </head>

    <body>

      <div class="title">NAGA COLLEGE FOUNDATION</div>
      <div>Registrar Queue System</div>

      <div class="line"></div>

      <div class="queue">${data.queue}</div>

      <div class="line"></div>

      <div>${dateTime}</div>

    </body>
    </html>
  `);

  win.document.close();
  win.focus();

  setTimeout(() => {
    win.print();
    win.close();
  }, 500);

}