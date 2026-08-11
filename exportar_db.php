<?php
// ==========================================
// exportar_db.php - EXPORTAR ESTRUCTURA DE LA BASE DE DATOS
// ==========================================
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain; charset=utf-8');
// header('Content-Disposition: attachment; filename="db_schema.sql"'); // Descomentar para descargar como archivo

require_once __DIR__ . '/conexion.php';

try {
    $sql = "-- ==========================================\n";
    $sql .= "-- ESTRUCTURA ACTUAL DE LA BASE DE DATOS\n";
    $sql .= "-- Fecha de generación: " . date('Y-m-d H:i:s') . "\n";
    $sql .= "-- ==========================================\n\n";

    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_NUM);

    foreach ($tables as $row) {
        $table = $row[0];
        $stmt2 = $pdo->query("SHOW CREATE TABLE `$table`");
        $create = $stmt2->fetch(PDO::FETCH_NUM);
        
        $sql .= "-- --------------------------------------------------------\n";
        $sql .= "-- Estructura de tabla para la tabla `$table`\n";
        $sql .= "-- --------------------------------------------------------\n";
        $sql .= "DROP TABLE IF EXISTS `$table`;\n";
        $sql .= $create[1] . ";\n\n";
    }

    echo $sql;

} catch (Exception $e) {
    echo "Error al exportar la base de datos: " . $e->getMessage();
}
?>
