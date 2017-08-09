/**
 * Created by sandeepkumar on 09/08/17.
 */
import path from 'path';
import dateFormat from 'dateformat';
import tar from 'tar-fs';
import SFTPClient from 'sftp-promises';
import s3 from 's3';
import copy from 'recursive-copy';
import winston from 'winston';

class ProcessImages {
  constructor(config) {
    this.sftpConfig = {
      host: config.SFTP_HOST,
      username: config.SFTP_USER_NAME,
      password: config.SFTP_PASSWORD,
    };

    this.s3Client = s3.createClient({
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
        accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
      },
    });

    this.s3Params = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Prefix: config.AWS_S3_FOLDER_PREFIX,
    };

    this.fsoptions = {
      overwrite: true,
      expand: true,
      dot: true,
      junk: true,
      filter: [
        /(\.|\/)(tif|jpe?g|png)$/i,
      ],
      rename: function(filePath) {
        return filePath.replace(/^.*[\\\/]/, '');
      },
    };
  }

  start = async () => {
    try {
      const sftp = new SFTPClient(this.sftpConfig);
      const session = await sftp.session(this.sftpConfig);

      const fileName = dateFormat(new Date(), 'mmddyyyy');
      const status = await sftp.getStream('~/Dev/711_idpi_images.07_14_2017_03_35_24.tar', tar.extract(path.join(__dirname, 'tmp', fileName + '_tar')), session);

      winston.log('Downloaded and Unziped file');

      if (status) {
        await copy(path.join(__dirname, 'tmp', fileName + '_tar'), path.join(__dirname, 'tmp', fileName + '_new'), this.fsoptions);

        const params = {
          localDir: path.join(__dirname, 'tmp', fileName + '_new'),
          deleteRemoved: true, // default false, whether to remove s3 objects
                               // that have no corresponding local file.
            s3Params: this.s3Params,
        };
        this.s3Client.uploadDir(params).on('error', function(err) {
          winston.error('unable to sync:', err.stack);
        }).on('progress', function() {
          winston.log('progress..');
        }).on('end', function() {
          winston.log('done uploading');
        });
      }
    } catch(ex) {
      winston.error(ex);
    }
  };
}

export default ProcessImages;
