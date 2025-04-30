import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Detail from './Pages/Detail';
import Form from './Pages/Form';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/add" element={<Form />} />
      </Routes>
    </Router>
  );
};

export default App;