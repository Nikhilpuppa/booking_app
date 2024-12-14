const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const Place = require('./models/Place');
const Booking = require('./models/Booking.js');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const winston = require('winston'); // Import winston for logging
require('dotenv').config();

const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = 'ewrgfrtyjnyujtrtgyret';
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:5173',
        'http://192.168.49.2:30000', // Minikube IP and frontend port
        'http://192.168.49.2:30001' // Backend NodePort
    ],
}));

mongoose.connect(process.env.MONGO_URL);

// Configure winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return JSON.stringify({ timestamp, level, message });
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
    ]
});

function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) reject(err);
            resolve(userData);
        });
    });
}

app.get('/test', (req, res) => {
    res.json('test ok');
});

// Register new user
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, bcryptSalt);
    try {
        const userDoc = await User.create({
            name,
            email,
            password: hashedPassword
        });
        logger.info(`User registered: ${userDoc.email}`);
        res.json(userDoc);
    } catch (e) {
        logger.error(`Error registering user: ${e.message}`);
        res.status(422).json(e);
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        logger.warn('Login failed: Missing email or password');
        return res.status(400).json("Email and password are required.");
    }

    const userDoc = await User.findOne({ email });

    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({ email: userDoc.email, id: userDoc.id }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                }).json(userDoc);
                logger.info(`User logged in: ${userDoc.email}`);
            });
        } else {
            logger.warn(`Invalid password attempt for email: ${email}`);
            res.status(422).json('Invalid password');
        }
    } else {
        logger.warn(`User not found: ${email}`);
        res.status(404).json('User not found');
    }
});

// Profile route
app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            logger.info(`Fetched profile for user: ${userData.email}`);
            res.json({ name, email, _id });
        });
    } else {
        logger.info('No token found for profile fetch');
        return res.json(null); // Send null if no token is provided
    }
});

// Logout user
app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
    logger.info('User logged out');
});

// Upload by link
app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName,
    });
    logger.info(`File uploaded by link: ${newName}`);
    res.json(newName);
});

// Upload files
const photosMiddleWare = multer({ dest: 'uploads/' });
app.use('/uploads', express.static('uploads'));

const path = require('path'); // Ensure the 'path' module is imported

app.post('/upload', photosMiddleWare.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path: tempPath, originalname } = req.files[i];
        const ext = path.extname(originalname);
        const newPath = `${tempPath}${ext}`;
        fs.renameSync(tempPath, newPath);
        uploadedFiles.push(newPath.replace(/\\/g, '/').replace('uploads/', ''));
    }
    logger.info(`Files uploaded: ${uploadedFiles.length} files`);
    res.json(uploadedFiles);
});

// Create place
app.post('/places', (req, res) => {
    const { token } = req.cookies;
    const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title,
            address,
            photos: addedPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price
        });
        logger.info(`New place created by user ${userData.id}: ${placeDoc.title}`);
        res.json(placeDoc);
    });
});

// Fetch user places
app.get('/user-places', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const { id } = userData;
        const places = await Place.find({ owner: id });
        logger.info(`Fetched ${places.length} places for user ${userData.id}`);
        res.json(places);
    });
});

// Get all places
app.get('/places', async (req, res) => {
    const places = await Place.find();
    logger.info(`Fetched ${places.length} places`);
    res.json(places);
});

// Book a place
app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;

    if (!place || !checkIn || !checkOut || !numberOfGuests || !name || !phone || !price) {
        logger.warn('Booking failed: Missing required fields');
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    Booking.create({
        place,
        checkIn,
        checkOut,
        numberOfGuests,
        name,
        phone,
        price,
        user: userData.id,
    })
    .then((doc) => {
        logger.info(`Booking created for user ${userData.id}: ${doc._id}`);
        res.json(doc);
    })
    .catch((err) => {
        logger.error(`Error creating booking: ${err.message}`);
        res.status(500).json({ message: "An error occurred while creating the booking." });
    });
});

// Get user bookings
app.get('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    const bookings = await Booking.find({ user: userData.id }).populate('place');
    logger.info(`Fetched ${bookings.length} bookings for user ${userData.id}`);
    res.json(bookings);
});

app.listen(4000, '0.0.0.0', () => {
    logger.info('Server is running on http://0.0.0.0:4000 and accessible from Minikube IP');
});
