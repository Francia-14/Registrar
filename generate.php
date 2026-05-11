<?php
header('Content-Type: application/json');
include "config.php";

if(!isset($conn)){
  echo json_encode([
    "success" => false,
    "error" => "Database connection missing"
  ]);
  exit;
}

$name = $_POST['name'] ?? '';
$studentId = $_POST['studentId'] ?? '';
$contact = $_POST['contact'] ?? '';
$department = $_POST['department'] ?? '';
$transaction = $_POST['transaction'] ?? '';

if($name == "" || $studentId == "" || $contact == "" || $department == "" || $transaction == ""){
  echo json_encode([
    "success" => false,
    "error" => "Missing fields"
  ]);
  exit;
}


function getCounter(string $department, string $transaction): string {

  if(in_array($transaction, ["Authentication"])){
    return "A1";
  }

  if(in_array($transaction, ["Inquiry"])){
    return "A2";
  }

  if(in_array($department, ["CCJE", "CHS", "CAS"])){
    return "B";
  }

  if(in_array($department, ["CTED", "CBM"])){
    return "C";
  }

  if(in_array($department, ["CCS", "COE"])){
    return "D";
  }

  return "Z";
}

$counter = getCounter($department, $transaction);


$result = $conn->query("
  SELECT queue_number 
  FROM queue 
  WHERE queue_number LIKE '$counter-%' 
  ORDER BY id DESC 
  LIMIT 1
");

if($result && $result->num_rows > 0){
  $row = $result->fetch_assoc();

  $parts = explode("-", $row['queue_number']);
  $last = intval($parts[1]);

  $next = $last + 1;
} else {
  $next = 1;
}

$queue = $counter . "-" . str_pad($next, 3, "0", STR_PAD_LEFT);


$stmt = $conn->prepare("INSERT INTO queue 
(name, student_id, contact, department, transaction, queue_number)
VALUES (?, ?, ?, ?, ?, ?)");

$stmt->bind_param("ssssss", $name, $studentId, $contact, $department, $transaction, $queue);

$stmt->execute();


echo json_encode([
  "success" => true,
  "queue" => $queue,
  "counter" => $counter
]);

exit;
?>