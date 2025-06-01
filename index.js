const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./connection/config');
connectDB();
const port = process.env.PORT || 1000;

// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:5173', // Your frontend URL
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

const userRoutes = require('./routes/userRoutes');
//admin routes
const adminRoutes = require('./routes/adminRoutes');

app.get('/',(req,res)=>{
    res.send('Server is runing with api!');
})

//User routes
app.use('/api',userRoutes);

///admin routes are used to manage admin functionalities
app.use('/api', adminRoutes);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})