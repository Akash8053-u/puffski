const Country = require('../models/Country');
const { ObjectId } = require('mongodb');
const constants = require('../utils/constants');

class CountryService {
  async saveCountry(data, context) {
    try {
      if (!data.name || typeof data.name === 'undefined') {
        return {
          success: false,
          error: {
            code: 404,
            message: constants.country.NAME_REQUIRED || 'Country name is required'
          }
        };
      }

      const query = {
        isDeleted: false,
        name: data.name,
        type: data.type || 'country',
        status: 'active'
      };

      const existingCountry = await Country.findOne(query);

      if (existingCountry) {
        return {
          success: false,
          error: {
            code: 400,
            message: constants.country.COUNTRY_ALREADY_EXIST || 'Country already exists'
          }
        };
      }

      // Add user who created it
      if (context?.user?.id) {
        data.addedBy = context.user.id;
      }

      const newCountry = await Country.create(data);

      return {
        success: true,
        code: 200,
        data: newCountry,
        message: constants.country.COUNTRY_SAVED || 'Country saved successfully'
      };
    } catch (error) {
      console.error('Save country error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }

  async updateCountry(data, context) {
    try {
      if (!data.id || !data.name) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Country ID and name are required'
          }
        };
      }

      // Check if another country with same name exists
      const duplicateCheck = await Country.findOne({
        name: data.name,
        _id: { $ne: new ObjectId(data.id) },
        isDeleted: false,
        type: data.type || 'country'
      });

      if (duplicateCheck) {
        return {
          success: false,
          error: {
            code: 400,
            message: constants.country.COUNTRY_ALREADY_EXIST || 'Country with this name already exists'
          }
        };
      }

      // Add user who updated it
      if (context?.user?.id) {
        data.updatedBy = context.user.id;
      }

      const updatedCountry = await Country.findByIdAndUpdate(
        data.id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!updatedCountry) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Country not found'
          }
        };
      }

      return {
        success: true,
        code: 200,
        data: updatedCountry,
        message: constants.country.UPDATED_COUNTRY || 'Country updated successfully'
      };
    } catch (error) {
      console.error('Update country error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }

  async deleteCountry(data, context) {
    try {
      if (!data.id) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Country ID is required'
          }
        };
      }

      const updateData = {
        isDeleted: true,
        updatedAt: new Date()
      };

      // Add user who deleted it
      if (context?.user?.id) {
        updateData.updatedBy = context.user.id;
      }

      const deletedCountry = await Country.findByIdAndUpdate(
        data.id,
        { $set: updateData },
        { new: true }
      );

      if (!deletedCountry) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Country not found'
          }
        };
      }

      return {
        success: true,
        code: 200,
        data: { message: 'Country deleted successfully' },
        message: 'Country deleted successfully'
      };
    } catch (error) {
      console.error('Delete country error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }

  async getSingleCountry(id) {
    try {
      const country = await Country.findOne({
        _id: id,
        isDeleted: false,
        status: 'active'
      });

      if (!country) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Country not found'
          }
        };
      }

      return {
        success: true,
        code: 200,
        data: country
      };
    } catch (error) {
      console.error('Get single country error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }

  async getAllCountries(queryParams = {}) {
    try {
      const {
        sortBy = 'createdAt desc',
        type,
        search,
        page = 1,
        limit = 10,
        status = 'active'
      } = queryParams;

      // Build query
      const query = {
        isDeleted: false,
        status: status
      };

      if (type) {
        query.type = type;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } }
        ];
      }

      // Parse sortBy
      let sort = {};
      const [sortField, sortOrder] = sortBy.split(' ');
      sort[sortField] = sortOrder === 'desc' ? -1 : 1;

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [countries, total] = await Promise.all([
        Country.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('addedBy', 'firstName lastName email')
          .populate('updatedBy', 'firstName lastName email'),
        Country.countDocuments(query)
      ]);

      return {
        success: true,
        code: 200,
        data: {
          countries,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      };
    } catch (error) {
      console.error('Get all countries error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }

  async getCountryList() {
    try {
      const countries = await Country.find({
        isDeleted: false,
        status: 'active',
        type: 'country'
      })
      .sort({ name: 1 })
      .select('name code flag currency currencySymbol phoneCode timezone');

      return {
        success: true,
        code: 200,
        data: countries
      };
    } catch (error) {
      console.error('Get country list error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }

  async getCountriesByType(type) {
    try {
      if (!type) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Type is required'
          }
        };
      }

      const countries = await Country.find({
        isDeleted: false,
        status: 'active',
        type: type
      })
      .sort({ name: 1 })
      .select('name code type');

      return {
        success: true,
        code: 200,
        data: countries
      };
    } catch (error) {
      console.error('Get countries by type error:', error);
      return {
        success: false,
        error: {
          code: 400,
          message: error.message
        }
      };
    }
  }
}

module.exports = new CountryService();