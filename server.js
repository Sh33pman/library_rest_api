// @ts-check
import express from 'express';
import 'babel-polyfill';
import cors from 'cors';
import env from './env';
import usersRoute from './app/routes/usersRoute';
import categoryRoutes from './app/routes/categoryRoutes';
import bookRoutes from './app/routes/bookRoutes';
import authorRoutes from './app/routes/authorRoutes';

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/v1', usersRoute);
app.use('/api/v1', categoryRoutes);
app.use('/api/v1', authorRoutes);
app.use('/api/v1', bookRoutes);

app.listen(env.port).on('listening', () => {
    console.log(`🚀 are live on ${env.port}`);
});


export default app;