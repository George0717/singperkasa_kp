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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Helmet } from 'react-helmet';

const SalesOrder = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [poDate, setPoDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [soNumber, setSoNumber] = useState('');
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('amount'); // 'amount' or 'percentage'
  const [downPayment, setDownPayment] = useState(0);
  const [tax, setTax] = useState(0); // Tax percentage
  const [paymentType, setPaymentType] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const discountAmount = discountType === 'percentage' ? (subTotal * discount) / 100 : discount;
    const taxAmount = (subTotal * tax) / 100;
    const grandTotal = (subTotal + taxAmount) - discountAmount - downPayment;
    return { subTotal, grandTotal, taxAmount };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
  
    // Header
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('PT Singa Perkasa', 105, 10, { align: 'center' });
  
    // Title
    doc.setFontSize(18);
    doc.setFont('Helvetica', 'bold');
    doc.text('Sales Order Report', 105, 20, { align: 'center' });
  
    // Customer Information
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Customer Name: ${customerName}`, 14, 40);
    doc.text(`Customer Address: ${customerAddress}`, 14, 50);
    doc.text(`PO Date: ${poDate}`, 14, 60);
    doc.text(`PO Number: ${poNumber}`, 14, 70);
    doc.text(`SO Number: ${soNumber}`, 14, 80);
  
    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(14, 85, 195, 85);
  
    // Table for items
    const itemsTable = items.map(item => [
      item.quantity,
      item.jenis,
      item.name,
      item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
      (item.quantity * item.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    ]);
  
    doc.autoTable({
      startY: 90,
      head: [['Qty', 'Jenis Barang', 'Item', 'Price', 'Total']],
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
  
    // Summary as Table
    const summaryTable = [
      ['Sub Total', subTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })],
      ['Discount', `${discount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} (${discountType === 'percentage' ? '%' : 'IDR'})`],
      ['Down Payment', downPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })],
      ['Tax', taxAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })],
      ['Grand Total', grandTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })],
      ['Payment Type', paymentType],
      ['Payment Date', paymentDate]
    ];
  
    const yOffset = doc.lastAutoTable.finalY + 10;
  
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text('Summary', 105, yOffset, { align: 'center' });
  
    doc.autoTable({
      startY: yOffset + 10,
      head: [['Description', 'Amount']],
      body: summaryTable,
      theme: 'striped',
      headStyles: {
        fillColor: [50, 50, 50],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        halign: 'right',
        cellPadding: 5,
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'right' }
      },
      margin: { horizontal: 14 },
      tableWidth: 'auto',
    });
  
    // Footer
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'italic');
    doc.text('PT Singa Perkasa', 105, doc.internal.pageSize.height - 10, { align: 'center' });
  
    // Save the PDF with the SO Number as filename
    const filename = `SalesOrder_${soNumber}.pdf`;
    doc.save(filename);
  };

  const handleAddItem = () => {
    setItems([...items, { quantity: 0, jenis: 'Box', name: '', price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index, field, value) => {
    const updatedItems = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));

    // Update price based on item type and jenis barang
    if (field === 'name' || field === 'jenis') {
      const itemName = field === 'name' ? value : updatedItems[index].name;
      const itemJenis = field === 'jenis' ? value : updatedItems[index].jenis;

      let newPrice = 0;
      if (itemName === 'Paku') {
        newPrice = itemJenis === 'Box' ? 500000 : 0;
      } else if (itemName === 'Baja Ringan') {
        newPrice = itemJenis === 'Box' ? 1000000 : 100000;
      }
      updatedItems[index].price = newPrice;
    }

    setItems(updatedItems);
  };

  const handleSubmit = () => {
    // Handle form submission, e.g., save data to a server or local storage
    alert('Sales Order Submitted!');
  };

  const { subTotal, grandTotal, taxAmount } = calculateTotals();

  return (
    <Container>
    <Helmet>
      <title>Sales Order</title>
    </Helmet>
      <Typography variant="h4" gutterBottom>
        Sales Order Form
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">Customer Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                fullWidth
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Address"
                fullWidth
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PO Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PO Number"
                fullWidth
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="SO Number"
                fullWidth
                value={soNumber}
                onChange={(e) => setSoNumber(e.target.value)}
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
                    <TableCell>Jenis Barang</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Total</TableCell>
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
                          SelectProps={{
                            native: true,
                          }}
                          value={item.jenis}
                          onChange={(e) => handleChangeItem(index, 'jenis', e.target.value)}
                          fullWidth
                        >
                          <option value="Box">Box</option>
                          <option value="Piece">Piece</option>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          SelectProps={{
                            native: true,
                          }}
                          value={item.name}
                          onChange={(e) => handleChangeItem(index, 'name', e.target.value)}
                          fullWidth
                        >
                          <option value="">Select Item</option>
                          <option value="Paku">Paku</option>
                          <option value="Baja Ringan">Baja Ringan</option>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        {item.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </TableCell>
                      <TableCell>
                        {(item.quantity * item.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveItem(index)}>
                          <Remove />
                        </IconButton>
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
            startIcon={<Add />}
            onClick={handleAddItem}
            style={{ marginBottom: '20px' }}
          >
            Add Item
          </Button>
          <Divider style={{ margin: '20px 0' }} />
          <Typography variant="h6">Discounts and Payments</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Discount"
                type="number"
                fullWidth
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="amount">IDR</option>
                        <option value="percentage">%</option>
                      </select>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Down Payment"
                type="number"
                fullWidth
                value={downPayment}
                onChange={(e) => setDownPayment(parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tax (%)"
                type="number"
                fullWidth
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Type"
                fullWidth
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Payment Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </Grid>
          </Grid>
          <Divider style={{ margin: '20px 0' }} />
          <Typography variant="h6">Summary</Typography>
          <Typography>Sub Total: {subTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</Typography>
          <Typography>Discount: {discount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} ({discountType === 'percentage' ? '%' : 'IDR'})</Typography>
          <Typography>Down Payment: {downPayment.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</Typography>
          <Typography>Tax: {taxAmount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</Typography>
          <Typography>Grand Total: {grandTotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</Typography>
          <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
            <Grid item>
              <Button variant="contained" color="primary" onClick={handleSubmit} style={{ backgroundColor: '#158843' }}>
                Submit
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={generatePDF} style={{ backgroundColor: '#158843' }}>
                Generate PDF
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SalesOrder;
