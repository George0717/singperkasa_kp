import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Button, Modal, Box, styled, Collapse
} from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const MySwal = withReactContent(Swal);

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

const modalStyle = {
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

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatDate = (date) => {
  return dayjs(date).format('D MMMM YYYY');
};


function EditJadwalKirim() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.data) {
      setSelectedRow(location.state.data);
      setNewDate(dayjs(location.state.data.pilihTanggal).format('YYYY-MM-DD'));
    }
  }, [location.state]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDateChange = (event) => setNewDate(event.target.value);

  const handleSave = () => {
    axios.put(`https://backend-penjualan-blond.vercel.app/jadwalkirim/${selectedRow._id}`, {
      pilihTanggal: newDate,
    })
    .then(response => {
      if (response.status === 200) {
        handleClose();
        MySwal.fire(
          'Berhasil!',
          'Data berhasil diperbarui.',
          'success'
        ).then(() => {
          navigate('/home-jadwalkirim');
        });
      } else {
        throw new Error('Something went wrong');
      }
    })
    .catch(error => {
      MySwal.fire(
        'Gagal!',
        `Terjadi kesalahan: ${error.message}`,
        'error'
      );
    });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Edit Jadwal Kirim
      </Typography>

      {selectedRow && (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Nomor SO</strong></TableCell>
                <TableCell><strong>Pilih Tanggal</strong></TableCell>
                <TableCell><strong>Detail Lainnya</strong></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <TableCell>{selectedRow.pilihCustomer}</TableCell>
                <TableCell>{selectedRow.pilihNomorSo.nomorSO}</TableCell>
                <TableCell>{dayjs(selectedRow.pilihTanggal).format('D MMMM YYYY')}</TableCell>
                <TableCell>
                  <StyledButton variant="contained" color="primary" onClick={handleOpen}>
                    Edit Tanggal
                  </StyledButton>
                </TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Edit Tanggal Pengiriman
          </Typography>
          <TextField
            id="new-date"
            label="Pilih Tanggal Baru"
            type="date"
            value={newDate}
            onChange={handleDateChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <StyledButton
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Simpan
          </StyledButton>
          <StyledButton
            variant="outlined"
            color="secondary"
            onClick={handleClose}
          >
            Batal
          </StyledButton>
        </Box>
      </Modal>
    </Container>
  );
}

export default EditJadwalKirim;
