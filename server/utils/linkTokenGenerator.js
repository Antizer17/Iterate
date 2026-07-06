import jwt from 'jsonwebtoken'
export default async function getLinkToken(userID,courseCode, currentOrder){
const linkToken = jwt.sign({
 id: userID,courseCode, currentOrder
}, process.env.JWT_SECRET)
return linkToken;
}

