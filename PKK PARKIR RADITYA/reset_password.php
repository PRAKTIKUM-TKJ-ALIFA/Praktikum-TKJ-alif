<?php
require_once 'config/koneksi.php';

$username = 'admin';
$new_password = 'admin123';
$hashed = password_hash($new_password, PASSWORD_DEFAULT);

// Update password
$stmt = mysqli_prepare($conn, "UPDATE users SET password = ? WHERE username = ?");
mysqli_stmt_bind_param($stmt, 'ss', $hashed, $username);
mysqli_stmt_execute($stmt);
$affected = mysqli_stmt_affected_rows($stmt);
mysqli_stmt_close($stmt);

if ($affected > 0) {
    echo "<h2 style='color:green;font-family:Arial'>✅ Password berhasil diupdate!</h2>";
    echo "<p style='font-family:Arial'>Username: <strong>admin</strong><br>Password baru: <strong>admin123</strong></p>";
    echo "<a href='login.php' style='font-family:Arial;color:#4f46e5'>→ Ke halaman Login</a>";
} else {
    // User belum ada, insert dulu
    $stmt2 = mysqli_prepare($conn, "INSERT INTO users (username, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?");
    mysqli_stmt_bind_param($stmt2, 'sss', $username, $hashed, $hashed);
    mysqli_stmt_execute($stmt2);
    mysqli_stmt_close($stmt2);

    echo "<h2 style='color:green;font-family:Arial'>✅ User admin dibuat / password direset!</h2>";
    echo "<p style='font-family:Arial'>Username: <strong>admin</strong><br>Password: <strong>admin123</strong></p>";
    echo "<a href='login.php' style='font-family:Arial;color:#4f46e5'>→ Ke halaman Login</a>";
}
?>
