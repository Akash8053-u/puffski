const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const db = require('../models/index');
const message = require("../utils/constants.js");

exports.addItemProductService = async (dataArray) => {
  if (!dataArray || dataArray.length === 0) {
    return {
      success: true,
      message: message.messages.NO_DATA_FOUND,
    };
  }

  const settings = await Settings.findOne({}); // assuming only one settings row exists

  for (const item of dataArray) {
    const itemData = await db.item.findById(item.dispensary_id);
    if (!itemData) {
      throw new Error(`Dispensary not found for id ${item.dispensary_id}`);
    }

   item.createdBy = itemData.addedBy;

    // Condition for checking duplicates
    let condition = {};
    if (!item.product_id) {
      condition.name = item.name;
    } else {
      condition.product_id = ObjectId(item.product_id);
    }
    condition.dispensary_id = item.dispensary_id;

    if (item.brand_name) {
      condition.brand_name = item.brand_name;
    }

    // Default numeric values
    item.pre_roll = item.pre_roll || 0;
    item.Eighth = item.Eighth || 0;
    item.quarter = item.quarter || 0;
    item.grams = item.grams || 0;
    item.half = item.half || 0;
    item.ounce = item.ounce || 0;
    item.thc = item.thc || 0;
    item.cbd = item.cbd || 0;

    //Add settings
    item.commsion = settings?.commission || 0;
    item.fare_charges = settings?.fare_charges || 0;

    // Slug
    item.slug = item.name.replace(/\s+/g, "-");
    item.inStock = true;
    item.quantity = 5; // static as per original code
    item.isForDelivery = item.isForDelivery;

    // Check if product already exists
    const existingProducts = await db.itemProduct.find(condition);
    if (existingProducts.length > 0) {
      return {
        success: false,
        message: message.messages.ALREADY_EXIST_ANOTHER_BRAND,
        key: item.name,
      };
    }

    // Create product
    await db.itemProduct.create(item);
  }

  return {
    success: true,
    message: message.messages.ITEM_PRODUCT_SUCCESS,
  };
};


exports.editItemProductService = async (id, data, userId="", cacheClient) => {
  // Reset special
  data.isSpecial = "deactive";

  if (data.variants?.length) {
    for (const v of data.variants) {
      if (v.isSpecial === true) {
        data.isSpecial = "active";
        break;
      }
    }
  }

  const itemproduct = await db.itemProduct.findById(id);
  if (!itemproduct) {
    return { success: false, message: message.messages.PRODUCT_NOT_FOUND };
  }

  // Permission check
//   if (String(itemproduct.createdBy) !== String(userId)) {
//     return { success: false, message: message.messages.NO_ACCESS };
//   }

  // Update Item Product
  console.log("Updating Item Product:", id, data);

 await db.itemProduct.findByIdAndUpdate({_id:id}, data, { new: true });

  //Update linked Product
  if (data.product_id) {
    await db.product.findByIdAndUpdate(data.product_id, {
      thc: data.thc,
      cbd: data.cbd,
      detail: data.details,
    });
  }

  // Reload with relations
  const product = await db.itemProduct.findById(id)
    .populate("addedBy")
    .populate("category_id")
    .populate("product_id")
    .populate("producer_id")
    .populate("instaleaf_categoryId");

  // Cache object (kept same structure)
  const value = {
    id: product.id,
    name: product.name,
    quantity: Number(product.quantity),
    price: product.price,
    thc: product.thc || 0,
    cbd: product.cbd || 0,
    isSpecial: product.isSpecial,
    isOnSale: product.isOnSale || false,
    categoryName: product.category_id?.name,
    producerName: product.producer_id?.name,
  };

  /* ---------------- CACHE UPDATE ---------------- */
  const key =
    (product.instaleaf_categoryId?.name || "misc").toLowerCase() +
    "-" +
    product.dispensary_id +
    "-thccbdEmpty";

  const updateCache = async (cacheKey, remove = false) => {
    const cache = await cacheClient.get(cacheKey);
    let payload = cache ? JSON.parse(cache) : { success: true, data: [] };

    payload.data = payload.data.filter(Boolean);
    const index = payload.data.findIndex((x) => String(x.id) === String(value.id));

    if (remove) {
      if (index > -1) payload.data.splice(index, 1);
    } else {
      index > -1 ? (payload.data[index] = value) : payload.data.push(value);
    }

    await cacheClient.set(cacheKey, JSON.stringify(payload));
  };

  if (product.quantity > 2) await updateCache(key);
  else await updateCache(key, true);

  const saleKey = product.dispensary_id + "-onSale";
  product.isOnSale
    ? await updateCache(saleKey)
    : await updateCache(saleKey, true);

  return {
    success: true,
    message: message.messages.ITEM_PRODUCT_UPDATED,
  };
};

