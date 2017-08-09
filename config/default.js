/**
 * Created by sandeepkumar on 09/08/17.
 */
const path = require('path');
require('dotenv').config();

module.exports = {
  AWS_S3_ACCESS_KEY_ID : process.env.AWS_S3_ACCESS_KEY_ID || 'AKIAIZCUODWWQWPJF2CA',
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY || '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',
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || 'seven11-image-assets',
  SFTP_USER_NAME: process.env.SFTP_USER_NAME || 'sa-infodispatch',
  SFTP_PASSWORD: process.env.SFTP_PASSWORD || 'ck755r1C',
  SFTP_HOST: process.env.SFTP_HOST || 'ftp.7-11.com',
  AWS_S3_FOLDER_PREFIX: process.env.AWS_S3_FOLDER_PREFIX || ''
}