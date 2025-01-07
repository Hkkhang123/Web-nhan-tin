import jwt from "jsonwebtoken"

export const generateJWT = (userId, res) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET, {
        expiresIn:"7d"
    })

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //milisecond
        httpOnly: true, //Tránh các cuộc tấn công XSS
        saneSite: "strict", // Về tấn công CSRF
        secure: process.env.NODE_ENV !== "developement"
    })

    return token
}