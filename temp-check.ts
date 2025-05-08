// Este archivo es temporal y se eliminará después
// Su propósito es verificar si hay alguna referencia a jsonwebtoken en el código

// Importaciones que NO deberían existir en el proyecto
// import jwt from 'jsonwebtoken';
// import * as jwt from 'jsonwebtoken';
// const jwt = require('jsonwebtoken');

// Importaciones correctas que deberían usarse
import { SignJWT, jwtVerify } from "jose"

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || "default_secret"))
}

export async function verifyToken(token: string) {
  return await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || "default_secret"))
}
