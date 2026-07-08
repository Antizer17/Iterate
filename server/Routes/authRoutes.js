import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Route 1: Trigger the Google login page
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route 2: The landing zone where Google sends the user back
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // If we get here, authentication was successful!
    // Generate your own JWT session token using the authenticated req.user object
    const sessionToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Set it in a secure HTTP-only cookie and send them to the React frontend dashboard
    res.cookie('token', sessionToken, { httpOnly: true, secure: false }); 
    res.redirect('http://localhost:5173/courses'); 
  }
);

export default router;