import React, { useContext, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../components/context/AuthContext';
import debounce from 'lodash/debounce';
import './Home.css'; // Import the CSS file
import {baseUrl} from './url';


const Home = () => {
  const { loadUser, isAuthenticated, user } = useContext(AuthContext);
  const [portfolioExists, setPortfolioExists] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const checkPortfolioExists = useCallback(
    debounce(async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/portfolio/exists`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setPortfolioExists(data.exists);
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    }, 500), // Adjust the debounce delay as needed
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      checkPortfolioExists();
    }
  }, [isAuthenticated, checkPortfolioExists]);

  const navigateToCreatePortfolio = () => {
    navigate('/portfolio');
  };

  const navigateToEditPortfolio = () => {
    navigate('/portfolio/edit');
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const navigateToViewPortfolio = () => {
    if (user) {
      navigate(`/portfolio/public/${user._id}`);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to the Portfolio Builder</h1>
      <p>Create and manage your professional portfolio with ease.</p>
      {isAuthenticated ? (
        <div className="cta-container">
          {portfolioExists ? (
            <>
              <button className="cta-button" onClick={navigateToEditPortfolio}>
                Edit your Portfolio
              </button>
              <button className="view-portfolio-button" onClick={navigateToViewPortfolio}>
                View Your Portfolio
              </button>
            </>
          ) : (
            <button className="cta-button" onClick={navigateToCreatePortfolio}>
              Create your Portfolio
            </button>
          )}
        </div>
      ) : (
        <div className="cta-container">
          <p className="register-message">Register to get started</p>
          <button className="cta-button" onClick={navigateToRegister}>
            Register
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
