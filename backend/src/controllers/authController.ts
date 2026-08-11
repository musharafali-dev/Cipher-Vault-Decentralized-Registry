import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { generateNonce, generateToken, verifyWalletSignature } from "../utils/auth";

const getNonceSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
});

const verifySignatureSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
  signature: z.string().min(10, "Signature is required"),
});

const SIWE_NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes validity

export async function getNonce(req: Request, res: Response) {
  try {
    const parseResult = getNonceSchema.safeParse(req.query.address ? { address: req.query.address } : req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
      });
    }

    const address = parseResult.data.address.toLowerCase();

    let user = await prisma.user.findUnique({
      where: { address },
    });

    const newNonce = generateNonce();

    if (!user) {
      user = await prisma.user.create({
        data: {
          address,
          nonce: newNonce,
          nonceCreatedAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { address },
        data: {
          nonce: newNonce,
          nonceCreatedAt: new Date(),
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        address: user.address,
        nonce: user.nonce,
        nonceCreatedAt: user.nonceCreatedAt,
        expiresInSeconds: 300,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifySignature(req: Request, res: Response) {
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1";
  const userAgent = req.headers["user-agent"] || "Unknown";

  try {
    const parseResult = verifySignatureSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
      });
    }

    const { address: rawAddress, signature } = parseResult.data;
    const address = rawAddress.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { address },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User account not found. Please request a signing nonce first.",
      });
    }

    // SIWE Nonce Expiration Safety Check
    const nonceAge = Date.now() - new Date(user.nonceCreatedAt).getTime();
    if (nonceAge > SIWE_NONCE_TTL_MS) {
      // Invalidate expired nonce
      await prisma.user.update({
        where: { address },
        data: { nonce: generateNonce(), nonceCreatedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "EXPIRED_NONCE_ATTEMPT",
          details: `SIWE authentication attempt with expired nonce (age: ${Math.round(nonceAge / 1000)}s)`,
          ipAddress: clientIp,
          userAgent,
          riskLevel: "WARN",
        },
      });

      return res.status(401).json({
        success: false,
        error: "Signing nonce has expired. Please request a fresh authentication nonce.",
      });
    }

    const isValid = verifyWalletSignature(address, user.nonce, signature);

    if (!isValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "FAILED_SIGNATURE_AUTH",
          details: `Invalid signature submitted for wallet ${address}`,
          ipAddress: clientIp,
          userAgent,
          riskLevel: "WARN",
        },
      });

      return res.status(401).json({
        success: false,
        error: "Invalid wallet signature provided.",
      });
    }

    // Invalidate nonce after single-use authentication to eliminate replay attacks
    const updatedUser = await prisma.user.update({
      where: { address },
      data: {
        nonce: generateNonce(),
        nonceCreatedAt: new Date(),
      },
    });

    // Create Security Audit Log Entry
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: "WALLET_SIGN_IN",
        details: `Successfully authenticated address ${address}`,
        ipAddress: clientIp,
        userAgent,
        riskLevel: "INFO",
      },
    });

    const token = generateToken({
      address: updatedUser.address,
      userId: updatedUser.id,
      role: updatedUser.role,
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: updatedUser.id,
          address: updatedUser.address,
          name: updatedUser.name,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
