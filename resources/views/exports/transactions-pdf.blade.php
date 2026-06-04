<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 4px 0 0 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            text-align: right;
            margin-top: 30px;
            font-size: 10px;
            color: #777;
        }
        .total-box {
            background-color: #f9f9f9;
            font-weight: bold;
            font-size: 12px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Laporan Transaksi Penjualan</h1>
        <p>Cabang: {{ $branchName }} | Dicetak: {{ $generatedAt }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>No. Invoice</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Metode</th>
                <th class="text-right">Subtotal</th>
                <th class="text-right">Diskon</th>
                <th class="text-right">Total</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $t)
                <tr>
                    <td><strong>{{ $t->invoice_number }}</strong></td>
                    <td>{{ $t->created_at->format('d-m-Y H:i') }}</td>
                    <td>{{ $t->customer?->name ?? 'Umum' }}</td>
                    <td>{{ strtoupper($t->payment_method) }}</td>
                    <td class="text-right">Rp {{ number_format($t->subtotal, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($t->discount, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($t->total, 0, ',', '.') }}</td>
                    <td class="text-center">{{ strtoupper($t->status) }}</td>
                </tr>
            @endforeach
            <tr class="total-box">
                <td colspan="6" class="text-right">GRAND TOTAL:</td>
                <td class="text-right">Rp {{ number_format($totalAmount, 0, ',', '.') }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Aplikasi Kasir Tokona POS &copy; {{ date('Y') }}</p>
    </div>

</body>
</html>
