CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  country VARCHAR(80) DEFAULT '',
  city VARCHAR(120) DEFAULT '',
  postal_trade_enabled TINYINT(1) NOT NULL DEFAULT 1,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_stickers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  sticker_number VARCHAR(30) NOT NULL,
  sticker_type ENUM('need', 'offer') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_sticker_type (user_id, sticker_number, sticker_type),
  CONSTRAINT fk_user_sticker_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trade_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requester_user_id INT NOT NULL,
  target_user_id INT NOT NULL,
  requested_stickers TEXT NOT NULL,
  offered_stickers TEXT NOT NULL,
  trade_method ENUM('in_person', 'post') NOT NULL,
  location_note VARCHAR(255) DEFAULT '',
  status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_trade_requester
    FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_trade_target
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meetups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  creator_user_id INT NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  country VARCHAR(80) NOT NULL,
  city VARCHAR(120) NOT NULL,
  venue VARCHAR(180) DEFAULT '',
  starts_at DATETIME NOT NULL,
  details VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_meetup_creator
    FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wc_games (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_number INT NOT NULL UNIQUE,
  group_name CHAR(1) NOT NULL,
  stage VARCHAR(20) NOT NULL DEFAULT 'group',
  home_team VARCHAR(120) NOT NULL,
  away_team VARCHAR(120) NOT NULL,
  starts_at DATETIME NOT NULL,
  venue VARCHAR(180) NOT NULL DEFAULT '',
  city VARCHAR(120) NOT NULL DEFAULT ''
);

ALTER TABLE wc_games ADD COLUMN IF NOT EXISTS stage VARCHAR(20) NOT NULL DEFAULT 'group';

CREATE TABLE IF NOT EXISTS predictions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  home_score TINYINT UNSIGNED NOT NULL,
  away_score TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_game (user_id, game_id),
  CONSTRAINT fk_prediction_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_prediction_game
    FOREIGN KEY (game_id) REFERENCES wc_games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meetup_attendees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meetup_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_meetup_attendee (meetup_id, user_id),
  CONSTRAINT fk_meetup_attendee_meetup
    FOREIGN KEY (meetup_id) REFERENCES meetups(id) ON DELETE CASCADE,
  CONSTRAINT fk_meetup_attendee_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
