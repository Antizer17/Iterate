import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { googleCallback, logoutUser } from '../controllers/authController.js'

const router = express.Router();

// Route 1: Trigger the Google login page
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route 2: The landing zone where Google sends the user back
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

router.post('/logout', logoutUser);

export default router;