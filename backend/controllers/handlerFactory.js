const AppError = require('../middleware/errorHandler').AppError;
const { StatusCodes } = require('http-status-codes');

// Delete a document by ID
exports.deleteOne = (Model) =>
  async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(
          new AppError(
            'No document found with that ID',
            StatusCodes.NOT_FOUND
          )
        );
      }

      res.status(StatusCodes.NO_CONTENT).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  };

// Update a document by ID
exports.updateOne = (Model) =>
  async (req, res, next) => {
    try {
      const doc = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doc) {
        return next(
          new AppError(
            'No document found with that ID',
            StatusCodes.NOT_FOUND
          )
        );
      }

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };

// Create a new document
exports.createOne = (Model) =>
  async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);

      res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };

// Get a single document by ID
exports.getOne = (Model, popOptions) =>
  async (req, res, next) => {
    try {
      let query = Model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);
      
      const doc = await query;

      if (!doc) {
        return next(
          new AppError(
            'No document found with that ID',
            StatusCodes.NOT_FOUND
          )
        );
      }

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    } catch (err) {
      next(err);
    }
  };

// Get all documents with filtering, sorting, field limiting, and pagination
exports.getAll = (Model) =>
  async (req, res, next) => {
    try {
      // To allow for nested GET reviews on tour (hack)
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };

      // 1) Build query
      const queryObj = { ...req.query };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);

      // 1.1) Advanced filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );

      let query = Model.find(JSON.parse(queryStr));

      // 2) Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
      } else {
        query = query.sort('-createdAt');
      }

      // 3) Field limiting
      if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
      } else {
        query = query.select('-__v');
      }

      // 4) Pagination
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 100;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      if (req.query.page) {
        const numTours = await Model.countDocuments();
        if (skip >= numTours) {
          return next(
            new AppError('This page does not exist', StatusCodes.NOT_FOUND)
          );
        }
      }

      // EXECUTE QUERY
      const docs = await query;

      // SEND RESPONSE
      res.status(StatusCodes.OK).json({
        status: 'success',
        results: docs.length,
        data: {
          data: docs,
        },
      });
    } catch (err) {
      next(err);
    }
  };
