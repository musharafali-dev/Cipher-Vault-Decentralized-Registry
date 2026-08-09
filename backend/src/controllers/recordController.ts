import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const syncRecordSchema = z.object({
  onChainId: z.string().min(1, "onChainId is required"),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  title: z.string().min(1, "Title is required"),
  contentHash: z.string().min(1, "contentHash is required"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().optional().default(true),
});

export async function getRecords(req: Request, res: Response) {
  try {
    const { category, ownerAddress, search, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      isActive: true,
    };

    if (category) {
      whereClause.category = String(category);
    }

    if (ownerAddress) {
      whereClause.ownerAddress = String(ownerAddress).toLowerCase();
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search) } },
        { contentHash: { contains: String(search) } },
        { category: { contains: String(search) } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.recordCache.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          owner: {
            select: { address: true, name: true, avatar: true },
          },
        },
      }),
      prisma.recordCache.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      data: records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getRecordById(req: Request, res: Response) {
  try {
    const { onChainId } = req.params;

    const record = await prisma.recordCache.findUnique({
      where: { onChainId },
      include: {
        owner: {
          select: { address: true, name: true, avatar: true, email: true },
        },
      },
    });

    if (!record) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function syncRecord(req: AuthenticatedRequest, res: Response) {
  try {
    const parseResult = syncRecordSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
      });
    }

    const { onChainId, ownerAddress: rawOwner, title, contentHash, category, isActive } = parseResult.data;
    const ownerAddress = rawOwner.toLowerCase();

    // Ensure user exists in DB
    let user = await prisma.user.findUnique({ where: { address: ownerAddress } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          address: ownerAddress,
          nonce: "0",
        },
      });
    }

    const record = await prisma.recordCache.upsert({
      where: { onChainId },
      update: {
        title,
        contentHash,
        category,
        isActive,
      },
      create: {
        onChainId,
        ownerAddress,
        title,
        contentHash,
        category,
        isActive,
      },
    });

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getHealth(req: Request, res: Response) {
  try {
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "healthy",
      service: "web3-record-registry-api",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "unhealthy",
      error: error.message,
    });
  }
}
