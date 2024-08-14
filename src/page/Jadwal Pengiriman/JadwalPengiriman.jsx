import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SalesOrderDropdown = () => {
  const [options, setOptions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingDate, setShippingDate] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch data from API
    fetch('https://backend-penjualan-blond.vercel.app/salesorder')
      .then(response => response.json())
      .then(data => {
        const salesOrders = data.penjualanApp.data;
        const formattedOptions = salesOrders.map(order => ({
          label: order.nomorSO,
          data: order,
        }));
        setOptions(formattedOptions);
      })
      .catch(error => console.error('Error fetching sales orders:', error));
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Handle shipping date change
  const handleShippingDateChange = (event) => {
    setShippingDate(event.target.value);
  };

  // Handle submit
  const handleSubmit = () => {
    if (!selectedOrder || !shippingDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Oops...',
        text: 'Please select an order and enter a shipping date.',
      });
      return;
    }
  
    const dataToSubmit = {
      pilihCustomer: selectedOrder.namaPelanggan,
      pilihNomorSo: selectedOrder._id, // Assuming '_id' is the unique identifier for the Sales Order
      pilihTanggal: shippingDate,
    };
  
    fetch('https://backend-penjualan-blond.vercel.app/jadwalkirim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSubmit),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        Swal.fire({
          title: 'Success!',
          text: 'Data successfully submitted!',
          icon: 'success',
          timer: 2000, // Optional: Show the success alert for 2 seconds
          willClose: () => {
            navigate('/home-jadwalkirim'); // Navigate after the alert closes
          }
        });
      })
      .catch((error) => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error submitting the data.',
        });
      });
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 1200 }}>
        <Autocomplete
          options={options}
          getOptionLabel={(option) => option.label}
          onChange={(event, newValue) => setSelectedOrder(newValue ? newValue.data : null)}
          renderInput={(params) => <TextField {...params} label="Select Sales Order" variant="outlined" fullWidth />}
        />
        {selectedOrder && (
          <Card sx={{ marginTop: 2 }}>
            <CardContent>
              <Typography variant="h6">Details for {selectedOrder.nomorSO}</Typography>
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell colSpan={2} align="center"><Typography variant="h6">Order Information</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Customer Name:</strong></TableCell>
                      <TableCell>{selectedOrder.namaPelanggan}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Address:</strong></TableCell>
                      <TableCell>{selectedOrder.alamatPelanggan}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Order Date:</strong></TableCell>
                      <TableCell>{formatDate(selectedOrder.tanggalPO)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Payment Type:</strong></TableCell>
                      <TableCell>{selectedOrder.tipePembayaran}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Payment Schedule:</strong></TableCell>
                      <TableCell>{formatDate(selectedOrder.jadwalPembayaran)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total Amount:</strong></TableCell>
                      <TableCell>{formatCurrency(selectedOrder.totalBayar)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Typography variant="h6" sx={{ marginTop: 2 }}>Items</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Item Name</strong></TableCell>
                      <TableCell><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Price</strong></TableCell>
                      <TableCell><strong>Total</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.barang.map(item => (
                      <TableRow key={item._id}>
                        <TableCell>{item.namaBarang}</TableCell>
                        <TableCell>{item.kuantitas}</TableCell>
                        <TableCell>{formatCurrency(item.harga)}</TableCell>
                        <TableCell>{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ marginTop: 2 }}>
                <TextField
                  label="Tanggal Pengiriman"
                  type="date"
                  value={shippingDate}
                  onChange={handleShippingDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  sx={{ marginTop: 2 }}
                >
                  Submit
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default SalesOrderDropdown;
