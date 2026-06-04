<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $transaction->invoice_number }}</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 10px;
        }
        .header-table {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .header-table td {
            border: none;
            padding: 0;
        }
        .title {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .details-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .details-table td {
            border: none;
            padding: 4px 0;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th, .items-table td {
            border: 1px solid #eee;
            padding: 8px;
            text-align: left;
        }
        .items-table th {
            background-color: #f9f9f9;
            font-weight: bold;
        }
        .text-right {
            text-align: right;
        }
        .totals-table {
            width: 300px;
            float: right;
            margin-bottom: 20px;
        }
        .totals-table td {
            border: none;
            padding: 5px 0;
        }
        .totals-table tr.grand-total {
            font-weight: bold;
            font-size: 13px;
            border-top: 1px solid #ddd;
        }
        .footer {
            clear: both;
            text-align: center;
            margin-top: 50px;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
    </style>
</head>
<body>

    <div class="invoice-box">
        <table class="header-table">
            <tr>
                <td>
                    <span class="title">INVOICE PENJUALAN</span><br>
                    <strong>{{ $transaction->invoice_number }}</strong>
                </td>
                <td class="text-right">
                    <strong>{{ $transaction->branch?->name ?? 'Toko Utama' }}</strong><br>
                    {{ $transaction->branch?->code ?? '-' }}
                </td>
            </tr>
        </table>

        <table class="details-table">
            <tr>
                <td width="15%"><strong>Tanggal:</strong></td>
                <td width="35%">{{ $transaction->created_at->format('d M Y H:i') }}</td>
                <td width="15%"><strong>Pelanggan:</strong></td>
                <td width="35%">{{ $transaction->customer?->name ?? 'Pelanggan Umum' }}</td>
            </tr>
            <tr>
                <td><strong>Kasir:</strong></td>
                <td>{{ $transaction->creator?->name ?? '-' }}</td>
                <td><strong>Metode Bayar:</strong></td>
                <td>{{ strtoupper($transaction->payment_method) }}</td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item Produk</th>
                    <th class="text-right" width="15%">Harga Satuan</th>
                    <th class="text-right" width="10%">Qty</th>
                    <th class="text-right" width="20%">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product?->name ?? 'Produk Tidak Ditemukan' }}</strong>
                            @if($item->product?->sku)
                                <br><small style="color: #666">SKU: {{ $item->product->sku }}</small>
                            @endif
                        </td>
                        <td class="text-right">Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                        <td class="text-right">{{ $item->qty }}</td>
                        <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals-table">
            <tr>
                <td>Subtotal:</td>
                <td class="text-right">Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</td>
            </tr>
            @if($transaction->discount > 0)
                <tr>
                    <td>Diskon:</td>
                    <td class="text-right" style="color: red;">- Rp {{ number_format($transaction->discount, 0, ',', '.') }}</td>
                </tr>
            @endif
            @if($transaction->tax > 0)
                <tr>
                    <td>Pajak:</td>
                    <td class="text-right">Rp {{ number_format($transaction->tax, 0, ',', '.') }}</td>
                </tr>
            @endif
            @if($transaction->rounding_diff != 0)
                <tr>
                    <td>Pembulatan:</td>
                    <td class="text-right">Rp {{ number_format($transaction->rounding_diff, 0, ',', '.') }}</td>
                </tr>
            @endif
            <tr class="grand-total">
                <td>GRAND TOTAL:</td>
                <td class="text-right">Rp {{ number_format($transaction->total, 0, ',', '.') }}</td>
            </tr>
            @if($transaction->payment_method !== 'debt')
                <tr>
                    <td>Dibayar:</td>
                    <td class="text-right">Rp {{ number_format($transaction->paid_amount, 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td>Kembalian:</td>
                    <td class="text-right">Rp {{ number_format($transaction->change_amount, 0, ',', '.') }}</td>
                </tr>
            @endif
        </table>

        <div class="footer">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Invoice dicetak secara otomatis pada {{ $generatedAt }}</p>
        </div>
    </div>

</body>
</html>
