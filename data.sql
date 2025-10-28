-- Create database
CREATE DATABASE IF NOT EXISTS weather_app;
USE weather_app;

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather cache table (stores latest weather for each city)
CREATE TABLE IF NOT EXISTS weather_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL UNIQUE,
  temp FLOAT NOT NULL,
  feels_like FLOAT NOT NULL,
  humidity INT NOT NULL,
  wind FLOAT NOT NULL,
  description VARCHAR(100),
  weather_code INT,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Weather logs table (for analytics - track which cities are viewed)
CREATE TABLE IF NOT EXISTS weather_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  user_ip VARCHAR(50),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  KEY (viewed_at)  -- Index for faster queries
);

-- Insert sample cities
INSERT INTO cities (name, latitude, longitude) VALUES
('Delhi', 28.7041, 77.1025),
('Mumbai', 19.0760, 72.8777),
('Beijing', 39.9042, 116.4074),
('New York', 40.7128, -74.0060),
('London', 51.5074, -0.1278),
('Tokyo', 35.6762, 139.6503),
('Sydney', -33.8688, 151.2093),
('Dubai', 25.2048, 55.2708),
('Paris', 48.8566, 2.3522)
ON DUPLICATE KEY UPDATE latitude=latitude;