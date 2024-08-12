import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import SalesOrder from "./page/Sales Order/SalesOrder";
import JadwalPengirim from "./page/JadwalPengiriman"
import DetailSalesOrder from "./page/Sales Order/DetailSalesOrder"
import Navbar from "./page/Sidebar/SideBar"
import './App.css';
import EditSalesOrder from "./page/Sales Order/EditSalesOrder";

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
            <Route path="/jadwal-pengiriman" element={<JadwalPengirim />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </div>
  </Router>
  );
}

export default App;
