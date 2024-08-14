import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
// Sales Order
import SalesOrder from "./page/Sales Order/SalesOrder";
import DetailSalesOrder from "./page/Sales Order/DetailSalesOrder"
import EditSalesOrder from "./page/Sales Order/EditSalesOrder";
// Jadwal Kirim
import JadwalPengirim from "./page/Jadwal Pengiriman/JadwalPengiriman";
import HomeJadwalKirim from "./page/Jadwal Pengiriman/HomeJadwalKirim";
import EditJadwalKirim from "./page/Jadwal Pengiriman/EditJadwalKirim";
import Navbar from "./page/Sidebar/SideBar"
import './App.css';

function App() {
  return (
    <Router>
    <div className="App">
      <Container fluid>
        <Row>
        <Col xs={12} md={3} className="sidebar-col">
         <Navbar />
        </Col>
          <Col md={9} className="content-col">
            <Routes>
            {/* Sales Order */}
            <Route path="/sales-order" element={<DetailSalesOrder />} />
            <Route path="/buat-sales-order" element={<SalesOrder />} />
            <Route path="/edit-salesorder/:id" element={<EditSalesOrder />} />
            {/* Akhir Sales Order */}
            {/* Jadwal Pengiriman */}
            <Route path="/jadwal-pengiriman" element={<JadwalPengirim />} />
            <Route path="/home-jadwalkirim" element={<HomeJadwalKirim />} />
            <Route path="/edit-jadwalkirim" element={<EditJadwalKirim />} />
            {/* Akhir Jadwal Pengiriman */}
            </Routes>
          </Col>
        </Row>
      </Container>
    </div>
  </Router>
  );
}

export default App;
