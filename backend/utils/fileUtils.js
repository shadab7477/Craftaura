import fs from 'fs';
import util from 'util';

// Use util.promisify to convert fs.unlink (callback-based) into a Promise-based function
const unlinkAsync = util.promisify(fs.unlink);

export { unlinkAsync };
