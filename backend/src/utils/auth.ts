import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import { config } from "../config";

export interface TokenPayload {
  address: string;
  userId: string;
  role: string;
}

export function generateNonce(): string {
  return `Sign this message to authenticate with Decentralized Record Registry: ${Math.floor(
    Math.random() * 1000000000
  )}-${Date.now()}`;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

export function verifyWalletSignature(
  address: string,
  message: string,
  signature: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
}
