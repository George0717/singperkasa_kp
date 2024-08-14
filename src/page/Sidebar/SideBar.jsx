import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className={`sidebar-mask ${isOpen ? 'visible' : ''}`} onClick={toggleSidebar}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul className="sidebar-menu">
          <li className="sidebar-item active">
            <Link to="/" onClick={toggleSidebar}>Home</Link>
          </li>
          <li className="sidebar-item">
            <Link to="/sales-order" onClick={toggleSidebar}>Detail Sales</Link>
          </li>
          <li className="sidebar-item">
            <Link to="/home-jadwalkirim" onClick={toggleSidebar}>Jadwal Kirim</Link>
          </li>
          <li className="sidebar-item">
            <Link to="/contact" onClick={toggleSidebar}>Contact</Link>
          </li>
        </ul>
      </div>
      <button className="toggle-button" onClick={toggleSidebar}>
        ☰
      </button>
    </>
  );
}

export default SideBar;
