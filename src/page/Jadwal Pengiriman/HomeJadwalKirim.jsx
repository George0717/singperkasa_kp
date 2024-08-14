import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, InputAdornment, Button, Modal, Box, Menu, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { Fade } from '@mui/material';
import dayjs from 'dayjs';
import CurrencyFormat from 'react-currency-format';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(4),
  animation: 'fadeIn 1s ease-in-out',
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const MySwal = withReactContent(Swal);

function HomeJadwalKirim() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRowForMenu, setSelectedRowForMenu] = useState(null);
  const navigate = useNavigate();  // Initialize useNavigate


  const handleMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRowForMenu(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRowForMenu(null);
  };

  const handleOpen = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak dapat mengembalikannya!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform API delete request
        axios.delete(`https://backend-penjualan-blond.vercel.app/jadwalkirim/${selectedRowForMenu._id}`)
          .then(response => {
            // Update local state after successful deletion
            setData(data.filter(item => item._id !== selectedRowForMenu._id));
  
            // Show success message
            MySwal.fire(
              'Terhapus!',
              'Data Anda telah dihapus.',
              'success'
            );
  
            // Close the menu
            handleMenuClose();
          })
          .catch(error => {
            // Handle error
            console.error('Error deleting data:', error);
            MySwal.fire(
              'Terjadi Kesalahan!',
              'Data Anda gagal dihapus.',
              'error'
            );
          });
      }
    });
  };
  

  const handleEdit = () => {
  
    MySwal.fire({
      title: 'Edit Data',
      text: 'Apakah Anda yakin ingin mengedit detail ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Edit',
      cancelButtonText: 'Tidak',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        // Perform data update or any required action here
        const updatedData = data.map(item => {
          if (item._id === selectedRowForMenu._id) {
            return { ...item, pilihCustomer: 'Updated Customer Name' }; // Update as needed
          }
          return item;
        });
        setData(updatedData);
        return selectedRowForMenu; // Return the entire item or other relevant data
      },
      allowOutsideClick: () => !MySwal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        MySwal.fire(
          'Oke',
          'Pindah Halaman',
          'success'
        ).then(() => {
          // Navigate with state
          navigate('/edit-jadwalkirim', { state: { data: result.value } });
        });
      }
    });
  };

  useEffect(() => {
    axios.get('https://backend-penjualan-blond.vercel.app/jadwalkirim')
      .then(response => {
        setData(response.data.data);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const filteredData = data.filter(item => {
    const matchesSearch = item.pilihCustomer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? dayjs(item.pilihTanggal).isSame(dayjs(dateFilter), 'day') : true;
    return matchesSearch && matchesDate;
  });

  const formatDate = (date) => {
    return dayjs(date).format('D MMMM YYYY');
  };

  const formatCurrency = (value) => {
    return (
      <CurrencyFormat
        value={value}
        displayType={'text'}
        thousandSeparator={true}
        prefix={'Rp '}
        renderText={value => <>{value}</>}
      />
    );
  };

  const generatePDF = () => {
    if (!selectedRowForMenu) return;

    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("PT Singa Perkasa", 105, 10, { align: "center" });
    doc.setFontSize(18);
    doc.setFont("Helvetica", "bold");
    doc.text("Laporan Sales Order", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`Nama Pelanggan: ${selectedRowForMenu.pilihCustomer}`, 14, 40);
    doc.text(`Alamat Pelanggan: ${selectedRowForMenu.pilihNomorSo.alamatPelanggan}`, 14, 50);
    doc.text(`Tanggal PO: ${formatDate(selectedRowForMenu.pilihNomorSo.tanggalPO)}`, 14, 60);
    doc.text(`Nomor PO: ${selectedRowForMenu.pilihNomorSo.nomorPO}`, 14, 70);
    doc.text(`Nomor SO: ${selectedRowForMenu.pilihNomorSo.nomorSO}`, 14, 80);
    doc.setLineWidth(0.5);
    doc.line(14, 85, 195, 85);

    const itemsTable = selectedRowForMenu.pilihNomorSo.barang.map((item) => [
      item.kuantitas || 0,
      item.jenisPacking || "",
      item.namaBarang || "",
      (item.harga || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      }),
      ((item.kuantitas || 0) * (item.harga || 0)).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      }),
    ]);

    doc.autoTable({
      startY: 90,
      head: [["Qty", "Jenis Barang", "Item", "Harga", "Total"]],
      body: itemsTable,
      theme: "striped",
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: "center",
      },
      styles: {
        fontSize: 10,
        halign: "center",
        cellPadding: 5,
      },
      margin: { horizontal: 14 },
      tableWidth: "auto",
    });

    // Example totals; adjust as needed
    const subTotal = selectedRowForMenu.pilihNomorSo.totalBayar; 
    const taxAmount = subTotal * 0.15; // Example tax rate
    const grandTotal = subTotal + taxAmount;

    const summaryTable = [
      [
        "Sub Total",
        subTotal.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      ],
      [
        "Diskon",
        "0 IDR", // Example value
      ],
      [
        "Uang Muka",
        "0 IDR", // Example value
      ],
      [
        "Pajak",
        taxAmount.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      ],
      [
        "Grand Total",
        grandTotal.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      ],
      ["Tipe Pembayaran", selectedRowForMenu.pilihNomorSo.tipePembayaran],
      ["Jadwal Pembayaran", formatDate(selectedRowForMenu.pilihNomorSo.jadwalPembayaran)],
    ];

    const yOffset = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("Ringkasan", 105, yOffset, { align: "center" });

    doc.autoTable({
      startY: yOffset + 10,
      head: [["Deskripsi", "Jumlah"]],
      body: summaryTable,
      theme: "striped",
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: "center",
      },
      styles: {
        fontSize: 10,
        halign: "right",
        cellPadding: 5,
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "right" },
      },
      margin: { horizontal: 14 },
      tableWidth: "auto",
    });

    doc.setFontSize(10);
    doc.setFont("Helvetica", "italic");
    doc.text("PT Singa Perkasa", 105, doc.internal.pageSize.height - 10, {
      align: "center",
    });

    const filename = `SalesOrder_${selectedRowForMenu.pilihNomorSo.nomorSO}.pdf`;
    doc.save(filename);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Jadwal Kirim
      </Typography>
      
      <TextField
        label="Cari Pelanggan"
        variant="outlined"
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <TextField
        label="Filter Tanggal"
        variant="outlined"
        type="date"
        fullWidth
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(e) => setDateFilter(e.target.value)}
      />
 <StyledButton
        variant="contained"
        color="primary"
        onClick={() => navigate('/jadwal-pengiriman')} // Button to navigate to /jadwal-pengiriman
      >
        Tambah Data
      </StyledButton>
      <Fade in={true} timeout={1000}>
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tanggal Dikirim</TableCell>
                <TableCell>Pelanggan</TableCell>
                <TableCell>Nomor SO</TableCell>
                <TableCell>Barang</TableCell>
                <TableCell>Total Bayar</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? filteredData.map((row) => (
                <StyledTableRow key={row._id}>
                  <TableCell>{formatDate(row.pilihTanggal)}</TableCell>
                  <TableCell>{row.pilihCustomer}</TableCell>
                  <TableCell>{row.pilihNomorSo.nomorSO}</TableCell>
                  <TableCell>
                    {row.pilihNomorSo.barang.map((barang) => (
                      <div key={barang._id}>
                        {barang.namaBarang} - {barang.kuantitas} {barang.jenisPacking}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{formatCurrency(row.pilihNomorSo.totalBayar)}</TableCell>
                  <TableCell>
                    <StyledButton 
                      variant="contained" 
                      color="primary" 
                      onClick={(e) => handleMenuClick(e, row)}
                    >
                      Aksi
                    </StyledButton>
                  </TableCell>
                </StyledTableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">Data Tidak Ditemukan</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </Fade>

      {selectedRow && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Detail Jadwal Kirim
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <strong>Pelanggan:</strong> {selectedRow.pilihCustomer}<br />
              <strong>Nomor SO:</strong> {selectedRow.pilihNomorSo.nomorSO}<br />
              <strong>Tanggal PO:</strong> {formatDate(selectedRow.pilihNomorSo.tanggalPO)}<br />
              <strong>Alamat Pelanggan:</strong> {selectedRow.pilihNomorSo.alamatPelanggan}<br />
              <strong>Total Bayar:</strong> {formatCurrency(selectedRow.pilihNomorSo.totalBayar)}<br />
              <strong>Barang:</strong>
              {selectedRow.pilihNomorSo.barang.map((barang) => (
                <div key={barang._id}>
                  {barang.namaBarang} - {barang.kuantitas} {barang.jenisPacking}
                </div>
              ))}
            </Typography>
          </Box>
        </Modal>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleOpen(selectedRowForMenu)}>Detail</MenuItem>
        <MenuItem onClick={() => handleEdit()} >Edit</MenuItem>
        <MenuItem onClick={() => handleDelete()} >Hapus</MenuItem>
        <MenuItem onClick={generatePDF}>Generate PDF</MenuItem>
      </Menu>
    </Container>
  );
}

export default HomeJadwalKirim;
