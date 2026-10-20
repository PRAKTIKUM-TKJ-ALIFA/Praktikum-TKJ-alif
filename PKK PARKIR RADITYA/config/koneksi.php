<?php
$conn = mysqli_connect("localhost","root","","parkir_app");

if(!$conn){
    die("koneksi gagal:" . mysqli_connect_error());
}
?>