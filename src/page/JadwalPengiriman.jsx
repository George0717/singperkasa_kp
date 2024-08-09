import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Helmet } from 'react-helmet';

const JadwalPengiriman = () => {
  const [customerName, setCustomerName] = useState('');
  const [soNumber, setSoNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [items, setItems] = useState([{ quantity: 0, item: '', description: '' }]);

  const customers = ['Customer A', 'Customer B', 'Customer C']; // Example customers
  const salesOrders = ['SO123', 'SO456', 'SO789']; // Example SO numbers

  const handleAddItem = () => {
    setItems([...items, { quantity: 0, item: '', description: '' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index, field, value) => {
    const updatedItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updatedItems);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Jadwal Pengiriman', 105, 10, { align: 'center' });

    // Customer and SO Information
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Customer Name: ${customerName}`, 14, 20);
    doc.text(`SO Number: ${soNumber}`, 14, 30);
    doc.text(`Delivery Date: ${deliveryDate}`, 14, 40);

    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(14, 45, 195, 45);

    // Table for items
    const itemsTable = items.map(item => [
      item.quantity,
      item.item,
      item.description,
    ]);

    doc.autoTable({
      startY: 50,
      head: [['Qty', 'Item', 'Description']],
      body: itemsTable,
      theme: 'striped',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        halign: 'center',
        cellPadding: 5,
      },
      margin: { horizontal: 14 },
      tableWidth: 'auto',
    });

    // Footer
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'italic');
    doc.text('PT Singa Perkasa', 105, doc.internal.pageSize.height - 10, { align: 'center' });

    // Save the PDF
    const filename = `JadwalPengiriman_${soNumber}.pdf`;
    doc.save(filename);
  };

  return (
    <Container>
      <Helmet>
        <title>Jadwal Pengiriman</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Jadwal Pengiriman Form
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Delivery Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Name</InputLabel>
                <Select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                >
                  {customers.map((customer, index) => (
                    <MenuItem key={index} value={customer}>
                      {customer}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>SO Number</InputLabel>
                <Select
                  value={soNumber}
                  onChange={(e) => setSoNumber(e.target.value)}
                >
                  {salesOrders.map((so, index) => (
                    <MenuItem key={index} value={so}>
                      {so}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Delivery Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </Grid>
          </Grid>
          <Divider style={{ margin: '20px 0' }} />
          <Typography variant="h6">Items</Typography>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Qty</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleChangeItem(index, 'quantity', parseFloat(e.target.value))}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          SelectProps={{ native: true }}
                          value={item.item}
                          onChange={(e) => handleChangeItem(index, 'item', e.target.value)}
                          fullWidth
                        >
                          <option value="">Select Item</option>
                          <option value="Item A">Item A</option>
                          <option value="Item B">Item B</option>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={item.description}
                          onChange={(e) => handleChangeItem(index, 'description', e.target.value)}
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleRemoveItem(index)} color="error">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddItem}
            style={{ marginBottom: '20px' }}
          >
            Add Item
          </Button>
          <Divider style={{ margin: '20px 0' }} />
          <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
            <Grid item>
              <Button variant="contained" color="primary" onClick={generatePDF} style={{ backgroundColor: '#158843' }}>
                Generate PDF
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default JadwalPengiriman;
