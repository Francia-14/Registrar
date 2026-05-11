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

document.getElementById("type").addEventListener("change", function () {

  const formSection = document.getElementById("formSection");
  const transaction = document.getElementById("transaction");

  if (this.value) {
    formSection.style.display = "block";
  } else {
    formSection.style.display = "none";
  }

  transaction.innerHTML = "<option value=''>Select Transaction</option>";

  if (transactions[this.value]) {
    transactions[this.value].forEach(t => {
      let opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      transaction.appendChild(opt);
    });
  }
});


document.getElementById("queueForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const name = document.getElementById("name").value.trim();
  const studentId = document.getElementById("studentId").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const department = document.getElementById("department").value;
  const transaction = document.getElementById("transaction").value;

  if (!type || !name || !studentId || !contact || !department || !transaction) {
    alert("Please complete all fields");
    return;
  }

  let formData = new FormData();

  formData.append("name", name);
  formData.append("studentId", studentId);
  formData.append("contact", contact);
  formData.append("department", department);

  formData.append("service", type + " - " + transaction);

  fetch("generate.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {

    if (!data.success) {
      alert(data.error || "Error generating queue");
      return;
    }

    printTicket(data);

    this.reset();
    document.getElementById("formSection").style.display = "none";

  })
  .catch(err => {
    console.log("ERROR:", err);
    alert("Server connection failed");
  });

});


function printTicket(data) {

  const now = new Date();
  const dateTime = now.toLocaleString();

  let win = window.open("", "", "width=300,height=600");

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
          padding: 6px;
          font-family: monospace;
          text-align: center;
          font-size: 11px;
        }

        .title {
          font-weight: bold;
          color: #1f6b3a;
        }

        .queue {
          font-size: 28px;
          font-weight: bold;
          margin: 10px 0;
        }

        .line {
          border-top: 1px dashed #000;
          margin: 6px 0;
        }

        .small {
          font-size: 10px;
        }
      </style>

    </head>

    <body>

      <div class="title">NAGA COLLEGE FOUNDATION</div>
      <div>Registrar Queue System</div>

      <div class="line"></div>

      <div class="queue">${data.queue}</div>

      <div class="line"></div>

      <div class="small">${dateTime}</div>

      <div class="line"></div>

      <div class="small">${data.queue}</div>

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
