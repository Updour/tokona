<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tanda Terima Titipan - {{ $consignment->reference_number ?? $consignment->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0 0 5px 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 2px 0;
            font-size: 11px;
            color: #555;
        }
        .info-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .info-table .label {
            font-weight: bold;
            width: 120px;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .item-table th, .item-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .item-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .text-right {
            text-align: right !important;
        }
        .text-center {
            text-align: center !important;
        }
        .summary-box {
            border: 1px solid #333;
            padding: 10px;
            margin-bottom: 30px;
            background-color: #f9f9f9;
        }
        .summary-box p {
            margin: 5px 0;
        }
        .signature-area {
            width: 100%;
            margin-top: 50px;
            display: table;
        }
        .signature-box {
            display: table-cell;
            width: 50%;
            text-align: center;
        }
        .signature-line {
            width: 80%;
            border-bottom: 1px solid #333;
            margin: 60px auto 10px auto;
        }
        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
        }
        .status-active { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }
        .status-settled { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TANDA TERIMA BARANG TITIPAN</h1>
        <p>{{ $consignment->tenant->name ?? 'Toko' }}</p>
        <p>Cabang: {{ $consignment->branch->name ?? '-' }}</p>
    </div>

    <table class="info-table">
        <tr>
            <td class="label">No. Referensi</td>
            <td>: {{ $consignment->reference_number ?? substr($consignment->id, 0, 8) }}</td>
            <td class="label">Status</td>
            <td>: 
                @if($consignment->status === 'active')
                    <span class="status-badge status-active">Berjalan (Belum Setor)</span>
                @else
                    <span class="status-badge status-settled">Selesai (Sudah Setor)</span>
                @endif
            </td>
        </tr>
        <tr>
            <td class="label">Nama Supplier</td>
            <td>: <strong>{{ $consignment->supplier->name ?? '-' }}</strong></td>
            <td class="label">Tanggal Titip</td>
            <td>: {{ $consignment->consignment_date ? \Carbon\Carbon::parse($consignment->consignment_date)->format('d M Y') : \Carbon\Carbon::parse($consignment->created_at)->format('d M Y') }}</td>
        </tr>
        <tr>
            <td class="label">Penerima</td>
            <td>: Kasir / Admin</td>
            <td class="label">Jatuh Tempo</td>
            <td>: <strong>{{ $consignment->due_date ? \Carbon\Carbon::parse($consignment->due_date)->format('d M Y') : '-' }}</strong></td>
        </tr>
        @if($consignment->notes)
        <tr>
            <td class="label">Catatan</td>
            <td colspan="3">: {{ $consignment->notes }}</td>
        </tr>
        @endif
    </table>

    <table class="item-table">
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="45%">Nama Produk</th>
                <th width="15%" class="text-center">Qty Terima</th>
                @if($consignment->status === 'settled')
                    <th width="10%" class="text-center">Laku</th>
                    <th width="10%" class="text-center">Retur</th>
                @endif
                <th width="20%" class="text-right">Harga Pokok</th>
                @if($consignment->status === 'settled')
                    <th width="20%" class="text-right">Subtotal Laku</th>
                @endif
            </tr>
        </thead>
        <tbody>
            @foreach($consignment->items as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->product->name ?? 'Produk Tidak Diketahui' }}</td>
                <td class="text-center">{{ $item->qty_received }}</td>
                @if($consignment->status === 'settled')
                    <td class="text-center">{{ $item->qty_sold }}</td>
                    <td class="text-center">{{ $item->qty_unsold }}</td>
                @endif
                <td class="text-right">Rp {{ number_format($item->base_cost, 0, ',', '.') }}</td>
                @if($consignment->status === 'settled')
                    <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                @endif
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($consignment->status === 'settled')
    <div class="summary-box">
        <h3 style="margin-top: 0; font-size: 14px;">Ringkasan Setoran</h3>
        <table width="100%">
            <tr>
                <td width="70%">Total Nilai Barang Laku</td>
                <td width="30%" class="text-right">Rp {{ number_format($consignment->items->sum('subtotal'), 0, ',', '.') }}</td>
            </tr>
            @if($consignment->total_discount > 0)
            <tr>
                <td>Potongan / Diskon</td>
                <td class="text-right">- Rp {{ number_format($consignment->total_discount, 0, ',', '.') }}</td>
            </tr>
            @endif
            <tr>
                <td style="font-weight: bold; padding-top: 10px;">Total Pembayaran ke Supplier</td>
                <td class="text-right" style="font-weight: bold; font-size: 14px; padding-top: 10px;">
                    Rp {{ number_format($consignment->total_paid, 0, ',', '.') }}
                </td>
            </tr>
        </table>
    </div>
    @endif

    <p style="text-align: justify; font-size: 10px; color: #666;">
        Tanda terima ini merupakan bukti sah penyerahan barang titipan. Harap simpan dengan baik. Sisa barang yang tidak terjual akan dikembalikan (retur) atau diperpanjang sesuai dengan kesepakatan bersama pada tanggal jatuh tempo.
    </p>

    <div class="signature-area">
        <div class="signature-box">
            <p>Pihak Penerima (Toko)</p>
            <div class="signature-line"></div>
            <p>( ........................................ )</p>
        </div>
        <div class="signature-box">
            <p>Pihak Penyerah (Supplier)</p>
            <div class="signature-line"></div>
            <p>( ........................................ )</p>
        </div>
    </div>
</body>
</html>
