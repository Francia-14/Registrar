<?php
header('Content-Type: application/json');
include "config.php";

$name = $_POST['name'];
$studentId = $_POST['studentId'];
$contact = $_POST['contact'];
$department = $_POST['department'];
$service = $_POST['service'];

// GET LAST QUEUE NUMBER
$result = $conn->query("SELECT queue_no FROM queue ORDER BY id DESC LIMIT 1");

if($result && $result->num_rows > 0){
  $row = $result->fetch_assoc();

  $num = intval(substr($row['queue_no'], 2));
  $next = $num + 1;
} else {
  $next = 1;
}

$queue_no = "R-" . str_pad($next, 3, "0", STR_PAD_LEFT);

// INSERT (MATCH QUEUE-SYSTEM TABLE)
$stmt = $conn->prepare("
INSERT INTO queue
(queue_no, name, student_id, department, service, status, time_created)
VALUES (?, ?, ?, ?, ?, 'Waiting', ?)
");

$time = time();

$stmt->bind_param(
  "sssssi",
  $queue_no,
  $name,
  $studentId,
  $department,
  $service,
  $time
);

$stmt->execute();

// RESPONSE
echo json_encode([
  "success" => true,
  "queue" => $queue_no
]);
?>