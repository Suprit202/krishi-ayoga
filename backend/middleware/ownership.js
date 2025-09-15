// middleware/ownership.js
const checkOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Admin can access everything
    }

    const resourceId = req.params.id;
    let isOwner = false;

    // Check based on resource type
    if (req.baseUrl.includes('treatments')) {
      const treatment = await Treatment.findById(resourceId).populate('livestockGroupId');
      if (treatment.livestockGroupId.farmId.owner.toString() === req.user._id.toString()) {
        isOwner = true;
      }
    }
    else if (req.baseUrl.includes('livestock')) {
      const group = await LivestockGroup.findById(resourceId);
      const farm = await Farm.findById(group.farmId);
      if (farm.owner.toString() === req.user._id.toString()) {
        isOwner = true;
      }
    }
    else if (req.baseUrl.includes('farms')) {
      const farm = await Farm.findById(resourceId);
      if (farm.owner.toString() === req.user._id.toString()) {
        isOwner = true;
      }
    }

    if (!isOwner) {
      return res.status(403).json({ message: 'Access denied. You do not own this resource.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Ownership check failed', error: error.message });
  }
};

module.exports = { checkOwnership };