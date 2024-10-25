import fs from 'node:fs';

const checkAndRemoveReadOnly = async (filePath) => {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.W_OK, (err) => {
      if (err) {
        if (err.code === 'EACCES' || err.code === 'EPERM') {
          console.log(`${filePath} is not writable. Removing the read-only attribute...`);
          // Remove the read-only attribute by changing permissions
          fs.chmod(filePath, 0o666, (chmodErr) => {
            if (chmodErr) {
              console.error('Error changing file permissions:', chmodErr);
              return reject(false);
            }
            console.log('Read-only attribute removed.');
            resolve(true);
          });
        } else {
          console.error('Error accessing file:', err);
          return reject(false);
        }
      } else {
        console.log(`${filePath} is writable.`);
        resolve(true);
      }
    });
  });
};

export default checkAndRemoveReadOnly;
