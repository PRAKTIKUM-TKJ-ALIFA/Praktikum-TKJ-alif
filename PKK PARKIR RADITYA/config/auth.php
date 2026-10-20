<?php
/**
 * config/auth.php
 * Shared login logic — dipakai oleh login.php dan login_petugas.php
 *
 * @param  mysqli  $conn
 * @param  string  $username
 * @param  string  $password
 * @param  string  $allowedRole  'admin' | 'petugas'  (petugas = operator|petugas)
 * @return array   ['ok'=>bool, 'error'=>string, 'user'=>array|null]
 */
function doLogin(mysqli $conn, string $username, string $password, string $allowedRole): array
{
    if ($username === '' || $password === '') {
        return ['ok' => false, 'error' => 'Username dan password wajib diisi.', 'user' => null];
    }

    // Deteksi kolom agar kompatibel tabel lama/baru
    $cols      = ['id', 'username', 'password'];
    $hasNama   = $hasRole = $hasStatus = false;

    $colRes = mysqli_query($conn, "SHOW COLUMNS FROM users");
    while ($c = mysqli_fetch_assoc($colRes)) {
        if ($c['Field'] === 'nama')   { $hasNama   = true; $cols[] = 'nama'; }
        if ($c['Field'] === 'role')   { $hasRole   = true; $cols[] = 'role'; }
        if ($c['Field'] === 'status') { $hasStatus = true; $cols[] = 'status'; }
    }

    $stmt = mysqli_prepare($conn,
        "SELECT " . implode(', ', $cols) . " FROM users WHERE username = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, 's', $username);
    mysqli_stmt_execute($stmt);
    $user = mysqli_fetch_assoc(mysqli_stmt_get_result($stmt));
    mysqli_stmt_close($stmt);

    if (!$user) {
        return ['ok' => false, 'error' => 'Username atau password salah.', 'user' => null];
    }

    // Cek status
    if ($hasStatus && ($user['status'] ?? 'aktif') === 'nonaktif') {
        return ['ok' => false, 'error' => 'Akun Anda dinonaktifkan. Hubungi administrator.', 'user' => null];
    }

    // Cek password
    if (!password_verify($password, $user['password'])) {
        return ['ok' => false, 'error' => 'Username atau password salah.', 'user' => null];
    }

    $role = $hasRole ? ($user['role'] ?? 'admin') : 'admin';

    // Validasi role sesuai form yang dipakai
    if ($allowedRole === 'admin' && $role !== 'admin') {
        return ['ok' => false, 'error' => 'Akun ini bukan akun Admin. Gunakan form login Petugas.', 'user' => null];
    }
    if ($allowedRole === 'petugas' && $role === 'admin') {
        return ['ok' => false, 'error' => 'Akun Admin tidak bisa masuk lewat form Petugas. Gunakan form login Admin.', 'user' => null];
    }
    // $allowedRole === 'all' → semua role boleh masuk

    return [
        'ok'    => true,
        'error' => '',
        'user'  => [
            'id'       => $user['id'],
            'username' => $user['username'],
            'nama'     => $hasNama ? ($user['nama'] ?? $user['username']) : $user['username'],
            'role'     => $role,
        ],
    ];
}
