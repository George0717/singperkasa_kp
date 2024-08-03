# User
- Multi User :
Super Admin => Bisa mengakses semuanya dan melakukan monitoring
Admin => Akses dilakukan oleh personalia untuk membuat user

Pembuatan user : 
- User akan dibuat berdasarkan role => Role akan menyesuaikan sehingga akses akan dibatasi.
- User hanya login => Nama dan Password.

# Sales Order (SO)
- SO akan dibuat ketika pembeli telah mengirimkan PO (Purchase Order)
Isi SO berupa : 
Nama Customer, Alamat Customer, Tanggal PO Customer, No PO Customer, No SO (Bisa dilakukan revisi jika diperlukan).

Detail barang yang di PO :
Qty(Quantity), Barang, Harga, Jumlah
Sub Total : (h6)
- Diskon (Jika ada)
- Uang Muka (Jika ada)
- PPN (isi ppn bisa berubah)

Grand Total = Dikson + Uang Muka + PPN (Format Rupiah)
Jadwal pembayaran : Jenis pembayaran(Date) / waktu pembayaran (Option)
<!-- Cash, Debit/Kredit, Transfer/30 Hari setelah barang diterima -->
Dokumen bisa di cetak berupa PDF

# Jadwal Kirim
- Pilih Customer 
- Pilih nomor SO
- Pilih tanggal + Qty + Barang (Sesuai SO) + Keterangan
Dicetak berupa PDF

# Surat Jalan
- Nama Customer, alamat, nama pabrik, no surat jalan(bisa dilakukan revisi), tanggal pengiriman, plat angkutan.
Isi surat jalan :
- Qty + Nama Barang
- Tanda tangan + Nama Staff
- Tanda tangan + Cap Toko
Dicetak berupa PDF

# Invoice 
- Nama customer, Alamat Customer, Tanggal PO Customer, No PO Customer, Nama Pabrik, Alamat Pabrik, Alamat, Telpon, No Invoice (Bisa revisi)

No Surat Jalan :
Qty, Barang, Harga, Jumlah
No Surat Jalan :
Qty, Barang, Harga, Jumlah

Sub Total :
- Diskon (Jika ada)
- Uang Muka (Jika ada)
- PPN (isi ppn bisa berubah)

Grand Total 
Jadwal pembayaran : Jenis pembayaran / waktu pembayaran 
<!-- Cash, Debit/Kredit, Transfer/30 Hari setelah barang diterima -->
Dokumen bisa di cetak berupa PDF

# Terima pelunasan 
Tanggal, Jenis Pembayaran, No Invoice

# Alert / Peringatan
- SO belum terjadwal
- Barang belum dikirim (Sudah ada / lewat tanggal jadwal pengiriman)
- Surat Jalan belum terinvoice
- Invoice belum lunas (Sudah jatuh tempo)

# Arsip
- Berbentuk Xls
Arsip harus jelas memiliki masing-masing dari yang telah diisi