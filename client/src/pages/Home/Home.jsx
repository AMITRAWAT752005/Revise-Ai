import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Inter, sans-serif' }}>
      <h1>Welcome to ReviseAI Home!</h1>
      <p>This is a placeholder page.</p>
      <Link to="/login" style={{ color: '#4441cc', fontWeight: 600 }}>Back to Login</Link>
    </div>
  );
};

export default Home;
