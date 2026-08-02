import jwt from 'jsonwebtoken';

export const googleCallback = (req, res) => {
  console.log("✅ CALLBACK HIT");
  console.log("User:", req.user?._id);

  const sessionToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('token', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }); 
  
  console.log("🍪 Cookie sent");
  res.redirect(`${process.env.CLIENT_URL}/courses`); 
};


export const logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });

  console.log("🚪 User logged out, cookie cleared");
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};