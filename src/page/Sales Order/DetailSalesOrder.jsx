import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,Card, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Container, Grid, Typography, Snackbar, Alert, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet';

const CustomCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 300,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  margin: theme.spacing(2),
}));

const LetterCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[10],
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #ddd',
  maxWidth: 700,
  margin: '0 auto',
}));

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("id-ID", options);
};

const DetailSalesOrder = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [filteredSalesOrders, setFilteredSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('https://backend-penjualan-blond.vercel.app/salesorder')
      .then(response => {
        if (response.data && response.data.penjualanApp && Array.isArray(response.data.penjualanApp.data)) {
          setSalesOrders(response.data.penjualanApp.data);
          setFilteredSalesOrders(response.data.penjualanApp.data);
        } else {
          setError('Format data tidak sesuai');
        }
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Filter salesOrders based on searchTerm
    setFilteredSalesOrders(
      salesOrders.filter(order =>
        order.namaPelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.nomorSO.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.nomorPO.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, salesOrders]);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda tidak akan bisa mengembalikan ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`https://backend-penjualan-blond.vercel.app/salesorder/${id}`)
          .then(response => {
            setSalesOrders(salesOrders.filter(order => order._id !== id));
            setFilteredSalesOrders(filteredSalesOrders.filter(order => order._id !== id));
            setSnackbarMessage('Data Anda telah dihapus.');
            setOpenSnackbar(true);
          })
          .catch(error => {
            setSnackbarMessage('Terjadi kesalahan saat menghapus pesanan.');
            setOpenSnackbar(true);
          });
      }
    });
  };

  const handleEdit = (id) => {
    Swal.fire({
      title: 'Apakah Anda ingin mengedit pesanan ini?',
      text: "Anda akan diarahkan ke halaman edit.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, edit!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to the edit page
        window.location.href = `/edit-salesorder/${id}`;
      }
    });
  };
  

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedOrder(null);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("PT Singa Perkasa", 105, 10, { align: "center" });
    doc.setFontSize(18);
    doc.setFont("Helvetica", "bold");
    doc.text("Sales Order Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`Customer Name: ${selectedOrder.namaPelanggan}`, 14, 40);
    doc.text(`Customer Address: ${selectedOrder.alamatPelanggan}`, 14, 50);
    doc.text(`PO Date: ${selectedOrder.tanggalPO ? formatDate(selectedOrder.tanggalPO) : 'N/A'}`, 14, 60);
    doc.text(`PO Number: ${selectedOrder.nomorPO}`, 14, 70);
    doc.text(`SO Number: ${selectedOrder.nomorSO}`, 14, 80);
    doc.setLineWidth(0.5);
    doc.line(14, 85, 195, 85);

    const itemsTable = selectedOrder.barang.map((item) => [
      item.kuantitas || 0,
      item.jenis || "",
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
      head: [["Qty", "Jenis Barang", "Item", "Price", "Total"]],
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

    // Add subtotal and grand total
    const yPosition = doc.lastAutoTable.finalY + 10; // Posisi Y untuk tabel ringkasan
doc.autoTable({
  startY: yPosition,
  head: [['Detail', 'Amount']],
  body: [
    ['Diskon', `${selectedOrder.subTotal.diskon?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'} (%/IDR)`],
    ['Uang Muka', `${selectedOrder.subTotal.uangMuka?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'}`],
    ['PPN', `${selectedOrder.subTotal.ppn || 'N/A'} %`],
    ['Grand Total', `${selectedOrder.totalBayar?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) || 'N/A'}`],
  ],
  theme: 'striped', // Tema tabel
  margin: { top: 20 },
});

// Menyimpan file PDF
doc.save(`Sales_Order_${selectedOrder.nomorSO}.pdf`);
  };

  if (loading) {
    return <Container className="text-center"><CircularProgress /></Container>;
  }

  if (error) {
    return <Container><Alert severity="error">Error: {error}</Alert></Container>;
  }

  return (
    <Container fluid>
    <Helmet>
      <title>Detail Sales Order</title>
    </Helmet>
      <Typography variant="h4" align="center" gutterBottom>Detail Sales Order</Typography>
      <TextField
        label="Search"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      {filteredSalesOrders.length === 0 ? (
        <Alert severity="info">Tidak ada pesanan yang ditemukan.</Alert>
      ) : (
        <Grid container spacing={2} justifyContent="flex-start">
          {filteredSalesOrders.map(order => (
            <Grid item key={order._id}>
            <CustomCard>
             <CardContent>
              <Typography variant="h6">{order.namaPelanggan}</Typography>
              <Typography variant="body2">SO Number: {order.nomorSO}</Typography>
              <Typography variant="body2">PO Number: {order.nomorPO}</Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleRowClick(order)}
        sx={{ marginRight: 1 }}  // Tambahkan margin di sini
      >
        Details
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={() => handleEdit(order._id)}
        sx={{ marginRight: 1 }}  // Tambahkan margin di sini
      >
        Edit
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={() => handleDelete(order._id)}
      >
        Delete
      </Button>
    </CardContent>
  </CustomCard>
</Grid>

          ))}
        </Grid>
      )}

      {selectedOrder && (
  <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
    <DialogTitle>Detail Sales Order</DialogTitle>
    <DialogContent>
      <LetterCard>
        <Typography variant="h5">Sales Order</Typography>
        <Typography variant="subtitle1">SO Number: {selectedOrder.nomorSO}</Typography>
        <Typography variant="subtitle1">PO Number: {selectedOrder.nomorPO}</Typography>
        <Typography variant="subtitle1">Customer: {selectedOrder.namaPelanggan}</Typography>
        
        {/* Tabel Barang */}
        <TableContainer style={{ marginBottom: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Qty</TableCell>
                <TableCell>Jenis Barang</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedOrder.barang.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.kuantitas}</TableCell>
                  <TableCell>{item.jenisPacking}</TableCell>
                  <TableCell>{item.namaBarang}</TableCell>
                  <TableCell>{item.harga.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</TableCell>
                  <TableCell>{(item.kuantitas * item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Ringkasan */}
        <Card style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9' }}>
          <Typography variant="h6">Detail Harga</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Diskon</TableCell>
                <TableCell align="right">{selectedOrder.subTotal.diskon.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} (% / IDR)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Uang Muka</TableCell>
                <TableCell align="right">{selectedOrder.subTotal.uangMuka.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>PPN</TableCell>
                <TableCell align="right">{selectedOrder.subTotal.ppn}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Grand Total</TableCell>
                <TableCell align="right">{selectedOrder.totalBayar.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Button variant="contained" color="primary" onClick={generatePDF}>Export PDF</Button>
      </LetterCard>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseModal}>Close</Button>
    </DialogActions>
  </Dialog>
)}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success">{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
};

export default DetailSalesOrder;
