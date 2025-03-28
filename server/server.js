import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from "./config/db.js";
import { errorHandler } from './middlewares/errorMiddleware.js';
import userRouter from "./Routes/UserRouter.js";
import moviesRouter from "./Routes/MoviesRouter.js";
import categoriesRouter from "./Routes/CategoriesRouter.js";
import Uploadrouter from './Controllers/UploadFile.js';

dotenv.config();
import path from "path";


const app = express();
app.use(cors());
app.use(express.json());

//connect DB

connectDB();


// Main route
app.get('/', (req, res) => {
    res.send('API is running...')
})
//other route
app.use("/api/users", userRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", Uploadrouter);

// error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client', "build", "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});