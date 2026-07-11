<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Jalan {{ $transfer->reference_number }}</title>
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
            margin-bottom: 30px;
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
        .signatures-table {
            width: 100%;
            margin-top: 40px;
        }
        .signatures-table td {
            border: none;
            text-align: center;
            padding-bottom: 60px;
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
                    <span class="title">SURAT JALAN PENGIRIMAN</span><br>
                    <strong>No. Referensi: {{ $transfer->reference_number }}</strong>
                </td>
                <td class="text-right">
                    <strong>Status: {{ strtoupper($transfer->status) }}</strong>
                </td>
            </tr>
        </table>

        <table class="details-table">
            <tr>
                <td width="20%"><strong>Cabang Pengirim:</strong></td>
                <td width="30%">{{ $transfer->sourceBranch?->name ?? 'Cabang Utama' }}</td>
                <td width="20%"><strong>Cabang Penerima:</strong></td>
                <td width="30%">{{ $transfer->destinationBranch?->name ?? 'Cabang Tujuan' }}</td>
            </tr>
            <tr>
                <td><strong>Tanggal Kirim:</strong></td>
                <td>{{ $transfer->sent_at ? \Carbon\Carbon::parse($transfer->sent_at)->format('d M Y H:i') : '-' }}</td>
                <td><strong>Tanggal Diterima:</strong></td>
                <td>{{ $transfer->received_at ? \Carbon\Carbon::parse($transfer->received_at)->format('d M Y H:i') : '-' }}</td>
            </tr>
            <tr>
                <td><strong>Operator Kirim:</strong></td>
                <td>{{ $transfer->creator?->name ?? '-' }}</td>
                <td><strong>Penerima:</strong></td>
                <td>{{ $transfer->receiver?->name ?? '-' }}</td>
            </tr>
            @if($transfer->notes)
            <tr>
                <td><strong>Catatan:</strong></td>
                <td colspan="3">{{ $transfer->notes }}</td>
            </tr>
            @endif
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Item Produk</th>
                    <th width="20%">SKU</th>
                    <th class="text-right" width="20%">Qty Dikirim</th>
                    <th class="text-right" width="20%">Qty Diterima</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transfer->items as $item)
                    <tr>
                        <td>
                            <strong>{{ $item->product?->name ?? 'Produk Tidak Ditemukan' }}</strong>
                        </td>
                        <td>
                            {{ $item->product?->sku ?? '-' }}
                        </td>
                        <td class="text-right">{{ $item->shipped_qty }}</td>
                        <td class="text-right">{{ $transfer->status === 'DRAFT' || $transfer->status === 'SHIPPED' ? '-' : $item->received_qty }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <table class="signatures-table">
            <tr>
                <td width="33%">
                    Pengirim,<br><br><br><br>
                    (................................)
                </td>
                <td width="33%">
                    Sopir / Kurir,<br><br><br><br>
                    (................................)
                </td>
                <td width="33%">
                    Penerima,<br><br><br><br>
                    (................................)
                </td>
            </tr>
        </table>

        <div class="footer">
            <p>Dokumen Surat Jalan ini dicetak secara otomatis pada {{ $generatedAt }}</p>
        </div>
    </div>

</body>
</html>
