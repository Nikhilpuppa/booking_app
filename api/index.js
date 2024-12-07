const express = require('express')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const Place = require('./models/Place')
const Booking=require('./models/Booking.js')
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();

const bcryptSalt = bcrypt.genSaltSync(12);
const jwtSecret = 'ewrgfrtyjnyujtrtgyret';
app.use('/uploads',express.static(__dirname+'/uploads'));
app.use(express.json());
app.use(cookieParser());



app.use(cors({
    credentials: true, // Allow cookies to be sent with requests
    origin: [
      'http://localhost:5173',  // Allow the frontend URL
      'http://192.168.49.2:30000'
    //   'http://192.168.49.2:30001'// Allow Minikube IP with port 30000
    ],
  }));
  



console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL);

function getUserDataFromReq(req){
    return new Promise((resolve,reject)=>{
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err;
            resolve(userData);
        });
    });
    
}

app.get('/test',(req,res) => {
    res.json('test ok');
});

app.post('/register',async (req,res) => {
    const {name,email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password, bcryptSalt);
    try{
        const userDoc = await User.create({
            name,
            email,
            password:hashedPassword
        });
        res.json(userDoc)
    }
    catch(e){
        res.status(422).json(e);
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json("Email and password are required.");
    }

    const userDoc = await User.findOne({ email });

    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({email:userDoc.email,id:userDoc.id},jwtSecret,{},(err,token) => {
                if(err) throw err;
                res.cookie('token', token, {
                    httpOnly: true,   // Protects against XSS
                    secure: true,     // Ensures cookies are sent over HTTPS (use `false` for local dev)
                    sameSite: 'none', // Enables cross-origin cookies
                }).json(userDoc);
                
            })

        } else {
            res.status(422).json('Invalid password');
        }
    } else {
        res.status(404).json('User not found');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;

    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err;
            const {name,email,_id} = await User.findById(userData.id);
            res.json({name,email,_id});
        });
    } else {
        return res.json(null); // Send null if no token is provided
    }
});


app.post('/logout',(req,res) => {
    res.cookie('token','').json(true);
})


app.post('/upload-by-link',async (req,res) => {
    const {link} = req.body;
    const newName = 'photo'+Date.now()+'.jpg';
    await imageDownloader.image({
        url: link,
        dest: __dirname+'/uploads/'+newName,
    });
    res.json(newName)
})

const photosMiddleWare = multer({dest:'uploads/'})
app.use('/uploads', express.static('uploads'));

const path = require('path'); // Ensure the 'path' module is imported

app.post('/upload', photosMiddleWare.array('photos', 100), (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const { path: tempPath, originalname } = req.files[i];
        const ext = path.extname(originalname);
        const newPath = `${tempPath}${ext}`;

        // Rename the file to include the correct extension
        fs.renameSync(tempPath, newPath);

        // Normalize the path to use '/' for frontend compatibility
        uploadedFiles.push(newPath.replace(/\\/g, '/').replace('uploads/', ''));
    }

    res.json(uploadedFiles);
});


app.post('/places',(req,res) => {
    console.log("hi");
    const {token} = req.cookies;
    const {
        title,address,addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if(err) throw err;
        const placeDoc = await Place.create({
            owner:userData.id,
            title,address,photos:addedPhotos,description,
            perks,extraInfo,checkIn,checkOut,maxGuests,price
        })
        res.json(placeDoc)
    });

})


app.get('/user-places',(req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        res.json(await Place.find({owner:id}));
    })
})


app.get(`/places/:id`,async (req,res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
}) 


app.put('/places',async(req,res) => {
    const {token} = req.cookies;
    const {
        id,title,address,addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price} = req.body
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if(err) throw err;
        const placeDoc = await Place.findById(id);
        if(userData.id  === placeDoc.owner.toString()){
            placeDoc.set({
                title,address,photos:addedPhotos,description,
                perks,extraInfo,checkIn,checkOut,maxGuests,price
            });
            await placeDoc.save();
            res.json('ok');
        }
    });
})

app.get('/places',async(req,res) => {
    console.log("dg");
    res.json(await Place.find());
})

app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req);
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;

    // Check if all required parameters are provided
    if (!place || !checkIn || !checkOut || !numberOfGuests || !name || !phone || !price) {
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
        res.json(doc);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "An error occurred while creating the booking." });
    });
});


app.get('/bookings', async(req,res)=>{
    const userData=await getUserDataFromReq(req);
    res.json(await Booking.find({user:userData.id}).populate('place'))
    

})


app.listen(4000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:4000 and accessible from Minikube IP');
  });