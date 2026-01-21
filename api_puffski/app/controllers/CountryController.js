const CountryService = require('../services/CountryService');
const { API } = require('../utils/helper');

class CountryController {
  constructor() {
    this.save = this.save.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.singleCountry = this.singleCountry.bind(this);
    this.getAllCountry = this.getAllCountry.bind(this);
    this.getCountryList = this.getCountryList.bind(this);
    this.getCountriesByType = this.getCountriesByType.bind(this);
  }

  async save(req, res) {
    try {
      const result = await CountryService.saveCountry(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Save country controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async update(req, res) {
    try {
      const result = await CountryService.updateCountry(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Update country controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async delete(req, res) {
    try {
      const result = await CountryService.deleteCountry(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Delete country controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async singleCountry(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Country ID is required'
          }
        });
      }

      const result = await CountryService.getSingleCountry(id);
      return res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      console.error('Single country controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async getAllCountry(req, res) {
    try {
      const result = await CountryService.getAllCountries(req.query);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get all countries controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async getCountryList(req, res) {
    try {
      const result = await CountryService.getCountryList();
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get country list controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async getCountriesByType(req, res) {
    try {
      const { type } = req.params;
      if (!type) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Type parameter is required'
          }
        });
      }

      const result = await CountryService.getCountriesByType(type);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get countries by type controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }

  async getAll(req, res) {
    try {
      const { type, search, sortBy = 'name asc', page = 1, limit = 50 } = req.query;
      
      const result = await CountryService.getAllCountries({
        type,
        search,
        sortBy,
        page,
        limit
      });
      
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      console.error('Get all controller error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }
}

module.exports = new CountryController();