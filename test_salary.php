<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/hris/salaries/019eb089-e3b9-71e3-8df4-d742e0aa3198', 'PUT', ['basic_salary' => 5000000]);
$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: \n" . $response->getContent();
