const CommonService = require('../services/commonService');
const { API } = require('../utils/helper');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const request = require('request-promise');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');

class CommonController {
  constructor() {
    this.uploadImages = this.uploadImages.bind(this);
    this.uploadMultipleImages = this.uploadMultipleImages.bind(this);
    this.uploadNormalImages = this.uploadNormalImages.bind(this);
    this.uploadNormalMultipleImages = this.uploadNormalMultipleImages.bind(this);
    this.decodeBase64Image = this.decodeBase64Image.bind(this);
  }

  async calculateMultipleDistance(req, res) {
    try {
      const { address } = req.body;
      const calculateMiles = [];
      
      if (address && address.length > 0) {
        const apiKey = process.env.GOOGLE_API_KEY;
        
        for (const singleResult of address) {
          const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(singleResult.pickupLocation)}&destinations=${encodeURIComponent(singleResult.dropoffLocation)}&key=${apiKey}`;
          
          const response = await request.get(url);
          const result = JSON.parse(response);
          
          let distanceInMiles = 0;
          if (result.rows && result.rows[0]) {
            const distanceInMeters = result.rows[0]?.elements[0]?.distance?.value || 0;
            distanceInMiles = distanceInMeters / 1609.34;
          }
          
          calculateMiles.push(distanceInMiles ? Math.round(distanceInMiles) : 0);
        }
        
        return res.status(200).json({
          success: true,
          message: "Data fetch successfully",
          data: { distance: calculateMiles },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "No distance found",
        });
      }
    } catch (error) {
      console.error('Error calculating distance:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async googleAddress(req, res) {
    try {
      const query = req.query.query;
      if (!query) {
        return res.status(400).json({
          success: false,
          message: "Query parameter is required",
        });
      }

      const apiKey = process.env.GOOGLE_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&components=country:ca&types=geocode&input=${encodeURIComponent(query)}`;
      
      const response = await request.get(url);
      const data = JSON.parse(response);
      
      const predictions = data.predictions || [];
      predictions.sort((a, b) => a.description.localeCompare(b.description));
      
      return res.status(200).json({
        success: true,
        message: "Data fetch successfully",
        data: predictions,
      });
    } catch (error) {
      console.error('Error in googleAddress:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async googleAddressLatLng(req, res) {
    try {
      const placeId = req.query.id;
      if (!placeId) {
        return res.status(400).json({
          success: false,
          message: "Place ID is required",
        });
      }

      const apiKey = process.env.GOOGLE_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&place_id=${placeId}`;
      
      const response = await request.get(url);
      const data = JSON.parse(response);
      
      let newdata = {};
      if (data.results && data.results.length > 0) {
        newdata = {
          geometry: data.results[0].geometry,
          formatted_address: data.results[0].formatted_address,
        };
      }
      
      return res.status(200).json({
        success: true,
        message: "Data fetch successfully",
        data: newdata,
      });
    } catch (error) {
      console.error('Error in googleAddressLatLng:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getHTMLFromURL(req, res) {
    try {
      const url = req.query.url;
      if (!url) {
        return res.status(400).json({
          success: false,
          message: "URL is required",
        });
      }

      const response = await request.get(url);
      return res.status(200).json({
        success: true,
        message: "Data fetch successfully",
        data: response,
      });
    } catch (error) {
      console.error('Error in getHTMLFromURL:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async updateCityLatlang(req, res) {
    try {
      // This function seems to be for bulk geocoding - implement as needed
      console.log('City lat/lng update endpoint');
      return res.status(200).json({
        success: true,
        message: "Function not fully implemented in conversion",
      });
    } catch (error) {
      console.error('Error in updateCityLatlang:', error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // Delegated methods to CommonService
  async ItemProductReview(req, res) {
    try {
      const result = await CommonService.ItemProductReview(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async saveBanner(req, res) {
    try {
      const result = await CommonService.saveBanner(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async updatebanner(req, res) {
    try {
      const result = await CommonService.updatebanner(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async bannerDetail(req, res) {
    try {
      const result = await CommonService.bannerDetail(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async bannerByType(req, res) {
    try {
      const result = await CommonService.bannerByType(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async ProductReview(req, res) {
    try {
      const result = await CommonService.ProductReview(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async allcities(req, res) {
    try {
      const result = await CommonService.allcities(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async allLowercities(req, res) {
    try {
      const result = await CommonService.allLowercities(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async addcities(req, res) {
    try {
      const result = await CommonService.saveCity(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getcity(req, res) {
    try {
      const result = await CommonService.getcity(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async updatecities(req, res) {
    try {
      const result = await CommonService.updateCity(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async deletecities(req, res) {
    try {
      const result = await CommonService.delete(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async brandList(req, res) {
    try {
      const result = await CommonService.allBrands(req.body, req);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async searchCity(req, res) {
    try {
      const result = await CommonService.searchCity(req.body, req, res);
      return result;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async mobUserLiked(req, res) {
    try {
      const result = await CommonService.mobUserLiked(req.body, req, res);
      return result;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async mobUploadImage(req, res) {
    try {
      await this.handleImageUpload(req, res, 'mobile');
    } catch (error) {
      console.error('Error in mobUploadImage:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  }

  async uploadImages(req, res) {
    try {
      await this.handleImageUpload(req, res, 'web');
    } catch (error) {
      console.error('Error in uploadImages:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  }

  async uploadMultipleImages(req, res) {
    try {
      const { modelName, fileName, data } = req.body;
      
      if (!modelName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Model type is required',
          },
        });
      }

      const fileNames = Array.isArray(fileName) ? fileName : [fileName];
      const imageDatas = Array.isArray(data) ? data : [data];

      if (fileNames.length !== imageDatas.length) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Mismatch between number of filenames and image data',
          },
        });
      }

      const results = [];
      for (let i = 0; i < fileNames.length; i++) {
        const result = await this.processSingleImage(
          fileNames[i],
          imageDatas[i],
          modelName
        );
        results.push(result);
      }

      return res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error in uploadMultipleImages:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  }

  async uploadPinImage(req, res) {
    try {
      const { type, data } = req.body;
      
      if (!type || !data) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Type and data are required',
          },
        });
      }

      const imageBuffer = this.decodeBase64Image(data);
      if (imageBuffer.error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: imageBuffer.error,
          },
        });
      }

      const imageType = imageBuffer.type;
      const typeArr = imageType.split('/');
      const fileExt = typeArr[1].toLowerCase();

      if (!['jpeg', 'jpg', 'png'].includes(fileExt)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Invalid image format. Supported formats: JPEG, PNG',
          },
        });
      }

      const name = `${uuidv4()}-${Date.now()}`;
      const fullPath = `${name}.${fileExt}`;
      const imagePath = `/images/${type}/${fullPath}`;
      const uploadLocation = `assets/images/${type}/${fullPath}`;

      // Create directories if they don't exist
      await fs.ensureDir(`assets/images/${type}`);
      await fs.ensureDir(`assets/images/circle`);

      await fs.writeFile(uploadLocation, imageBuffer.data);

      // Create circular image
      const circlePath = `assets/images/circle/${fullPath}`;
      const roundedCorners = Buffer.from(
        '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50"/></svg>'
      );

      await sharp(imageBuffer.data)
        .resize(100, 100)
        .composite([{ input: roundedCorners, blend: 'dest-in' }])
        .toFile(circlePath);

      return res.json({
        success: true,
        data: {
          fullPath,
          imagePath,
        },
      });
    } catch (error) {
      console.error('Error in uploadPinImage:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  }

  async uploadNormalImages(req, res) {
    try {
      const modelName = req.params.modelName;
      if (!modelName) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Please Add Model Name" },
        });
      }

      // This endpoint expects file upload via multer
      // You'll need to set up multer middleware for file uploads
      console.log('Normal image upload endpoint - implement multer middleware');
      
      return res.status(200).json({
        status: true,
        msg: "Image upload endpoint - implement multer",
      });
    } catch (error) {
      console.error('Error in uploadNormalImages:', error);
      return res.status(500).json({
        success: false,
        error: { code: 500, message: error.message },
      });
    }
  }

  async uploadNormalMultipleImages(req, res) {
    try {
      const modelName = req.params.modelName;
      if (!modelName) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Please Add Model Name" },
        });
      }

      // This endpoint expects file upload via multer
      console.log('Multiple normal image upload endpoint - implement multer middleware');
      
      return res.status(200).json({
        status: true,
        msg: "Multiple images upload endpoint - implement multer",
      });
    } catch (error) {
      console.error('Error in uploadNormalMultipleImages:', error);
      return res.status(500).json({
        success: false,
        error: { code: 500, message: error.message },
      });
    }
  }

  decodeBase64Image(dataString) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const response = {};
    
    if (matches && matches.length === 3) {
      response.type = matches[1];
      response.data = Buffer.from(matches[2], 'base64');
    } else {
      response.error = 'Invalid base64 image data';
    }

    return response;
  }

  async delete(req, res) {
    try {
      const { model, id } = req.params;
      if (!model || !id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Model and ID are required',
          },
        });
      }

      const Model = require(`../models/${model}`);
      const result = await Model.findByIdAndUpdate(id, {
        isDeleted: true,
        deletedBy: req.user?.id,
        deletedAt: new Date(),
      });

      if (!result) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: 'Record not found',
          },
        });
      }

      return res.json({
        success: true,
        data: {
          message: 'Record deleted successfully',
        },
      });
    } catch (error) {
      console.error('Error in delete:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  }

  async changeStatus(req, res) {
    try {
      const { model, id, status } = req.params;
      if (!model || !id || !status) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Model, ID and status are required',
          },
        });
      }

      const Model = require(`../models/${model}`);
      const result = await Model.findByIdAndUpdate(id, { status });

      if (!result) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: 'Record not found',
          },
        });
      }

      return res.json({
        success: true,
        data: {
          message: 'Status changed successfully',
        },
      });
    } catch (error) {
      console.error('Error in changeStatus:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  }

  async FeaturedData(req, res) {
    try {
      const result = await CommonService.FeaturedData(req.body, req, res);
      return result;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async featuredDeliveryStores(req, res) {
    try {
      const result = await CommonService.featuredDeliveryStores(req.body, req, res);
      return result;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async reserveAheadStores(req, res) {
    try {
      const result = await CommonService.reserveAheadStores(req.body, req, res);
      return result;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async mobFeaturedItem(req, res) {
    try {
      const result = await CommonService.mobFeaturedItem(req.body, req, res);
      return result;
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async Search(req, res) {
    try {
      const { city, name } = req.body;
      const ip = req.ip;
      const ipArray = ip.split(':');
      const ipAddress = ipArray[ipArray.length - 1];
      
      const geo = require('geoip-lite').lookup(ipAddress);
      
      let query = { isDeleted: false };
      
      if (city) {
        query.city = new RegExp(city, 'i');
      }
      
      if (name) {
        query.name = new RegExp(name, 'i');
      }

      const Item = require('../models/Item');
      const items = await Item.find(query).populate('addedBy').exec();
      
      const responseStore = [];
      for (const item of items) {
        if (item.addedBy.status === 'active') {
          const latitude = geo.ll[0];
          const longitude = geo.ll[1];
          const distance = require('geodist')(
            { lat: latitude, lon: longitude },
            { lat: item.lat, lon: item.lng }
          );
          item.kilometers = distance * 1.60934;
          responseStore.push(item);
        }
      }

      responseStore.sort((a, b) => a.kilometers - b.kilometers);

      const Product = require('../models/Product');
      const products = await Product.find({
        isDeleted: false,
        name: new RegExp(name, 'i')
      });

      return res.json({
        success: true,
        data: {
          Item: responseStore,
          products: products,
          brands: [],
        },
      });
    } catch (error) {
      console.error('Error in Search:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async subscription(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Email is required',
          },
        });
      }

      const Subscription = require('../models/Subscription');
      const existing = await Subscription.findOne({ email });
      
      if (existing) {
        return res.json({
          success: true,
          code: 200,
          data: {
            message: 'You have already subscribed for Puffski Updates.',
          },
        });
      }

      // Send email notification
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const message = `
        Hello Admin,<br/><br/>
        A user whose email id is <b>${email}</b> wants to connect with you.<br/><br/>
        Regards<br/>
        Puffski Support Team
      `;

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL || 'nishant.pratham@yopmail.com',
        subject: 'Subscription Email',
        html: message,
      });

      await Subscription.create({ email });

      return res.json({
        success: true,
        code: 200,
        data: {
          message: 'You have been subscribed successfully.',
        },
      });
    } catch (error) {
      console.error('Error in subscription:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async onLoadLocation(req, res) {
    try {
      const ip = req.ip;
      const ipArray = ip.split(':');
      const ipAddress = ipArray[ipArray.length - 1];
      const geo = require('geoip-lite').lookup(ipAddress);
      
      const { lat, lng } = req.query;
      
      if (lat && lng) {
        const NodeGeocoder = require('node-geocoder');
        const options = {
          provider: 'google',
          apiKey: process.env.GOOGLE_API_KEY,
        };
        const geocoder = NodeGeocoder(options);
        
        const result = await geocoder.reverse({ lat, lon: lng });
        if (result && result.length > 0) {
          return res.json({
            success: true,
            data: {
              city: result[0].city,
            },
          });
        }
      }
      
      return res.json({
        success: true,
        data: {
          city: geo?.city || '',
        },
      });
    } catch (error) {
      console.error('Error in onLoadLocation:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAllCities(req, res) {
    try {
      const { search, sortBy = 'createdAt desc', page = 1, count = 10 } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);
      
      const query = { isDeleted: false };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { province: { $regex: search, $options: 'i' } },
        ];
      }
      
      const City = require('../models/City');
      const total = await City.countDocuments(query);
      const cities = await City.find(query)
        .sort(sortBy)
        .skip(skipNo)
        .limit(parseInt(count))
        .exec();
      
      return res.json({
        success: true,
        data: {
          city: cities,
          total: total,
        },
      });
    } catch (error) {
      console.error('Error in getAllCities:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async allprovince(req, res) {
    try {
      const Province = require('../models/Province');
      const provinces = await Province.find({ 
        isDeleted: false, 
        status: 'active' 
      }).sort({ name: 1 });
      
      if (provinces.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'No provinces found',
          },
        });
      }
      
      return res.json({
        success: true,
        data: {
          city: provinces,
        },
      });
    } catch (error) {
      console.error('Error in allprovince:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getReward(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        });
      }

      const Productreviews = require('../models/Productreviews');
      const Reviews = require('../models/Reviews');
      const Settings = require('../models/Settings');
      const Users = require('../models/Users');
      
      const allreviewsproduct = await Productreviews.find({ addedBy: userId })
        .populate('product_id')
        .sort({ createdAt: -1 });
      
      const allreviewsproductCount = await Productreviews.countDocuments({
        addedBy: userId,
        isDeleted: false,
      });
      
      const allreviewdispensary = await Reviews.find({
        addedBy: userId,
        type: 'dispensary',
      })
        .populate('item_id')
        .sort({ createdAt: -1 });
      
      const allreviewdispensaryCount = await Reviews.countDocuments({
        addedBy: userId,
        type: 'dispensary',
        isDeleted: false,
      });
      
      const setting = await Settings.findOne({});
      const userData = await Users.findById(userId);
      
      // Calculate total redeemed
      const Rewardorders = require('../models/Rewardorders');
      const totalredeem = await Rewardorders.aggregate([
        {
          $match: {
            addedBy: new ObjectId(userId),
            $or: [{ status: 'pending' }, { status: 'approve' }],
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toInt: '$point' } },
          },
        },
      ]);
      
      return res.json({
        success: true,
        data: {
          strainPoints: allreviewsproductCount * (setting?.reward?.product || 0),
          dispensaryPoints: allreviewdispensaryCount * (setting?.reward?.dispensary || 0),
          totalEarn: userData?.rewardPoint || '0',
          totalRewarded: totalredeem[0]?.total || 0,
          totalReviewProduct: allreviewsproduct,
          totalReviewDispensary: allreviewdispensary,
        },
      });
    } catch (error) {
      console.error('Error in getReward:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async revokedReview(req, res) {
    try {
      const { type, id, ...updateData } = req.body;
      
      if (!type || !id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Type and ID are required',
          },
        });
      }
      
      const modelName = type === 'product' ? 'Productreviews' : 'Reviews';
      const Model = require(`../models/${modelName}`);
      
      const updated = await Model.findByIdAndUpdate(id, updateData, { new: true });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: 'Review not found',
          },
        });
      }
      
      // Subtract reward points
      if (updated.reward_point) {
        const Users = require('../models/Users');
        await Users.findByIdAndUpdate(updated.addedBy, {
          $inc: { rewardPoint: -parseInt(updated.reward_point) },
        });
      }
      
      return res.json({
        success: true,
        data: {
          data: updated,
          message: 'Review has been revoked successfully.',
        },
      });
    } catch (error) {
      console.error('Error in revokedReview:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async analyticReport(req, res) {
    try {
      const { type, item_id, product_id, year, month } = req.query;
      const reqWithIdentity = { ...req, identity: { id: req.user?.id } };
      
      let condition = {};
      if (type === 'yearly') {
        condition = {
          date_year: { $year: '$createdAt' },
          detail: '$product',
          product_id: '$product_id',
        };
      } else if (type === 'monthly') {
        condition = {
          date_year: { $year: '$createdAt' },
          date_month: { $month: '$createdAt' },
          detail: '$product',
          product_id: '$product_id',
        };
      } else if (type === 'weekly') {
        condition = {
          date_year: { $year: '$createdAt' },
          date_month: { $month: '$createdAt' },
          day: { $dayOfWeek: '$createdAt' },
          detail: '$product',
          product_id: '$product_id',
        };
      } else {
        condition = {
          date_year: { $year: '$createdAt' },
          date_month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          detail: '$product',
          product_id: '$product_id',
        };
      }
      
      // Implement your analytic functions here
      // totalFavourite, totalWebVisit, totalProductViewed, totalReview, totalItemProductReviews
      
      return res.json({
        data: {
          fav: { totalresults: [] },
          web: { totalresults: [] },
          pro: { totalresults: [] },
          rev: { totalresults: [] },
          productrev: { totalresults: [] },
        },
      });
    } catch (error) {
      console.error('Error in analyticReport:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async adminAllTxn(req, res) {
    try {
      const { page = 1, count = 10, sortBy, search } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);
      
      const sortquery = {};
      if (sortBy) {
        const [field, sortType] = sortBy.split(' ');
        sortquery[field] = sortType === 'desc' ? -1 : 1;
      } else {
        sortquery.createdAt = -1;
      }
      
      const query = { isDeleted: false };
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      
      const Transcation = require('../models/Transcation');
      
      const totalresults = await Transcation.aggregate([
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
            exp_date: '$exp_date',
            transaction_id: '$transaction_id',
            payment_status: '$payment_status',
            price: '$original_price',
            plan_type: '$plan_type',
            val_day: '$val_day',
            addedBy: '$addedBy.username1',
            addedByID: '$addedBy._id',
            type: '$type',
            detail: '$detail',
            isDeleted: '$isDeleted',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
          },
        },
        { $match: query },
      ]);
      
      const results = await Transcation.aggregate([
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
            exp_date: '$exp_date',
            transaction_id: '$transaction_id',
            payment_status: '$payment_status',
            price: '$original_price',
            plan_type: '$plan_type',
            val_day: '$val_day',
            addedBy: '$addedBy.username1',
            addedByID: '$addedBy._id',
            type: '$type',
            detail: '$detail',
            isDeleted: '$isDeleted',
            createdAt: '$createdAt',
            updatedAt: '$updatedAt',
          },
        },
        { $match: query },
        { $sort: sortquery },
        { $skip: skipNo },
        { $limit: parseInt(count) },
      ]);
      
      return res.json({
        success: true,
        data: {
          data: results,
          total: totalresults.length,
        },
      });
    } catch (error) {
      console.error('Error in adminAllTxn:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async visitWebsite(req, res) {
    try {
      const ip = req.ip;
      const itemId = req.params.id;
      
      const Websiteitemviewed = require('../models/Websiteitemviewed');
      const existing = await Websiteitemviewed.findOne({
        ipAddress: ip,
        itemId: itemId,
      });
      
      if (!existing) {
        await Websiteitemviewed.create({
          ipAddress: ip,
          itemId: itemId,
        });
      }
      
      return res.json({
        success: true,
        code: 200,
      });
    } catch (error) {
      console.error('Error in visitWebsite:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async dispensaryProducts(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        });
      }
      
      const Product = require('../models/Product');
      const products = await Product.find({ addedBy: userId });
      
      return res.json({
        success: true,
        data: {
          products: products,
        },
      });
    } catch (error) {
      console.error('Error in dispensaryProducts:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getAllBanners(req, res) {
    try {
      const { search, sortBy = 'createdAt desc', page = 1, count = 10 } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);
      
      const query = { isDeleted: false };
      
      if (search) {
        query.name = { $regex: search, $options: 'i' };
      }
      
      const Banners = require('../models/Banners');
      const total = await Banners.countDocuments(query);
      const banners = await Banners.find(query)
        .sort(sortBy)
        .skip(skipNo)
        .limit(parseInt(count));
      
      return res.json({
        success: true,
        data: {
          data: banners,
          total: total,
        },
      });
    } catch (error) {
      console.error('Error in getAllBanners:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getproductslugupdate(req, res) {
    try {
      // This function checks for duplicate slugs
      const Product = require('../models/Product');
      const products = await Product.find({
        isDeleted: false,
        status: 'active',
        dataType: { $ne: 'import' },
      });
      
      // Check for duplicate slugs
      const slugMap = new Map();
      for (const product of products) {
        if (slugMap.has(product.slug)) {
          slugMap.get(product.slug).push(product.name);
        } else {
          slugMap.set(product.slug, [product.name]);
        }
      }
      
      const duplicates = [];
      for (const [slug, names] of slugMap.entries()) {
        if (names.length > 1) {
          duplicates.push({ slug, products: names });
        }
      }
      
      return res.json({
        success: true,
        data: {
          duplicates: duplicates,
        },
      });
    } catch (error) {
      console.error('Error in getproductslugupdate:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async subscriptionTransactions(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 401,
            message: 'Unauthorized',
          },
        });
      }
      
      const { page = 1, count = 10, sortBy = 'createdAt desc', search } = req.query;
      const skipNo = (parseInt(page) - 1) * parseInt(count);
      
      const query = {
        isDeleted: false,
        subscription_id: { $exists: true },
        addedBy: userId,
      };
      
      if (search) {
        query.subscription_id = { $regex: search, $options: 'i' };
      }
      
      const Transcation = require('../models/Transcation');
      const transactions = await Transcation.find(query)
        .populate('addedBy')
        .sort(sortBy)
        .skip(skipNo)
        .limit(parseInt(count));
      
      return res.status(200).json({
        success: true,
        code: 200,
        transcation: transactions,
      });
    } catch (error) {
      console.error('Error in subscriptionTransactions:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async uploadProductFromExcel(req, res) {
    try {
      // This is a complex function - you'll need to implement file upload handling
      // and Excel parsing similar to your Sails code
      console.log('Product upload from Excel endpoint - implement file upload');
      
      return res.json({
        success: true,
        message: 'File upload endpoint - implement multer for file handling',
      });
    } catch (error) {
      console.error('Error in uploadProductFromExcel:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async findAllCounrty(req, res) {
    try {
      const countries = require('country-state-city').Country.getAllCountries();
      const formattedCountries = countries.map(country => ({
        shortName: country.isoCode,
        name: country.name,
      }));
      
      return res.status(200).json({
        success: true,
        code: 200,
        data: formattedCountries,
      });
    } catch (error) {
      console.error('Error in findAllCounrty:', error);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message },
      });
    }
  }

  async findAllState(req, res) {
    try {
      const { shortName } = req.params;
      if (!shortName) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: 'short Name is required' },
        });
      }
      
      const states = require('country-state-city').State.getStatesOfCountry(shortName);
      const formattedStates = states.map(state => ({
        name: state.name,
        shortName: state.isoCode,
      }));
      
      return res.status(200).json({
        success: true,
        code: 200,
        data: formattedStates,
      });
    } catch (error) {
      console.error('Error in findAllState:', error);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message },
      });
    }
  }

  async findAllCities(req, res) {
    try {
      const { countryCode, state } = req.params;
      if (!countryCode || !state) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: 'Country Code and State Name are required' },
        });
      }
      
      const cities = require('country-state-city').City.getCitiesOfState(countryCode, state);
      const formattedCities = cities.map(city => ({
        name: city.name,
      }));
      
      return res.status(200).json({
        success: true,
        code: 200,
        data: formattedCities,
      });
    } catch (error) {
      console.error('Error in findAllCities:', error);
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error.message },
      });
    }
  }

  // Store-specific methods (silverSpring, copper, etc.)
  async silverSpring(req, res) {
    try {
      const options = {
        method: 'GET',
        url: 'https://integration.getgreenline.co/api/v1/external/company/1202/location/1203/posListings',
        headers: { 
          'x-api-key': process.env.GREENLINE_API_KEY || '67466638-91c5-4f26-b1b1-18e380631a00', 
          useQueryString: true 
        },
      };
      
      const response = await request(options);
      const data = JSON.parse(response);
      
      return res.status(200).json({
        success: true,
        code: 200,
        data: data.products || [],
      });
    } catch (error) {
      console.error('Error in silverSpring:', error);
      return res.status(400).json({
        success: false,
        code: 400,
        message: error.message,
      });
    }
  }

  async copper(req, res) {
    try {
      const options = {
        method: 'GET',
        url: 'https://integration.getgreenline.co/api/v1/external/company/1202/location/1292/posListings',
        headers: { 
          'x-api-key': process.env.GREENLINE_API_KEY || '67466638-91c5-4f26-b1b1-18e380631a00', 
          useQueryString: true 
        },
      };
      
      const response = await request(options);
      const data = JSON.parse(response);
      
      return res.status(200).json({
        success: true,
        code: 200,
        data: data.products || [],
      });
    } catch (error) {
      console.error('Error in copper:', error);
      return res.status(400).json({
        success: false,
        code: 400,
        message: error.message,
      });
    }
  }

  // Similar methods for ogden, bow, recordHigh, highlandbuds, vibes

  async uploadAGLCProductFromExcel(req, res) {
    try {
      // Implement AGLC product upload similar to uploadProductFromExcel
      console.log('AGLC product upload from Excel endpoint');
      
      return res.json({
        success: true,
        message: 'AGLC file upload endpoint',
      });
    } catch (error) {
      console.error('Error in uploadAGLCProductFromExcel:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async uploadAGLCShopProductFromExcel(req, res) {
    try {
      // Implement AGLC shop product upload
      console.log('AGLC shop product upload from Excel endpoint');
      
      return res.json({
        success: true,
        message: 'AGLC shop file upload endpoint',
      });
    } catch (error) {
      console.error('Error in uploadAGLCShopProductFromExcel:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async uploadChinookProductFromExcel(req, res) {
    try {
      // Implement Chinook product upload
      console.log('Chinook product upload from Excel endpoint');
      
      return res.json({
        success: true,
        message: 'Chinook file upload endpoint',
      });
    } catch (error) {
      console.error('Error in uploadChinookProductFromExcel:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async uploadCityProductFromExcel(req, res) {
    try {
      // Implement city product upload
      console.log('City product upload from Excel endpoint');
      
      return res.json({
        success: true,
        message: 'City file upload endpoint',
      });
    } catch (error) {
      console.error('Error in uploadCityProductFromExcel:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getcityData(req, res) {
    try {
      const { city } = req.query;
      const query = {};
      
      if (city) {
        query.city = city;
      }
      
      const NeighbourhoodCity = require('../models/NeighbourhoodCity');
      const citydata = await NeighbourhoodCity.find(query);
      
      return res.json({
        success: true,
        message: 'City fetch successfully.',
        total: citydata.length,
        data: citydata,
      });
    } catch (error) {
      console.error('Error in getcityData:', error);
      return res.status(400).json({
        success: false,
        code: 400,
        message: error.message,
      });
    }
  }

  // Helper methods for image handling
  async handleImageUpload(req, res, source = 'web') {
    const { type, fileName, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Type and data are required',
        },
      });
    }
    
    const imageBuffer = this.decodeBase64Image(data);
    if (imageBuffer.error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: imageBuffer.error,
        },
      });
    }
    
    const imageType = imageBuffer.type;
    const typeArr = imageType.split('/');
    const fileExt = typeArr[1].toLowerCase();
    
    if (!['jpeg', 'jpg', 'png', 'webp'].includes(fileExt)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Invalid image format. Supported formats: JPEG, PNG, WebP',
        },
      });
    }
    
    const size = Buffer.byteLength(data, 'base64');
    if (size > 10737418) { // ~10MB
      return res.status(400).json({
        success: false,
        error: {
          code: 400,
          message: 'Image size exceeds 10MB',
        },
      });
    }
    
    let name;
    if (fileName && source === 'web') {
      const myArr = fileName.split('.');
      if (myArr.length < 2) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: 'Invalid image name',
          },
        });
      }
      name = `${myArr[0]}-${Date.now()}`;
    } else {
      name = `${uuidv4()}-${Date.now()}`;
    }
    
    const fullPath = `${name}.${fileExt}`;
    const imagePath = `/images/${type}/${fullPath}`;
    const uploadLocation = `assets/images/${type}/${fullPath}`;
    
    // Create directories
    await fs.ensureDir(`assets/images/${type}`);
    await fs.ensureDir(`assets/images/${type}/thumbnail/200`);
    await fs.ensureDir(`assets/images/${type}/thumbnail/300`);
    await fs.ensureDir(`assets/images/${type}/thumbnail/500`);
    
    await fs.writeFile(uploadLocation, imageBuffer.data);
    
    // Create thumbnails
    const imageData = await fs.readFile(uploadLocation);
    
    await sharp(imageData)
      .resize({ height: 200, width: 200 })
      .toFile(`assets/images/${type}/thumbnail/200/${fullPath}`);
    
    await sharp(imageData)
      .resize({ height: 300, width: 300 })
      .toFile(`assets/images/${type}/thumbnail/300/${fullPath}`);
    
    await sharp(imageData)
      .resize({ height: 500, width: 500 })
      .toFile(`assets/images/${type}/thumbnail/500/${fullPath}`);
    
    return res.json({
      success: true,
      data: {
        fullPath,
        imagePath,
      },
    });
  }

  async processSingleImage(fileName, imageData, modelName) {
    try {
      const myArr = fileName.split('.');
      if (myArr.length < 2) {
        throw new Error('Invalid image name');
      }
      
      const name = `${myArr[0]}-${Date.now()}-${uuidv4()}`;
      const imageBuffer = this.decodeBase64Image(imageData);
      
      if (imageBuffer.error) {
        throw new Error(imageBuffer.error);
      }
      
      const imageType = imageBuffer.type;
      const typeArr = imageType.split('/');
      const fileExt = typeArr[1].toLowerCase();
      
      const size = Buffer.byteLength(imageData, 'base64');
      if (size > 10737418) {
        throw new Error('Image size exceeds 10MB');
      }
      
      if (!['jpeg', 'jpg', 'png'].includes(fileExt)) {
        throw new Error('Invalid image format. Supported formats: JPEG, PNG');
      }
      
      const fullPath = `${name}.${fileExt}`;
      const imagePath = `/images/${modelName}/${fullPath}`;
      const uploadLocation = `assets/images/${modelName}/${fullPath}`;
      
      // Create directories
      await fs.ensureDir(`assets/images/${modelName}`);
      await fs.ensureDir(`assets/images/${modelName}/thumbnail/200`);
      await fs.ensureDir(`assets/images/${modelName}/thumbnail/300`);
      await fs.ensureDir(`assets/images/${modelName}/thumbnail/500`);
      
      await fs.writeFile(uploadLocation, imageBuffer.data);
      
      // Read the file for thumbnail generation
      const data = await fs.readFile(uploadLocation);
      
      // Generate thumbnails
      await sharp(data)
        .resize({ height: 200, width: 200 })
        .toFile(`assets/images/${modelName}/thumbnail/200/${fullPath}`);
      
      await sharp(data)
        .resize({ height: 300, width: 300 })
        .toFile(`assets/images/${modelName}/thumbnail/300/${fullPath}`);
      
      await sharp(data)
        .resize({ height: 500, width: 500 })
        .toFile(`assets/images/${modelName}/thumbnail/500/${fullPath}`);
      
      return { fullPath, imagePath };
    } catch (error) {
      console.error(`Error processing image ${fileName}:`, error);
      return {
        fullPath: null,
        imagePath: null,
        error: error.message,
      };
    }
  }

  adjustValue(val) {
    return Number(val) > 100 ? Number(val) / 10 : Number(val);
  }

  extractNumberAndText(inputString) {
    const numberMatch = inputString.match(/\d+/);
    const textMatch = inputString.match(/[a-zA-Z]+/);

    if (numberMatch && textMatch) {
      const number = numberMatch[0];
      const text = textMatch[0];
      return { number, text };
    } else {
      return null;
    }
  }

  mergePaths(absPath, relativePath) {
    let absComponents = absPath.split('/').filter(comp => comp !== '');
    let relativeComponents = relativePath.split('/').filter(comp => comp !== '');

    let upLevels = 0;
    for (let i = 0; i < relativeComponents.length; i++) {
      if (relativeComponents[i] === '..') {
        upLevels++;
      } else {
        break;
      }
    }

    let remainingRelative = relativeComponents.slice(upLevels);
    let adjustedAbsComponents = absComponents.slice(0, -upLevels);
    let mergedComponents = adjustedAbsComponents.concat(remainingRelative);
    let mergedPath = '/' + mergedComponents.join('/');

    return mergedPath.replace(/\/+/g, '/');
  }
}

module.exports = new CommonController();