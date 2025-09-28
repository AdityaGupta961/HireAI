import express, { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index';

dotenv.config();

const app = express();
const port = 3000;``

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use('/api', router);

app.use((req: Request, res: Response, next: NextFunction) => {
    next(createHttpError(404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err.message;
  
  const error = app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({ message, error });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

export default app;