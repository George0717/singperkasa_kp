import React, { useState } from 'react';

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
            <a href="#home">Home</a>
          </li>
          <li className="sidebar-item">
            <a href="/sales-order">Detail Sales</a>
          </li>
          <li className="sidebar-item">
            <a href="#services">Services</a>
          </li>
          <li className="sidebar-item">
            <a href="#contact">Contact</a>
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
