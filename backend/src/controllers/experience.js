const prisma = require('../prisma/prisma');
const cache = require('../utils/cache');

/**
 * Get All Experience Entries (Public & Admin)
 * Sorted by startDate desc.
 */
exports.getExperiences = async (req, res, next) => {
  try {
    const cachedExp = cache.get('experiences');
    if (cachedExp) {
      return res.status(200).json({
        success: true,
        data: cachedExp,
      });
    }

    const experiences = await prisma.experience.findMany({
      orderBy: { startDate: 'desc' },
    });

    cache.set('experiences', experiences);

    return res.status(200).json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an Experience Entry (Admin - Protected)
 */
exports.createExperience = async (req, res, next) => {
  try {
    const { company, role, startDate, endDate, isCurrent, description } = req.body;

    const experience = await prisma.experience.create({
      data: {
        company,
        role,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent === true || isCurrent === 'true',
        description,
      },
    });

    cache.invalidate('experiences');

    return res.status(201).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an Experience Entry (Admin - Protected)
 */
exports.updateExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, role, startDate, endDate, isCurrent, description } = req.body;

    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) {
      return res.status(404).json({
        error: true,
        message: 'Experience entry not found.',
      });
    }

    const updatedExperience = await prisma.experience.update({
      where: { id },
      data: {
        company,
        role,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : (isCurrent === true ? null : undefined),
        isCurrent: isCurrent !== undefined ? (isCurrent === true || isCurrent === 'true') : undefined,
        description,
      },
    });

    cache.invalidate('experiences');

    return res.status(200).json({
      success: true,
      data: updatedExperience,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an Experience Entry (Admin - Protected)
 */
exports.deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;

    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) {
      return res.status(404).json({
        error: true,
        message: 'Experience entry not found.',
      });
    }

    await prisma.experience.delete({
      where: { id },
    });

    cache.invalidate('experiences');

    return res.status(200).json({
      success: true,
      message: 'Experience entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
