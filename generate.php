<?php
header('Content-Type: application/json');
include "config.php";

// CHECK CONNECTION
if(!isset($conn)){
  echo json_encode([
    "success" => false,
    "error" => "Database connection missing"
  ]);
  exit;
}

// SAFE INPUT
$name = $_POST['name'] ?? '';
$studentId = $_POST['studentId'] ?? '';
$contact = $_POST['contact'] ?? '';
$department = $_POST['department'] ?? '';
$transaction = $_POST['transaction'] ?? '';

// VALIDATION
if($name == "" || $studentId == "" || $contact == "" || $department == "" || $transaction == ""){
  echo json_encode([
    "success" => false,
    "error" => "Missing fields"
  ]);
  exit;
}

/////////////////////////////////////////////////////
// 🔥 COUNTER ROUTING LOGIC
/////////////////////////////////////////////////////

function getCounter($department, $transaction) {

  // COUNTER A1
  if(in_array($transaction, ["Realising", "Authentication"])){
    return "A1";
  }

  // COUNTER A2
  if(in_array($transaction, ["Requesting", "Inquiry"])){
    return "A2";
  }

  // COUNTER B
  if(in_array($department, ["CCJE", "CHS", "CAS"])){
    return "B";
  }

  // COUNTER C
  if(in_array($department, ["CTED", "CBM"])){
    return "C";
  }

  // COUNTER D
  if(in_array($department, ["CCS", "COE"])){
    return "D";
  }

  return "Z";
}

$counter = getCounter($department, $transaction);

/////////////////////////////////////////////////////
// 🔥 QUEUE NUMBER PER COUNTER
/////////////////////////////////////////////////////

$result = $conn->query("
  SELECT queue_number 
  FROM queue 
  WHERE queue_number LIKE '$counter-%' 
  ORDER BY id DESC 
  LIMIT 1
");

if($result && $result->num_rows > 0){
  $row = $result->fetch_assoc();
  $last = intval(substr($row['queue_number'], 3));
  $next = $last + 1;
} else {
  $next = 1;
}

$queue = $counter . "-" . str_pad($next, 3, "0", STR_PAD_LEFT);

/////////////////////////////////////////////////////
// 🔥 INSERT DATA
/////////////////////////////////////////////////////

$conn->query("INSERT INTO queue 
(name, student_id, contact, department, transaction, queue_number)
VALUES
('$name','$studentId','$contact','$department','$transaction','$queue')");

/////////////////////////////////////////////////////
// 🔥 RETURN RESPONSE
/////////////////////////////////////////////////////

echo json_encode([
  "success" => true,
  "queue" => $queue,
  "counter" => $counter
]);

exit;
?>