import jwt from "jsonwebtoken";


export const verifyToken = (req, res, next) => {
  // console.log(req.cookies);
  const token = req.cookies.jwt;
  // console.log({token});
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_KEY, async(err, payload) => {
    if(err){
      return res.status(403).json({ message: "Token is invalid" });
    }
    req.userId = payload.userId;
    next();
  })
}