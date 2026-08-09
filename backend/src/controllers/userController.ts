import { Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const updateProfileSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
});

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const address = req.params.address ? req.params.address.toLowerCase() : req.user?.address;

    if (!address) {
      return res.status(400).json({ success: false, error: "Address is required" });
    }

    const user = await prisma.user.findUnique({
      where: { address },
      include: {
        records: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User profile not found" });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const parseResult = updateProfileSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { address: req.user.address },
      data: parseResult.data,
    });

    await prisma.auditLog.create({
      data: {
        userId: updatedUser.id,
        action: "UPDATE_PROFILE",
        details: `Updated profile details for address ${req.user.address}`,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
