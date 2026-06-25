const prisma = require('../prisma/prisma');
const slugify = require('../utils/slugify');
const cache = require('../utils/cache');

/**
 * Get Published Projects (Public)
 * Supports pagination (?page=1&limit=10), tech tag filter (?tag=Node.js), and search (?search=CMS)
 */
exports.getProjects = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const tag = req.query.tag;
    const search = req.query.search;

    const cacheKey = `projects:list:${JSON.stringify(req.query)}`;
    const cachedProjects = cache.get(cacheKey);
    if (cachedProjects) {
      return res.status(200).json({
        success: true,
        data: cachedProjects,
      });
    }

    const skip = (page - 1) * limit;

    // Build query conditions
    const where = {
      published: true,
    };

    if (tag && tag !== 'All') {
      where.techTags = {
        has: tag,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Run parallel count and find queries
    const [total, projects] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const resultData = {
      projects,
      total,
      page,
      totalPages,
    };

    cache.set(cacheKey, resultData);

    return res.status(200).json({
      success: true,
      data: resultData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Project by Slug (Public)
 * Increments viewCount atomically to prevent race conditions.
 */
exports.getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Increment viewCount atomically in the DB and return the updated project
    // This implements the requested atomic increment strategy
    const project = await prisma.project.update({
      where: { slug },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    // If project is not found, Prisma throws code P2025
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: true,
        message: 'Project not found.',
      });
    }
    next(error);
  }
};

/**
 * List All Projects (Admin - Protected)
 * Fetch both published and draft projects.
 */
exports.getAdminProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Project (Admin - Protected)
 */
exports.createProject = async (req, res, next) => {
  try {
    const { title, slug, shortDescription, fullDescription, techTags, liveUrl, githubUrl, thumbnailUrl, published } = req.body;

    // Process unique slug
    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) {
      finalSlug = 'untitled-project';
    }

    // Verify slug uniqueness, auto-resolving collisions
    let existing = await prisma.project.findUnique({ where: { slug: finalSlug } });
    let counter = 1;
    const baseSlug = finalSlug;
    while (existing) {
      finalSlug = `${baseSlug}-${counter}`;
      existing = await prisma.project.findUnique({ where: { slug: finalSlug } });
      counter++;
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: finalSlug,
        shortDescription,
        fullDescription,
        techTags: Array.isArray(techTags) ? techTags : [],
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        published: published === true || published === 'true',
      },
    });

    cache.invalidatePattern('projects:list:');

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a Project (Admin - Protected)
 */
exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, shortDescription, fullDescription, techTags, liveUrl, githubUrl, thumbnailUrl, published, viewCount } = req.body;

    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Project not found.',
      });
    }

    // Build update object
    const updateData = {
      title,
      shortDescription,
      fullDescription,
      techTags: Array.isArray(techTags) ? techTags : [],
      liveUrl: liveUrl || null,
      githubUrl: githubUrl || null,
      thumbnailUrl: thumbnailUrl || null,
      published: published === true || published === 'true',
    };

    // If views are explicitly passed (like resetting views)
    if (viewCount !== undefined) {
      updateData.viewCount = parseInt(viewCount, 10) || 0;
    }

    // Process slug if modified
    if (slug && slug !== project.slug) {
      let finalSlug = slugify(slug);
      
      // Ensure the new slug is unique (exclude current project ID)
      const existing = await prisma.project.findFirst({
        where: {
          slug: finalSlug,
          id: { not: id },
        },
      });

      if (existing) {
        // Resolve slug collision
        let counter = 1;
        const baseSlug = finalSlug;
        let uniqueSlug = `${baseSlug}-${counter}`;
        let innerExisting = await prisma.project.findFirst({
          where: {
            slug: uniqueSlug,
            id: { not: id },
          },
        });
        while (innerExisting) {
          counter++;
          uniqueSlug = `${baseSlug}-${counter}`;
          innerExisting = await prisma.project.findFirst({
            where: {
              slug: uniqueSlug,
              id: { not: id },
            },
          });
        }
        finalSlug = uniqueSlug;
      }
      
      updateData.slug = finalSlug;
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    cache.invalidatePattern('projects:list:');

    return res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Project (Admin - Protected)
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Project not found.',
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    cache.invalidatePattern('projects:list:');

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
