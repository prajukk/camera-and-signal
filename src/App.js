import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle, FaCheckCircle, FaMapMarkedAlt, FaTrafficLight, FaTimes, FaBell } from 'react-icons/fa';
import './App.css';

const Dashboard = () => {
  const [trafficData, setTrafficData] = useState({
    activeCameras: 0,
    activeSignals: 0,
    congestionLevel: 'Unknown',
    recentEvents: [],
    junctions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJunction, setSelectedJunction] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Fetch traffic data once on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/dashboard', {
          withCredentials: true
        });
        const junctionsData = generateJunctionData(response.data.activeSignals);
        setTrafficData({ ...response.data, junctions: junctionsData });
        checkForIssues(junctionsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Run issue checker every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (trafficData.junctions.length > 0) {
        checkForRandomIssues(trafficData.junctions);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [trafficData.junctions]);

  const generateJunctionData = (signalCount) => {
    const junctions = [];
    const streets = ['Main St', 'Broadway', 'Park Ave', 'Lake Rd', 'Highland Ave', 'Market St', 'University Blvd'];

    for (let i = 1; i <= signalCount; i++) {
      const intersection = `${streets[Math.floor(Math.random() * streets.length)]} & ${streets[Math.floor(Math.random() * streets.length)]}`;
      const trafficLights = ['North', 'South', 'East', 'West'].map(direction => ({
        id: `${i}-${direction.toLowerCase()}`,
        direction,
        status: Math.random() > 0.9 ? 'faulty' : 'operational',
        type: ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)],
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
      }));

      junctions.push({
        id: i,
        name: `Junction ${i} (${intersection})`,
        trafficLights,
        status: trafficLights.some(light => light.status === 'faulty') ? 'attention needed' : 'operational',
        trafficFlow: ['Heavy', 'Moderate', 'Light'][Math.floor(Math.random() * 3)]
      });
    }

    return junctions;
  };

  const checkForIssues = (junctions) => {
    const newNotifications = [];

    junctions.forEach(junction => {
      const faultyLights = junction.trafficLights.filter(light => light.status === 'faulty');
      faultyLights.forEach(light => {
        newNotifications.push({
          id: `notification-${Date.now()}-${light.id}`,
          type: 'alert',
          message: `Missing/faulty ${light.type} light at ${junction.name} (${light.direction})`,
          timestamp: new Date().toLocaleTimeString(),
          junction: junction.id
        });
      });
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev]);
    }
  };

  const checkForRandomIssues = (junctions) => {
    const randomJunctionIndex = Math.floor(Math.random() * junctions.length);
    const randomJunction = junctions[randomJunctionIndex];
    const randomLightIndex = Math.floor(Math.random() * randomJunction.trafficLights.length);
    const randomLight = randomJunction.trafficLights[randomLightIndex];

    if (randomLight.status !== 'faulty') {
      const updatedJunctions = [...junctions];
      updatedJunctions[randomJunctionIndex].trafficLights[randomLightIndex].status = 'faulty';
      updatedJunctions[randomJunctionIndex].status = 'attention needed';

      setTrafficData(prev => ({ ...prev, junctions: updatedJunctions }));

      const newNotification = {
        id: `notification-${Date.now()}`,
        type: 'alert',
        message: `NEW ISSUE: ${randomLight.type} light failure at ${randomJunction.name} (${randomLight.direction})`,
        timestamp: new Date().toLocaleTimeString(),
        junction: randomJunction.id
      };

      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const handleSignalClick = () => {
    setSelectedJunction(null);
    const junctionListElem = document.getElementById('junction-list');
    if (junctionListElem) {
      junctionListElem.style.display = junctionListElem.style.display === 'none' ? 'block' : 'none';
    }
  };

  const handleJunctionSelect = (junction) => {
    setSelectedJunction(junction);
  };

  const toggleNotifications = () => {
    setShowNotificationPanel(!showNotificationPanel);
  };

  const hasNewNotifications = notifications.some(n => !n.seen);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Traffic System Dashboard</h1>
        <div className="notification-toggle" onClick={toggleNotifications}>
          <FaBell />
          {hasNewNotifications && <span className="notification-badge"></span>}
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card clickable"onClick={handleSignalClick}><h3>Active Cameras</h3><div className="stat-value">{trafficData.activeCameras}</div></div>
            <div className="stat-card clickable" onClick={handleSignalClick}><h3>Active Signals</h3><div className="stat-value">{trafficData.activeSignals}</div></div>
            <div className="stat-card"><h3>Congestion Level</h3><div className="stat-value">{trafficData.congestionLevel}</div></div>
            <div className="stat-card"><h3>System Status</h3><div className="stat-value status-active">Online</div></div>
          </div>

          <div id="junction-list" className="junction-list-panel" style={{ display: 'none' }}>
            <h3>Traffic Signal Junctions</h3>
            <ul>
              {trafficData.junctions.map(junction => (
                <li key={junction.id} className={`junction-item ${junction.status !== 'operational' ? 'attention' : ''}`} onClick={() => handleJunctionSelect(junction)}>
                  <FaTrafficLight className="junction-icon" />
                  <span>{junction.name}</span>
                  {junction.status !== 'operational' && <FaExclamationTriangle className="warning-icon" />}
                </li>
              ))}
            </ul>
          </div>

          {selectedJunction && (
            <div className="junction-detail">
              <div className="junction-detail-header">
                <h3>{selectedJunction.name}</h3>
                <span className={`status-badge ${selectedJunction.status.replace(/\s+/g, '-')}`}>{selectedJunction.status}</span>
                <button className="close-btn" onClick={() => setSelectedJunction(null)}><FaTimes /></button>
              </div>
              <div className="junction-info">
                <div className="info-item"><span className="label">Traffic Flow:</span><span className="value">{selectedJunction.trafficFlow}</span></div>
              </div>
              <div className="traffic-light-grid">
                {selectedJunction.trafficLights.map(light => (
                  <div key={light.id} className={`traffic-light-card ${light.status === 'faulty' ? 'faulty' : 'operational'}`}>
                    <h4>{light.direction} Signal</h4>
                    <div className="light-info">
                      <div className="light-type">Type: <span>{light.type}</span></div>
                      <div className="light-status">Status: <span className={light.status}>{light.status}</span>{light.status === 'faulty' && <FaExclamationTriangle className="warning-icon" />}</div>
                      <div className="light-maintenance">Last Maintained: {light.lastMaintenance}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showNotificationPanel && (
            <div className="notification-panel">
              <div className="notification-header">
                <h3>System Notifications</h3>
                <button className="close-btn" onClick={toggleNotifications}><FaTimes /></button>
              </div>
              <ul className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <li key={notification.id} className={`notification-item ${notification.type}`} onClick={() => {
                      const junction = trafficData.junctions.find(j => j.id === notification.junction);
                      if (junction) {
                        setSelectedJunction(junction);
                        setShowNotificationPanel(false);
                      }
                      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, seen: true } : n));
                    }}>
                      {notification.type === 'alert' ? <FaExclamationTriangle className="notification-icon" /> : <FaCheckCircle className="notification-icon" />}
                      <div className="notification-details">
                        <span className="notification-message">{notification.message}</span>
                        <span className="notification-time">{notification.timestamp}</span>
                      </div>
                      {!notification.seen && <span className="new-badge">New</span>}
                    </li>
                  ))
                ) : (
                  <li className="no-notifications">No notifications at this time</li>
                )}
              </ul>
            </div>
          )}

          <div className="dashboard-sections">
            <div className="traffic-map-section">
              <h3><FaMapMarkedAlt /> Traffic Map</h3>
              <div className="map-container"><div className="placeholder-map">Interactive Traffic Map</div></div>
            </div>
            <div className="events-section">
              <h3>Recent Events</h3>
              <ul className="events-list">
                {trafficData.recentEvents.map(event => (
                  <li key={event.id} className={`event-item ${event.type}`}>
                    {event.type === 'alert' ? <FaExclamationTriangle className="event-icon" /> : <FaCheckCircle className="event-icon" />}
                    <div className="event-details">
                      <span className="event-message">{event.message}</span>
                      <span className="event-time">{event.timestamp}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
