import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from './components/sidebar'
import SalesOrder from "./page/SalesOrder";
import './App.css';

function App() {
  return (
    <Router>
    <div className="App">
      <Container fluid>
        <Row>
        <Col xs={12} md={3} className="sidebar-col">
          {/* <Sidebar /> */}
        </Col>
          <Col md={9} className="content-col">
            <Routes>
              <Route path="/" element={<SalesOrder />} />
              
            </Routes>
          </Col>
        </Row>
      </Container>
    </div>
  </Router>
  );
}

export default App;
