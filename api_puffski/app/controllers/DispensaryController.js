const DispensaryService = require('../services/DispensaryService');

module.exports = {
  updateItemLocation: async function (req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Function not implemented'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  dispensaryNearMe: async function (req, res) {
    try {
      const result = await DispensaryService.dispensaryNearMe(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  add: async function (req, res) {
    try {
      const result = await DispensaryService.addDispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  edit: async function (req, res) {
    try {
      const result = await DispensaryService.editDispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  addSlugDispensary: async function (req, res) {
    try {
      const result = await DispensaryService.addSlugDispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  delete: async function (req, res) {
    try {
      const result = await DispensaryService.deleteDispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  list: async function (req, res) {
    try {
      const result = await DispensaryService.list(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  dispensary: async function (req, res) {
    try {
      const result = await DispensaryService.dispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getDispensary: async function (req, res) {
    try {
      const result = await DispensaryService.getDispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getuserdispensary: async function (req, res) {
    try {
      const result = await DispensaryService.getUserDispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  storeId: async function (req, res) {
    try {
      const result = await DispensaryService.storeId(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  mastersubdispensary: async function (req, res) {
    try {
      const result = await DispensaryService.mastersubdispensary(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemDetail: async function (req, res) {
    try {
      const result = await DispensaryService.itemDetail(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemStoreDetail: async function (req, res) {
    try {
      const result = await DispensaryService.itemStoreDetail(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemDetailUsingID: async function (req, res) {
    try {
      const result = await DispensaryService.itemDetailUsingID(req.params.id);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemFavorite: async function (req, res) {
    try {
      const result = await DispensaryService.itemFavorite(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemLocator: async function (req, res) {
    try {
      const result = await DispensaryService.itemLocator(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemSearchByLocation: async function (req, res) {
    try {
      const result = await DispensaryService.itemSearchByLocation(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  mobItemSearchByLocation: async function (req, res) {
    try {
      const result = await DispensaryService.mobItemSearchByLocation(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  graphData: async function (req, res) {
    try {
      const result = await DispensaryService.graphData(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  dispensaryForSlider: async function (req, res) {
    try {
      const result = await DispensaryService.dispensaryForSlider(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getfiteritem: async function (req, res) {
    try {
      const result = await DispensaryService.getFilterItem(req.query.slug);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  getfilterproduct: async function (req, res) {
    try {
      const result = await DispensaryService.getFilterProduct(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  updateItem: async function (req, res) {
    try {
      const result = await DispensaryService.updateItem(req.params.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getDeliveryFee: async function (req, res) {
    try {
      const result = await DispensaryService.getDeliveryFee(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  searchProduct: async function (req, res) {
    try {
      const result = await DispensaryService.searchProduct(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  getAllItems: async function (req, res) {
    try {
      const result = await DispensaryService.getAllItems(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  mobDispensaryList: async function (req, res) {
    try {
      const result = await DispensaryService.mobDispensaryList(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  alldespensary: async function (req, res) {
    try {
      const result = await DispensaryService.allDispensary();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  allmasterdispensary: async function (req, res) {
    try {
      const result = await DispensaryService.allMasterDispensary(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  subdispensary: async function (req, res) {
    try {
      const result = await DispensaryService.subDispensary(req.user.id, req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  subDispensaryMaster: async function (req, res) {
    try {
      const result = await DispensaryService.subDispensaryMaster(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  bulkUpload: async function (req, res) {
    try {
      const result = await DispensaryService.bulkUpload(req.body, req.user);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  updateSubmaster: async function (req, res) {
    try {
      const result = await DispensaryService.updateSubmaster(req.body, req.user.id);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: error }
      });
    }
  },

  getDispensaryProducerList: async function (req, res) {
    try {
      const result = await DispensaryService.getDispensaryProducerList(req.query.slug);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: constantObj.messages.DISPENSARY_ERROR }
      });
    }
  },

  getDispensaryCategoryList: async function (req, res) {
    try {
      const result = await DispensaryService.getDispensaryCategoryList(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  getDispensaryMainCategoryList: async function (req, res) {
    try {
      const result = await DispensaryService.getDispensaryMainCategoryList(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  storePageCatListForProduct: async function (req, res) {
    try {
      const result = await DispensaryService.storePageCatListForProduct(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  storePageCatListForProductdesktop: async function (req, res) {
    try {
      const result = await DispensaryService.storePageCatListForProductdesktop(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  productTypeList: async function (req, res) {
    try {
      const result = await DispensaryService.productTypeList(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getDispensaryPosCategoryList: async function (req, res) {
    try {
      const result = await DispensaryService.getDispensaryPosCategoryList(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getDispensaryPosCategoryListByName: async function (req, res) {
    try {
      const result = await DispensaryService.getDispensaryPosCategoryListByName(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getPOSnCustomCategoryList: async function (req, res) {
    try {
      const result = await DispensaryService.getPOSnCustomCategoryList();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error
      });
    }
  },

  getFeaturedProducers: async function (req, res) {
    try {
      const result = await DispensaryService.getFeaturedProducers(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  subdomaindispensary: async function (req, res) {
    try {
      const result = await DispensaryService.subdomainDispensary(req.params.slug, req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  getProducersStore: async function (req, res) {
    try {
      const result = await DispensaryService.getProducersStore(req.params.slug, req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  },

  itemPlanList: async function (req, res) {
    try {
      const result = await DispensaryService.itemPlanList(req.query);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: '' + error }
      });
    }
  }
};