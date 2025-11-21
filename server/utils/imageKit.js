const ImageKit = require("imagekit");
require('dotenv').config();

// Initialize ImageKit with env variables
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'placeholder_public',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'placeholder_private',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/placeholder'
});

module.exports = imagekit;