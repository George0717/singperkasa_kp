import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Helmet } from "react-helmet";
import { useNavigate, useParams } from "react-router-dom";

const EditSalesOrder = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [soNumber, setSoNumber] = useState("");
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("amount");
  const [downPayment, setDownPayment] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const {id} = useParams()


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("id-ID", options);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );
    const discountAmount =
      discountType === "percentage"
        ? (subTotal * (discount || 0)) / 100
        : discount || 0;
    const taxAmount = (subTotal * (tax || 0)) / 100;
    const grandTotal =
      subTotal + taxAmount - discountAmount - (downPayment || 0);
    return { subTotal, grandTotal, taxAmount };
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
    doc.text(`Customer Name: ${customerName}`, 14, 40);
    doc.text(`Customer Address: ${customerAddress}`, 14, 50);
    doc.text(`PO Date: ${formatDate(poDate)}`, 14, 60);
    doc.text(`PO Number: ${poNumber}`, 14, 70);
    doc.text(`SO Number: ${soNumber}`, 14, 80);
    doc.setLineWidth(0.5);
    doc.line(14, 85, 195, 85);

    const itemsTable = items.map((item) => [
      item.quantity || 0,
      item.jenis || "",
      item.name || "",
      (item.price || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
      }),
      ((item.quantity || 0) * (item.price || 0)).toLocaleString("id-ID", {
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

    const { subTotal, grandTotal, taxAmount } = calculateTotals();

    const summaryTable = [
      [
        "Sub Total",
        subTotal.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      ],
      [
        "Discount",
        `${discount.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })} (${discountType === "percentage" ? "%" : "IDR"})`,
      ],
      [
        "Down Payment",
        downPayment.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        }),
      ],
      [
        "Tax",
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
      ["Payment Type", paymentType],
      ["Payment Date", formatDate(paymentDate)],
    ];

    const yOffset = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("Summary", 105, yOffset, { align: "center" });

    doc.autoTable({
      startY: yOffset + 10,
      head: [["Description", "Amount"]],
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

    const filename = `SalesOrder_${soNumber}.pdf`;
    doc.save(filename);
  };

  const handleAddItem = () => {
    setItems([...items, { quantity: 0, jenis: "Box", name: "", price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index, field, value) => {
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );

    if (field === "name" || field === "jenis") {
      const itemName = field === "name" ? value : updatedItems[index].name;
      const itemJenis = field === "jenis" ? value : updatedItems[index].jenis;

      let newPrice = 0;
      if (itemName === "Paku") {
        newPrice = itemJenis === "Box" ? 500000 : 0;
      } else if (itemName === "Baja Ringan") {
        newPrice = itemJenis === "Box" ? 1000000 : 100000;
      }
      updatedItems[index].price = newPrice;
    }

    setItems(updatedItems);
  };
  const navigate = useNavigate();

  useEffect(() => {
    getSalesOrderById()
  }, []);

  const getSalesOrderById = async (id) => {
    try {
      const response = await axios.get(`https://backend-penjualan-blond.vercel.app/salesorder`);
      const data = response.data;
      console.log('Fetched data:', data); // Add this line to inspect the response structure
      // Set state with fetched data
      setCustomerName(data.namaPelanggan);
      setCustomerAddress(data.alamatPelanggan);
      setPoDate(data.tanggalPO);
      setPoNumber(data.nomorPO);
      setSoNumber(data.nomorSO);
      setItems(data.barang);
      setDiscount(data.diskon);
      setDiscountType(data.discountType);
      setDownPayment(data.uangMuka);
      setTax(data.ppn);
      setPaymentType(data.tipePemabayran);
      setPaymentDate(data.jadwalPembayaran);
      setItems(data.barang || []);
    } catch (error) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message); // Detailed error logging
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { subTotal, grandTotal, taxAmount } = calculateTotals();
    const salesOrderData = {
      namaPelanggan: customerName,
      alamatPelanggan: customerAddress,
      tanggalPO: poDate,
      nomorPO: poNumber,
      nomorSO: soNumber,
      barang: items.map((item) => ({
        kuantitas: item.quantity || 0,
        jenisPacking: item.jenis || "",
        namaBarang: item.name || "",
        harga: item.price || 0,
        total: (item.quantity || 0) * (item.price || 0),
      })),
      subTotal: {
        uangMuka: downPayment || 0,
        diskon: discount || 0,
        ppn: tax || 0,
      },
      totalBayar: grandTotal,
      diskon: discount,
      uangMuka: downPayment,
      ppn: taxAmount,
      tipePembayaran: paymentType,
      jadwalPembayaran: paymentDate,
    };
    
    try {
      const response = await axios.put(`https://backend-penjualan-blond.vercel.app/salesorder/${id}`, salesOrderData);
      console.log('Success:', response.data);
      navigate('/sales-order')
    } catch (error) {
      console.error('Error submitting sales order:', error);
    }
  };
  
  
  return (
    <Container>
      <Helmet>
        <title>Sales Order</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Sales Order
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer Address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PO Date"
              type="date"
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PO Number"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SO Number"
              value={soNumber}
              onChange={(e) => setSoNumber(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Items
                </Typography>
                <TableContainer
                  component={Paper}
                  style={{ maxHeight: 400, overflow: "auto" }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Quantity</TableCell>
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
                              onChange={(e) =>
                                handleChangeItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value)
                                )
                              }
                              InputProps={{ inputProps: { min: 0 } }}
                              size="small"
                              style={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.jenis}
                              onChange={(e) =>
                                handleChangeItem(index, "jenis", e.target.value)
                              }
                              select
                              SelectProps={{ native: true }}
                            >
                              <option value="Box">Box</option>
                              <option value="Other">Other</option>
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.name}
                              onChange={(e) =>
                                handleChangeItem(index, "name", e.target.value)
                              }
                              fullWidth
                            >
                              <MenuItem value="Paku">Paku</MenuItem>
                              <MenuItem value="Baja Ringan">
                                Baja Ringan
                              </MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.price}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    Rp
                                  </InputAdornment>
                                ),
                                readOnly: true,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={(
                                item.quantity * item.price
                              ).toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              })}
                              InputProps={{ readOnly: true }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => handleRemoveItem(index)}
                              color="error"
                            >
                              <Remove />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddItem}
                  startIcon={<Add />}
                >
                  Add Item
                </Button>
              </CardContent>
            </Card>
          </Grid>     
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {discountType === "percentage" ? "%" : "Rp"}
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Discount Type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              select
              SelectProps={{ native: true }}
            >
              <option value="amount">Amount</option>
              <option value="percentage">Percentage</option>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Down Payment"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(parseFloat(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">Rp</InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tax"
              type="number"
              value={tax}
              onChange={(e) => setTax(parseFloat(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">%</InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ margin: "20px 0" }} />
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Description
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }} align="right">
                          Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>Sub Total</TableCell>
                        <TableCell align="right">
                          {calculateTotals().subTotal.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>Diskon</TableCell>
                        <TableCell align="right">
                          {(discount || 0).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}{" "}
                          ({discountType === "percentage" ? "%" : "IDR"})
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>DP</TableCell>
                        <TableCell align="right">
                          {(downPayment || 0).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>PPN</TableCell>
                        <TableCell align="right">
                          {calculateTotals().taxAmount.toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>Grand Total</TableCell>
                        <TableCell align="right">
                          {calculateTotals().grandTotal.toLocaleString(
                            "id-ID",
                            { style: "currency", currency: "IDR" }
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>Tipe Pembayaran</TableCell>
                        <TableCell align="right">{paymentType}</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>Pembayaran Lunas</TableCell>
                        <TableCell align="right">
                          {formatDate(paymentDate)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} container justifyContent="center" spacing={2}>
          <Grid item>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={generatePDF}
            >
              Generate PDF
            </Button>
          </Grid>
        </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default EditSalesOrder;
