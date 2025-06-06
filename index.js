const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./connection/config');
connectDB();
const bodyParser = require('body-parser');

const port = process.env.PORT || 1000;

// CORS Configuration
const corsOptions = {
    // origin: 'http://localhost:5173', // Your frontend URL
    origin: 'https://blog-frontend-pi-rose.vercel.app/', // Your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header for client-side access
    credentials: true,
    optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions)); // Use the corsOptions configuration
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));


const userRoutes = require('./routes/userRoutes');
//admin routes
const adminRoutes = require('./routes/adminRoutes');
// const { createCategory } = require('./controllers/categoryControllers');
//category routes
const categoryRoutes = require('./routes/categoryRoutes');
//blog routes
const blogRoutes = require('./routes/blogRoutes');
//contact routes
const contactRoutes = require('./routes/contactRoutes');



app.get('/',(req,res)=>{
    res.send('Server is runing with api!');
})


//User routes
app.use('/api',userRoutes);

///admin routes are used to manage admin functionalities
app.use('/api', adminRoutes);

//Category routes
app.use('/api', categoryRoutes);

//Blog routes
app.use('/api', blogRoutes);

//contact routes
app.use('/api', contactRoutes)

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})