exports.getItemProductService = async (data, req) => {
  const query = {};

  if (data.id) query._id = data.id;
  if (data.slug) query.slug = data.slug;
  if (data.sku) query.sku = data.sku;
  if (data.dispensary_id) query.dispensary_id = data.dispensary_id;

  if (!data.id && !data.slug && !data.sku) {
    return { success: false, message: "No data found" };
  }

  const proData = await db.itemProduct.find(query);
  if (!proData.length) {
    return { success: false, message: "No details found" };
  }

  const itemproduct = await db.itemProduct
    .find({ _id: proData[0]._id })
    .populate("producer_id")
    .populate("product_id");

  if (!itemproduct.length) {
    return { success: false, message: "No data found" };
  }

  const product = itemproduct[0];
  const itemIdData = await db.Item.findOne({
    _id: product.dispensary_id,
  });

  const instaleafCategory =
    product.instaleaf_categoryName?.toLowerCase() || "";

  /* ---------------- HELPERS ---------------- */

  const valid = (v) =>
    v !== null && v !== undefined && v !== "" && v !== "0" && v !== 0;

  const compute = (value) => {
    if (!valid(value)) return null;
    return checkChange({
      catName: instaleafCategory,
      type: itemIdData?.isChange,
      value,
      unit:
        product?.metaData?.unit ||
        product?.weightUnit ||
        product?.weight ||
        "N/A",
    });
  };

  /* ---------------- THC / CBD ---------------- */

  if (product.variants?.length) {
    const variant = product.variants[0];

    product.sortTHC =
      compute(variant?.metaData?.thc) ||
      compute(variant?.metaData?.maxTHC) ||
      compute(variant?.metaData?.minTHC) ||
      compute(variant?.thc) ||
      compute(product.thc);

    product.sortCBD =
      compute(variant?.metaData?.cbd) ||
      compute(variant?.metaData?.maxCBD) ||
      compute(variant?.metaData?.minCBD) ||
      compute(variant?.cbd) ||
      compute(product.cbd);

    if (product.sortCBD) product.sortCBD = Number(product.sortCBD) / 10;
  }

  /* ---------------- PRODUCT THC / CBD ---------------- */

  if (product.product_id) {
    product.product_id.thc =
      compute(product.product_id.thc_max) ||
      compute(product.product_id.thc_min) ||
      compute(product.product_id.thc);

    product.product_id.cbd =
      compute(product.product_id.cbd_max) ||
      compute(product.product_id.cbd_min) ||
      compute(product.product_id.cbd);

    if (product.product_id.cbd)
      product.product_id.cbd = Number(product.product_id.cbd) / 10;
  }

  /* ---------------- STOCK ---------------- */

  product.isOutOfStock = product.quantity < 3;

  if (itemIdData?.isOnSaleHide === true) {
    product.isOnSale = false;
  }

  /* ---------------- LIKE / DISLIKE ---------------- */

  const userId = req.query.userid;
  if (userId) {
    const likeData = await db.LikeDislike.findOne({
      sku: product.sku,
      addedBy: userId,
    });

    product.isLiked = likeData?.isLike === true;
    product.isDisLiked = likeData?.isLike === false;
  }

  /* ---------------- POS LOGIC ---------------- */

  const storeData = await db.StoreInfo.findOne({
    dispensary_id: product.dispensary_id,
  });

  if (
    storeData?.pos_name === "Cova" &&
    product.producer_id
  ) {
    product.producer_id.producer_supplierId =
      product.producer_id.name;
    product.producer_id.supplierId =
      product.producer_id.name;
  }

  return {
    success: true,
    data: product,
    varientId: data.varientId || "",
  };
};
