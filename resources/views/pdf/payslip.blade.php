<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Slip Gaji - {{ optional($payroll->user)->name ?? 'Karyawan' }}</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
            font-size: 13px;
            line-height: 1.5;
            color: #334155;
            margin: 40px 50px;
        }
        /* Header Section */
        .header-container {
            width: 100%;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .header-table {
            width: 100%;
        }
        .header-left {
            width: 60%;
        }
        .header-right {
            width: 40%;
            text-align: right;
        }
        .company-name {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .document-title {
            font-size: 18px;
            font-weight: 700;
            color: #2563eb;
            margin: 5px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .period-text {
            color: #64748b;
            font-size: 12px;
            margin-top: 4px;
        }

        /* Employee Info Section */
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 25px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 4px 0;
            vertical-align: top;
        }
        .info-label {
            font-weight: 600;
            color: #475569;
            width: 120px;
        }
        .info-colon {
            width: 15px;
            color: #94a3b8;
        }
        .info-value {
            font-weight: 700;
            color: #0f172a;
        }

        /* Salary Details */
        .salary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .salary-table th {
            background-color: #f1f5f9;
            color: #334155;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 1px;
            padding: 12px 15px;
            text-align: left;
            border-top: 1px solid #cbd5e1;
            border-bottom: 1px solid #cbd5e1;
        }
        .salary-table td {
            padding: 10px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        .section-title {
            font-weight: 700;
            color: #0f172a;
            padding-top: 15px !important;
            padding-bottom: 5px !important;
            border-bottom: none !important;
        }
        .item-name {
            padding-left: 25px !important;
            color: #475569;
        }
        .amount {
            text-align: right;
            font-weight: 500;
        }
        
        /* Highlight specific numbers */
        .basic-salary-row td {
            background-color: #f8fafc;
            font-weight: 700;
        }
        .allowance-color { color: #059669; }
        .deduction-color { color: #dc2626; }

        /* Take Home Pay */
        .thp-container {
            width: 100%;
            margin-top: 30px;
            margin-bottom: 50px;
            page-break-inside: avoid;
        }
        .thp-box {
            float: right;
            width: 350px;
            background-color: #0f172a;
            color: white;
            border-radius: 8px;
            padding: 15px 20px;
        }
        .thp-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 5px;
        }
        .thp-amount {
            font-size: 24px;
            font-weight: 800;
            color: #fff;
        }

        /* Footer / Signatures */
        .footer-container {
            width: 100%;
            margin-top: 60px;
            page-break-inside: avoid;
            clear: both;
        }
        .signature-table {
            width: 100%;
            text-align: center;
        }
        .signature-col {
            width: 50%;
        }
        .signature-title {
            color: #475569;
            font-weight: 600;
            margin-bottom: 70px;
        }
        .signature-line {
            border-bottom: 1px solid #0f172a;
            width: 200px;
            margin: 0 auto 5px auto;
        }
        .signature-name {
            font-weight: 700;
            color: #0f172a;
        }

        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .status-paid { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .status-draft { background-color: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
    </style>
</head>
<body>

    <!-- Header -->
    <div class="header-container">
        <table class="header-table">
            <tr>
                <td class="header-left">
                    <h1 class="company-name">{{ optional($payroll->user->tenant)->name ?? 'TOKONA ERP' }}</h1>
                    <div class="period-text">Sistem HRIS & Penggajian Terintegrasi</div>
                </td>
                <td class="header-right">
                    <h2 class="document-title">SLIP GAJI</h2>
                    <div class="period-text">Periode: {{ date('01 M Y', strtotime($payroll->period_start)) }} - {{ date('t M Y', strtotime($payroll->period_start)) }}</div>
                    <div style="margin-top: 8px;">
                        <span class="status-badge {{ $payroll->status === 'paid' ? 'status-paid' : 'status-draft' }}">
                            {{ $payroll->status === 'paid' ? 'LUNAS' : 'DRAFT' }}
                        </span>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Employee Information -->
    <div class="info-card">
        <table class="info-table">
            <tr>
                <td class="info-label">Nama Karyawan</td>
                <td class="info-colon">:</td>
                <td class="info-value" style="width: 45%;">{{ optional($payroll->user)->name ?? 'Karyawan Tidak Diketahui' }}</td>
                
                <td class="info-label">Jabatan</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ optional($payroll->user)->position ?? 'Staf' }}</td>
            </tr>
            <tr>
                <td class="info-label">Nomor Induk (NIP)</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ optional($payroll->user)->nip ?? '-' }}</td>
                
                <td class="info-label">Cabang</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ $payroll->branch ? $payroll->branch->name : 'Kantor Pusat' }}</td>
            </tr>
            <tr>
                <td class="info-label">ID Transaksi</td>
                <td class="info-colon">:</td>
                <td class="info-value" style="font-family: monospace; font-size: 11px;">#{{ substr($payroll->id, 0, 8) }}</td>
                
                <td class="info-label">Tanggal Cetak</td>
                <td class="info-colon">:</td>
                <td class="info-value">{{ date('d F Y') }}</td>
            </tr>
        </table>
    </div>

    <!-- Salary Details -->
    <table class="salary-table">
        <thead>
            <tr>
                <th>Deskripsi Komponen</th>
                <th class="amount">Nominal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            <tr class="basic-salary-row">
                <td>Gaji Pokok / Basic Salary</td>
                <td class="amount">{{ number_format($payroll->basic_salary, 0, ',', '.') }}</td>
            </tr>
            
            @if($payroll->items->where('type', 'allowance')->count() > 0)
                <tr>
                    <td colspan="2" class="section-title allowance-color">Tunjangan (+) / Allowances</td>
                </tr>
                @foreach($payroll->items->where('type', 'allowance') as $item)
                <tr>
                    <td class="item-name">{{ $item->name }}</td>
                    <td class="amount allowance-color">{{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            @endif

            @if($payroll->items->where('type', 'deduction')->count() > 0)
                <tr>
                    <td colspan="2" class="section-title deduction-color">Potongan (-) / Deductions</td>
                </tr>
                @foreach($payroll->items->where('type', 'deduction') as $item)
                <tr>
                    <td class="item-name">{{ $item->name }}</td>
                    <td class="amount deduction-color">- {{ number_format($item->amount, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            @endif
        </tbody>
    </table>

    <!-- Take Home Pay Highlight -->
    <div class="thp-container">
        <div class="thp-box">
            <div class="thp-label">Total Diterima (Take Home Pay)</div>
            <div class="thp-amount">Rp {{ number_format($payroll->net_salary, 0, ',', '.') }}</div>
        </div>
    </div>

    <!-- Signatures -->
    <div class="footer-container">
        <table class="signature-table">
            <tr>
                <td class="signature-col">
                    <div class="signature-title">Karyawan</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">{{ optional($payroll->user)->name ?? 'Karyawan' }}</div>
                    <div style="color: #64748b; font-size: 11px;">Penerima</div>
                </td>
                <td class="signature-col">
                    <div class="signature-title">Mengetahui,</div>
                    <div class="signature-line"></div>
                    <div class="signature-name">HRD / Finance</div>
                    <div style="color: #64748b; font-size: 11px;">Manajemen</div>
                </td>
            </tr>
        </table>
        
        <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8;">
            Dokumen ini dihasilkan secara otomatis oleh sistem pada {{ date('d-m-Y H:i:s') }} dan sah tanpa tanda tangan basah jika status telah Lunas.
        </div>
    </div>

</body>
</html>
