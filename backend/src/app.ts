import 'dotenv/config'
import cors from 'cors'
import express from 'express';
import authRoutes from './routes/auth.route'
import messageRoutes from './routes/message.route'
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db';
import { app, server } from './lib/socket.io';
import path from 'path';

const PORT = process.env.PORT || 4000;
const __dirname = path.resolve();

// middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// routes
app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    })
}

// start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB()
})