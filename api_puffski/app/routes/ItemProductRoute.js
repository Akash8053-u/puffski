const { addItemProduct, editItemProduct } = require("../controllers/ItemProductController");


const router = require("express").Router();

// Products CRUD
router.post("/add_item_product",addItemProduct);
router.put("/editItemProduct", editItemProduct);
// router.get("/getItemProduct", getItemProduct);
// router.get("/AllProductsByItem", AllProductsByItem);
// router.get("/AllProductByUser", AllProductByUser);
// router.post("/addUserItemProduct", addUserItemProduct);
// router.get("/AllProductItemByCategory", AllProductItemByCategory);
// router.get("/AllProductItemByCategoryByName", AllProductItemByCategoryByName);
// router.get("/getProducerProducts", getProducerProducts);
// router.put("/product/update/producercategory", updateProducerCategory);
// router.get("/itemproduct/detail", itemProductDetail);
// router.get("/item/product/detail", itemProductDetailAdmin);
// router.put("/item/product/update", updateItemProductAdmin);
// router.get("/skuitem/product/detail", skuItemProductDetailAdmin);
// router.put("/skuitem/product/update", skuUpdateItemProductAdmin);

// Special / Misc
// router.put("/isspecial", isspecial);
// router.get("/ItemReviewsWithProduct", ItemReviewsWithProduct);

// // Store / Category
// router.get("/storeproducts/categoryWise", storeProductsCategoryWise);
// router.get("/storeproducts/update/categoryWise", storeProductsUpdatedCategoryWise);

// // Favorite Products
// router.put("/fav/unfav/products", favUnfavStoreProduct);
// router.get("/fav/products", storeFavouriteProducts);

// // Product Slug
// router.get("/itemproduct/:slug", getItemProductSlug);

// // Delete / Merge / Cache
// router.delete("/deleteitemproduct", deleteItemProduct);
// router.put("/meregeCategory", meregeCategory);
// router.get("/storeproducts/onsale", storeProductsOnSale);
// router.delete("/delete/cache", deleteStoreCache);
// router.get("/update/cache", updateStoreCache);

// // SKU / Item Queries
// router.get("/AllProductsByItemSKU", AllProductsByItemSKU);
// router.get("/update/thc/cbd", storeProductsCategoryWiseUpdate);
// router.get("/all/item/product", storeAllProductsCategoryWise);
// router.get("/update/thc/cbd/aglc", updateproductByAGLC);

// // Shop / Ordered / Cart cache
// router.delete("/delete/shop/product/cache", deleteShopProductCache);
// router.delete("/delete/ordered/cache", deleteOrderedCache);
// router.get("/ordered/products/categoryWise", storeOrderedProducts);
// router.get("/cart/liked/products/categoryWise", storeLikedCartProducts);

module.exports = router;
