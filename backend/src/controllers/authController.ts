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
        },
      });
    } else {
      user = await prisma.user.update({
        where: { address },
        data: { nonce: newNonce },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        address: user.address,
        nonce: user.nonce,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function verifySignature(req: Request, res: Response) {
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

    const isValid = verifyWalletSignature(address, user.nonce, signature);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid wallet signature provided.",
      });
    }

    // Refresh nonce after successful authentication to prevent signature replay
    const updatedUser = await prisma.user.update({
      where: { address },
      data: { nonce: generateNonce() },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: "WALLET_SIGN_IN",
        details: `Successfully authenticated address ${address}`,
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
