const { ObjectId } = require('mongodb');
const NodeGeocoder = require('node-geocoder');
const geoip = require('geoip-lite');
const geodist = require('geodist');

const local = require('../config/local');

const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: local.GOOGLE_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

class CommonService {
  constructor() {
    this.LatLngCity = this.LatLngCity.bind(this);
    this.getUserStoreLike = this.getUserStoreLike.bind(this);
    this.getUserProductLike = this.getUserProductLike.bind(this);
    this.getUserreviews = this.getUserreviews.bind(this);
    this.getUserproductreviews = this.getUserproductreviews.bind(this);
    this.distance = this.distance.bind(this);
    this.addressLatLng = this.addressLatLng.bind(this);
  }

  async allcities(data, context) {
    try {
      const City = require('../models/City');
      const cities = await City.find({ isDeleted: false, status: 'active' })
        .sort({ name: 1 });

      if (cities.length === 0) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'No cities found',
          },
        };
      }

      return {
        success: true,
        data: {
          code: 200,
          data: cities,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async allLowercities(data, context) {
    try {
      const City = require('../models/City');
      const cities = await City.find({ isDeleted: false, status: 'active' })
        .sort({ name: 1 });

      if (cities.length === 0) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'No cities found',
          },
        };
      }

      const lowerCities = cities.map(city => ({
        ...city.toObject(),
        name: city.name.toLowerCase(),
      }));

      return {
        success: true,
        data: {
          code: 200,
          data: lowerCities,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async getcity(data, context) {
    try {
      const City = require('../models/City');
      const city = await City.findOne({
        _id: data.id,
        isDeleted: false,
        status: 'active',
      });

      if (!city) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'City not found',
          },
        };
      }

      return {
        success: true,
        data: {
          code: 200,
          city: city,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async saveCity(data, context) {
    try {
      if (!data.name || typeof data.name === 'undefined') {
        return {
          success: false,
          error: { code: 404, message: 'City name is required' },
        };
      }

      const City = require('../models/City');
      const cityInfo = await City.findOne({
        name: data.name,
        isDeleted: false,
        status: 'active',
      });

      if (cityInfo) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'City already exists',
          },
        };
      }

      const newCity = await City.create(data);

      return {
        success: true,
        code: 200,
        data: {
          city: newCity,
          message: 'City saved successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async updateCity(data, context) {
    try {
      const City = require('../models/City');
      const cityInfo = await City.findByIdAndUpdate(data.id, data, { new: true });

      if (!cityInfo) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'Failed to update city',
          },
        };
      }

      return {
        success: true,
        code: 200,
        data: {
          city: cityInfo,
          message: 'City updated successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async delete(data, context) {
    try {
      const City = require('../models/City');
      const cityInfo = await City.findByIdAndDelete(data.id);

      if (!cityInfo) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'Failed to delete city',
          },
        };
      }

      return {
        success: true,
        code: 200,
        data: {
          message: 'City deleted successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async allBrands(data, context) {
    try {
      const Item = require('../models/Item');
      const brands = await Item.find({ isDeleted: false })
        .sort({ name: 1 });

      if (brands.length === 0) {
        return {
          success: false,
          error: {
            code: 400,
            message: 'No brands found',
          },
        };
      }

      return {
        success: true,
        data: {
          code: 200,
          data: brands,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async searchCity(data, context, req, res) {
    try {
      const city = req.query.city;
      const query = { status: 'active', isDeleted: false };

      if (city) {
        query.name = new RegExp(city, 'i');
      }

      const City = require('../models/City');
      const cities = await City.find(query);

      if (cities.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No cities found',
        });
      }

      return res.status(200).json({
        success: true,
        data: cities,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async mobUserLiked(data, context, req, res) {
    try {
      const addedBy = context.user?.id;
      if (!addedBy) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const Users = require('../models/Users');
      const userDetail = await Users.findById(addedBy).select('-password');

      const storeLike = await this.getUserStoreLike(addedBy);
      const productLike = await this.getUserProductLike(addedBy);
      const reviewResponse = await this.getUserreviews(addedBy);
      const productReviewResponse = await this.getUserproductreviews(addedBy);

      return res.status(200).json({
        success: true,
        message: 'Successfully executed',
        userDetail: userDetail,
        storeLike: storeLike.data,
        productLike: productLike.data,
        reviews: reviewResponse.data,
        reviews_strain: productReviewResponse.data,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async FeaturedData(data, context, req, res) {
    try {
      if (!data.businessType || typeof data.businessType === 'undefined') {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Business type is required',
            key: 'BUSINESS_TYPE',
          },
        };
      }

      const { search, page = 1, count = 10, city, businessType } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);

      const ip = req.ip;
      const ipArray = ip.split(':');
      const ipAddress = ipArray[ipArray.length - 1];
      const geo = geoip.lookup(ipAddress);

      const query = {
        isFeatured: true,
        isDeleted: false,
        businessType: { $regex: businessType, $options: 'i' },
      };

      if (city) {
        query.allCity = { $in: [city.toLowerCase()] };
      } else if (geo?.city) {
        query.allCity = { $in: [geo.city.toLowerCase()] };
      }

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const Item = require('../models/Item');
      const totalresults = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            allCity: '$allCity',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            store_status: '$addedBy.status',
            background: '$background',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            isFeatured: '$isFeatured',
            isFeatureDelivery: '$isFeatureDelivery',
            isFeaturedDelivery: '$isFeaturedDelivery',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            slug: '$slug',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
          },
        },
        { $match: query },
      ]);

      const results = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            allCity: '$allCity',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            store_status: '$addedBy.status',
            background: '$background',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            isFeatured: '$isFeatured',
            isFeatureDelivery: '$isFeatureDelivery',
            isFeaturedDelivery: '$isFeaturedDelivery',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            slug: '$slug',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
          },
        },
        { $match: query },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);

      if (results.length) {
        let j = 0;
        const geoResponse = await this.addressLatLng(geo?.city || '');
        
        const userlat = req.query.lat || (geoResponse.data?.[0]?.latitude || 0);
        const userlng = req.query.lng || (geoResponse.data?.[0]?.longitude || 0);

        for (let i = 0; i < results.length; i++) {
          const avgdis = geodist(
            { lat: parseFloat(userlat), lon: parseFloat(userlng) },
            { lat: results[j].lat, lon: results[j].lng }
          );
          results[j].kilometers = avgdis * 1.60934;

          if (j + 1 === results.length) {
            results.sort((a, b) => a.kilometers - b.kilometers);
            return res.json({
              success: true,
              data: {
                items: results,
                total: totalresults.length,
              },
            });
          } else {
            j++;
          }
        }
      } else {
        return res.json({
          success: true,
          data: {
            items: [],
            total: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error in FeaturedData:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async featuredDeliveryStores(data, context, req, res) {
    try {
      if (!data.businessType || typeof data.businessType === 'undefined') {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Business type is required',
            key: 'BUSINESS_TYPE',
          },
        };
      }

      const { search, page = 1, count = 10, city, businessType } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);

      const ip = req.ip;
      const ipArray = ip.split(':');
      const ipAddress = ipArray[ipArray.length - 1];
      const geo = geoip.lookup(ipAddress);

      const query = {
        isFeaturedDelivery: true,
        isDeleted: false,
        businessType: { $regex: businessType, $options: 'i' },
      };

      if (city) {
        query.allCity = { $in: [city.toLowerCase()] };
      } else if (geo?.city) {
        query.allCity = { $in: [geo.city.toLowerCase()] };
      }

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const Item = require('../models/Item');
      const totalresults = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            allCity: '$allCity',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            store_status: '$addedBy.status',
            background: '$background',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            isFeatured: '$isFeatured',
            isFeaturedDelivery: '$isFeaturedDelivery',
            storeLicence: '$storeLicence',
            govtRegulationWebsite: '$govtRegulationWebsite',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            slug: '$slug',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
            thirdParty: '$thirdParty',
          },
        },
        { $match: query },
      ]);

      const results = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            allCity: '$allCity',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            store_status: '$addedBy.status',
            background: '$background',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            isFeatured: '$isFeatured',
            isFeaturedDelivery: '$isFeaturedDelivery',
            storeLicence: '$storeLicence',
            govtRegulationWebsite: '$govtRegulationWebsite',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            slug: '$slug',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
            thirdParty: '$thirdParty',
          },
        },
        { $match: query },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);

      if (results.length) {
        let j = 0;
        const geoResponse = await this.addressLatLng(geo?.city || '');
        
        const userlat = req.query.lat || (geoResponse.data?.[0]?.latitude || 0);
        const userlng = req.query.lng || (geoResponse.data?.[0]?.longitude || 0);

        for (let i = 0; i < results.length; i++) {
          const avgdis = geodist(
            { lat: parseFloat(userlat), lon: parseFloat(userlng) },
            { lat: results[j].lat, lon: results[j].lng }
          );
          results[j].kilometers = avgdis * 1.60934;

          if (j + 1 === results.length) {
            results.sort((a, b) => a.kilometers - b.kilometers);
            return res.json({
              success: true,
              data: {
                items: results,
                total: totalresults.length,
              },
            });
          } else {
            j++;
          }
        }
      } else {
        return res.json({
          success: true,
          data: {
            items: [],
            total: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error in featuredDeliveryStores:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async reserveAheadStores(data, context, req, res) {
    try {
      if (!data.businessType || typeof data.businessType === 'undefined') {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Business type is required',
            key: 'BUSINESS_TYPE',
          },
        };
      }

      const { search, page = 1, count = 10, city, businessType } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);

      const ip = req.ip;
      const ipArray = ip.split(':');
      const ipAddress = ipArray[ipArray.length - 1];
      const geo = geoip.lookup(ipAddress);

      const query = {
        reservedAhead: true,
        isDeleted: false,
        businessType: { $regex: businessType, $options: 'i' },
      };

      if (city) {
        query.allCity = { $in: [city.toLowerCase()] };
      } else if (geo?.city) {
        query.allCity = { $in: [geo.city.toLowerCase()] };
      }

      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const Item = require('../models/Item');
      const totalresults = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            allCity: '$allCity',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            store_status: '$addedBy.status',
            background: '$background',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            reservedAhead: '$reservedAhead',
            storeLicence: '$storeLicence',
            govtRegulationWebsite: '$govtRegulationWebsite',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            slug: '$slug',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
          },
        },
        { $match: query },
      ]);

      const results = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            allCity: '$allCity',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            store_status: '$addedBy.status',
            background: '$background',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            reservedAhead: '$reservedAhead',
            storeLicence: '$storeLicence',
            govtRegulationWebsite: '$govtRegulationWebsite',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            slug: '$slug',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
          },
        },
        { $match: query },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);

      if (results.length) {
        let j = 0;
        const geoResponse = await this.addressLatLng(geo?.city || '');
        
        const userlat = req.query.lat || (geoResponse.data?.[0]?.latitude || 0);
        const userlng = req.query.lng || (geoResponse.data?.[0]?.longitude || 0);

        for (let i = 0; i < results.length; i++) {
          const avgdis = geodist(
            { lat: parseFloat(userlat), lon: parseFloat(userlng) },
            { lat: results[j].lat, lon: results[j].lng }
          );
          results[j].kilometers = avgdis * 1.60934;

          if (j + 1 === results.length) {
            return res.status(200).json({
              success: true,
              data: {
                items: results,
                total: totalresults.length,
              },
            });
          } else {
            j++;
          }
        }
      } else {
        return res.status(200).json({
          success: true,
          data: {
            items: [],
            total: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error in reserveAheadStores:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async mobFeaturedItem(data, context, req, res) {
    try {
      const { page = 1, count = 10, businessType, city, search } = req.body;
      const skipNo = (parseInt(page) - 1) * parseInt(count);

      const ip = req.ip;
      const ipArray = ip.split(':');
      const ipAddress = ipArray[ipArray.length - 1];
      const geo = geoip.lookup(ipAddress);

      const query = {
        isFeatured: true,
        isDeleted: false,
        status: 'active',
      };

      if (search) {
        query.name = new RegExp(search, 'i');
      }

      if (city) {
        query.city = new RegExp(city, 'i');
      } else if (geo?.city) {
        query.city = new RegExp(geo.city, 'i');
      }

      if (businessType && businessType.length > 0) {
        query.businessType = { $in: businessType };
      }

      const Item = require('../models/Item');
      const items = await Item.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            id: '$_id',
            name: '$name',
            city: '$city',
            address: '$address',
            postal_code: '$postal_code',
            email: '$email',
            mobile: '$mobile',
            website: '$website',
            about_us: '$about_us',
            image: '$image',
            addedBy: '$addedBy.username1',
            logo: '$logo',
            lat: '$lat',
            businessType: '$businessType',
            medical: '$medical',
            recreation: '$recreation',
            lng: '$lng',
            isFeatured: '$isFeatured',
            scheduler: '$scheduler',
            isDeleted: '$isDeleted',
            status: '$status',
            recreational: '$recreational',
            userVisit: '$userVisit',
            totalReviews: '$totalReviews',
            totalRating: '$totalRating',
            createdAt: '$createdAt',
          },
        },
        { $match: query },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);

      const group_to_values = items.reduce((obj, item) => {
        obj[item.businessType] = obj[item.businessType] || [];
        obj[item.businessType].push(item);
        return obj;
      }, {});

      return res.status(200).json({
        success: true,
        items: group_to_values,
      });
    } catch (error) {
      console.error('Error in mobFeaturedItem:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async ItemProductReview(data, context, req, res) {
    try {
      const { product, page = 1, count = 10, city, sortBy } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);

      const sortquery = {};
      if (sortBy) {
        const [field, sortType] = sortBy.split(' ');
        sortquery[field] = sortType === 'desc' ? -1 : 1;
      } else {
        sortquery.createdAt = -1;
      }

      const condition = { isDeleted: false, type: 'dispensary' };

      const Reviews = require('../models/Reviews');
      const totalresults = await Reviews.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: 'itemproduct',
            localField: 'item_id',
            foreignField: 'dispensary_id',
            as: 'itemProductData',
          },
        },
        { $unwind: { path: '$itemProductData', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        {
          $lookup: {
            from: 'item',
            localField: 'item_id',
            foreignField: '_id',
            as: 'itemData',
          },
        },
        { $unwind: '$itemData' },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            detail: '$detail',
            rating: '$rating',
            replies: '$replies',
            type: '$type',
            item_id: '$item_id',
            isRevoked: '$isRevoked',
            staffRating: '$staffRating',
            storeLayoutRating: '$storeLayoutRating',
            firstName: '$addedBy.firstName',
            lastName: '$addedBy.lastName',
            fullName: '$addedBy.fullName',
            store: '$itemData',
          },
        },
        {
          $group: {
            _id: { item_id: '$item_id' },
            createdAt: { $first: '$createdAt' },
            detail: { $first: '$detail' },
            rating: { $first: '$rating' },
            replies: { $first: '$replies' },
            item_id: { $first: '$item_id' },
            type: { $first: '$type' },
            isRevoked: { $first: '$isRevoked' },
            staffRating: { $first: '$staffRating' },
            storeLayoutRating: { $first: '$storeLayoutRating' },
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            fullName: { $first: '$fullName' },
            store: { $first: '$store' },
          },
        },
      ]);

      const results = await Reviews.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: 'itemproduct',
            localField: 'item_id',
            foreignField: 'dispensary_id',
            as: 'itemProductData',
          },
        },
        { $unwind: { path: '$itemProductData', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        {
          $lookup: {
            from: 'item',
            localField: 'item_id',
            foreignField: '_id',
            as: 'itemData',
          },
        },
        { $unwind: '$itemData' },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            detail: '$detail',
            rating: '$rating',
            replies: '$replies',
            item_id: '$item_id',
            type: '$type',
            isRevoked: '$isRevoked',
            staffRating: '$staffRating',
            storeLayoutRating: '$storeLayoutRating',
            firstName: '$addedBy.firstName',
            lastName: '$addedBy.lastName',
            fullName: '$addedBy.username1',
            store: '$itemData.name',
          },
        },
        {
          $group: {
            _id: { item_id: '$item_id' },
            createdAt: { $first: '$createdAt' },
            detail: { $first: '$detail' },
            rating: { $first: '$rating' },
            replies: { $first: '$replies' },
            item_id: { $first: '$item_id' },
            type: { $first: '$type' },
            isRevoked: { $first: '$isRevoked' },
            staffRating: { $first: '$staffRating' },
            storeLayoutRating: { $first: '$storeLayoutRating' },
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            fullName: { $first: '$fullName' },
            store: { $first: '$store' },
          },
        },
        { $sort: sortquery },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);

      if (results.length) {
        return res.json({
          success: true,
          data: {
            items: results,
            total: totalresults.length,
          },
        });
      } else {
        return res.json({
          success: true,
          data: {
            items: [],
            total: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error in ItemProductReview:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async ProductReview(data, context, req, res) {
    try {
      const { product, page = 1, count = 10, city, sortBy } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);

      const sortquery = {};
      if (sortBy) {
        const [field, sortType] = sortBy.split(' ');
        sortquery[field] = sortType === 'desc' ? -1 : 1;
      } else {
        sortquery.createdAt = -1;
      }

      const condition = { isDeleted: false };

      const Productreviews = require('../models/Productreviews');
      const totalresults = await Productreviews.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: 'product',
            localField: 'product_id',
            foreignField: '_id',
            as: 'itemProductData',
          },
        },
        { $unwind: '$itemProductData' },
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            detail: '$detail',
            rating: '$rating',
            replies: '$replies',
            reward_point: '$reward_point',
            strongWereEffect: '$strongWereEffect',
            strongWereEffects: '$strongWereEffects',
            isRevoked: '$isRevoked',
            typeOfUser: '$typeOfUser',
            firstName: '$addedBy.firstName',
            lastName: '$addedBy.lastName',
            fullName: '$addedBy.username1',
            productData: '$itemProductData',
          },
        },
      ]);

      const results = await Productreviews.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: 'product',
            localField: 'product_id',
            foreignField: '_id',
            as: 'itemProductData',
          },
        },
        { $unwind: '$itemProductData' },
        {
          $lookup: {
            from: 'users',
            localField: 'addedBy',
            foreignField: '_id',
            as: 'addedBy',
          },
        },
        { $unwind: '$addedBy' },
        {
          $lookup: {
            from: 'producer',
            localField: 'itemProductData.producer',
            foreignField: '_id',
            as: 'producerData',
          },
        },
        { $unwind: '$producerData' },
        {
          $project: {
            _id: '$_id',
            createdAt: '$createdAt',
            detail: '$detail',
            rating: '$rating',
            replies: '$replies',
            reward_point: '$reward_point',
            strongWereEffect: '$strongWereEffect',
            strongWereEffects: '$strongWereEffects',
            isRevoked: '$isRevoked',
            typeOfUser: '$typeOfUser',
            firstName: '$addedBy.firstName',
            lastName: '$addedBy.lastName',
            fullName: '$addedBy.username1',
            producer: '$producerData.name',
            itemName: '$itemProductData.name',
          },
        },
        { $sort: sortquery },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);

      if (results.length) {
        return res.json({
          success: true,
          data: {
            items: results,
            total: totalresults.length,
          },
        });
      } else {
        return res.json({
          success: true,
          data: {
            items: [],
            total: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error in ProductReview:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async saveBanner(data, context) {
    try {
      const { name, image, bannerType, bannerSize, url } = data;
      
      if (!name || !image || !bannerType || !bannerSize || !url) {
        return {
          success: false,
          error: { code: 404, message: 'All banner fields are required' },
        };
      }

      data.addedBy = context.user?.id;

      const Banners = require('../models/Banners');
      const addedbanner = await Banners.create(data);

      return {
        success: true,
        code: 200,
        data: {
          banner: addedbanner,
          message: 'Banner saved successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async updatebanner(data, context) {
    try {
      data.updatedBy = context.user?.id;

      const Banners = require('../models/Banners');
      const banner = await Banners.findByIdAndUpdate(data.id, data, { new: true });

      if (!banner) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'Banner not found',
          },
        };
      }

      return {
        success: true,
        code: 200,
        data: {
          data: banner,
          message: 'Banner updated successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async bannerDetail(data, context) {
    try {
      if (!data.id) {
        return {
          success: false,
          error: { code: 404, message: 'Banner ID is required' },
        };
      }

      const Banners = require('../models/Banners');
      const banner_detail = await Banners.findById(data.id);

      if (!banner_detail) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'No banner found',
          },
        };
      }

      return {
        success: true,
        code: 200,
        data: banner_detail,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  async bannerByType(data, context) {
    try {
      if (!data.type) {
        return {
          success: false,
          error: { code: 404, message: 'Banner type is required' },
        };
      }

      const Banners = require('../models/Banners');
      const banner_detail = await Banners.find({
        bannerType: data.type,
        isDeleted: false,
        status: 'active',
      });

      if (banner_detail.length === 0) {
        return {
          success: false,
          error: {
            code: 404,
            message: 'No banner found',
          },
        };
      }

      return {
        success: true,
        code: 200,
        data: banner_detail,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 400,
          message: error.message,
        },
      };
    }
  }

  // Helper methods
  async LatLngCity(lat, lng, callback) {
    try {
      const data = await geocoder.reverse({ lat, lon: lng });
      callback({ success: true, data: data[0]?.city });
    } catch (err) {
      callback({ status: false, message: err.message });
    }
  }

  async getUserStoreLike(userId) {
    try {
      const Favourite = require('../models/Favourite');
      const storeLike = await Favourite.find({
        addedBy: userId,
        $or: [{ type: 'dispensary' }, { type: 'doctor' }, { type: 'brand' }],
      })
        .populate('item_id')
        .sort({ createdAt: -1 });

      return { status: true, data: storeLike };
    } catch (err) {
      return { status: false, error: err.message };
    }
  }

  async getUserProductLike(userId) {
    try {
      const Favourite = require('../models/Favourite');
      const productLike = await Favourite.find({
        addedBy: userId,
        type: 'product',
      })
        .populate('product_id')
        .sort({ createdAt: -1 });

      return { status: true, data: productLike };
    } catch (err) {
      return { status: false, error: err.message };
    }
  }

  async getUserreviews(userId) {
    try {
      const Reviews = require('../models/Reviews');
      const UserReview = await Reviews.find({ addedBy: userId })
        .populate('item_id')
        .sort({ createdAt: -1 });

      return { status: true, data: UserReview };
    } catch (error) {
      return { status: false, error: error.message };
    }
  }

  async getUserproductreviews(userId) {
    try {
      const Productreviews = require('../models/Productreviews');
      const UserReviews = await Productreviews.find({ addedBy: userId })
        .populate('product_id')
        .sort({ createdAt: -1 });

      return { status: true, data: UserReviews };
    } catch (error) {
      return { status: false, error: error.message };
    }
  }

  distance(lat1, lon1, lat2, lon2, cb) {
    const avgdis = geodist(
      { lat: parseFloat(lat2), lon: parseFloat(lon2) },
      { lat: lat1, lon: lon1 }
    );
    return avgdis * 1.60934;
  }

  async addressLatLng(data) {
    try {
      const result = await geocoder.geocode(data);
      return { success: true, data: result };
    } catch (err) {
      return { status: false, message: err.message };
    }
  }

  array_of_obj_sort(arr, key, sort_type) {
    if (sort_type === 'asc') {
      return arr.sort((a, b) => a[key] - b[key]);
    } else {
      return arr.sort((a, b) => b[key] - a[key]);
    }
  }

  getUniqueCode() {
    return Math.floor(Math.random() * 900001258) + 100009852;
  }
}

module.exports = new CommonService();