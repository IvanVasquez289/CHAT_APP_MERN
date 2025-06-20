import {  User } from '../models/user.model'; // ajusta si el nombre del modelo es diferente

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}