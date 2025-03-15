import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Calendar from './Calendar';
import EventForm from './EventForm';

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', textAlign: 'center' }}>
          <Link to="/" style={{ margin: '0 10px' }}>行事曆</Link>
          <Link to="/manage-events" style={{ margin: '0 10px' }}>管理事件</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Calendar />} />
          <Route path="/manage-events" element={<EventForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;