-- Migration: create forgot_passwords table
CREATE TABLE IF NOT EXISTS `forgot_passwords` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_login` INT NOT NULL,
  `otp_hash` VARCHAR(255) NOT NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `expires_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_login`)
);
