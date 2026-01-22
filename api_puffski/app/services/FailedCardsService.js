/**
 * FailedCardsService
 *
 * @description :: Server-side service for handling failed cards operations
 */

const { ObjectId } = require('mongodb');

module.exports = {
  
    /**
     * Get listing of failed cards with pagination and filters
     */
    listing: async function(params) {
        try {
            const { page, count, sortBy, search, dispensaryId } = params;
            
            let query = { isDeleted: false };
            let sortquery = {};
            
            // Parse sortBy parameter
            if (sortBy) {
                const typeArr = sortBy.split(" ");
                const sortType = typeArr[1];
                const field = typeArr[0];
                
                sortquery[field ? field : 'createdAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
            } else {
                sortquery.createdAt = -1;
            }
            
            // Add dispensary filter if provided
            if (dispensaryId) {
                query.dispensary_id = new ObjectId(dispensaryId);
            }
            
            // Add search filter if provided
            if (search) {
                query.$or = [
                    { username1: { $regex: search, $options: 'i' } },
                    { userEmail: { $regex: search, $options: 'i' } },
                    { storeName: { $regex: search, $options: 'i' } }, 
                    { fullName: { $regex: search, $options: 'i' } },
                    { storeName: { $regex: search, $options: 'i' } }, // Duplicate as in original                
                ];
            }

            // Build aggregation pipeline
            const pipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: "userDetail"
                    }
                },
                {
                    $unwind: {
                        path: '$userDetail',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'item', // Note: Using 'item' as in original
                        localField: 'dispensary_id',
                        foreignField: '_id',
                        as: "dispensaryDetail"
                    }
                },
                {
                    $unwind: {
                        path: '$dispensaryDetail',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        id: "$_id",              
                        userDetail: "$userDetail",
                        error: "$error",
                        client_id: "$client_id",
                        client_secret: "$client_secret",
                        cardBrand: "$cardBrand",
                        cardFunding: "$cardFunding",
                        cardType: "$cardType",
                        amount: "$amount",
                        code: "$code",
                        isoCode: "$isoCode",
                        card_lookup_id: "$card_lookup_id",
                        dispensary_id: "$dispensary_id",
                        dispensaryId: "$dispensaryDetail._id", // Using _id instead of id
                        storeName: "$dispensaryDetail.name",
                        username1: "$userDetail.username1",
                        fullName: "$userDetail.fullName",
                        userEmail: "$userDetail.userEmail",
                        createdAt: "$createdAt",
                        isDeleted: "$isDeleted"
                    }
                },
                {
                    $match: query
                }
            ];

            // Get total count
            const totalPipeline = [...pipeline, { $count: "total" }];
            const totalResult = await FailedCards.native().aggregate(totalPipeline).toArray();
            const total = totalResult && totalResult.length > 0 ? totalResult[0].total : 0;

            // Apply pagination if provided
            if (page && count) {
                const skipNo = (Number(page) - 1) * Number(count);
                
                pipeline.push({
                    $sort: sortquery
                });
                pipeline.push({
                    $skip: skipNo
                });
                pipeline.push({
                    $limit: Number(count)
                });
            } else {
                // Always sort even without pagination
                pipeline.push({
                    $sort: sortquery
                });
            }

            // Execute the main query
            const results = await FailedCards.native().aggregate(pipeline).toArray();

            return {
                success: true,
                data: results,
                total: total,
                page: page ? Number(page) : 1,
                count: count ? Number(count) : results.length
            };

        } catch (err) {
            console.error('Error in FailedCardsService.listing:', err);
            throw err;
        }
    },

    /**
     * Get detail of a specific failed card
     */
    detail: async function(id) {
        try {
            if (!id || !ObjectId.isValid(id)) {
                throw new Error("Invalid ID format");
            }

            const detail = await FailedCards.native().aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: "userDetail"
                    }
                },
                {
                    $unwind: {
                        path: '$userDetail',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'item',
                        localField: 'dispensary_id',
                        foreignField: '_id',
                        as: "dispensaryDetail"
                    }
                },
                {
                    $unwind: {
                        path: '$dispensaryDetail',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        id: "$_id",
                        userDetail: "$userDetail",
                        error: "$error",
                        client_id: "$client_id",
                        client_secret: "$client_secret",
                        cardBrand: "$cardBrand",
                        cardFunding: "$cardFunding",
                        cardType: "$cardType",
                        amount: "$amount",
                        code: "$code",
                        isoCode: "$isoCode",
                        card_lookup_id: "$card_lookup_id",
                        dispensary_id: "$dispensary_id",
                        dispensaryId: "$dispensaryDetail._id",
                        storeName: "$dispensaryDetail.name",
                        username1: "$userDetail.username1",
                        fullName: "$userDetail.fullName",
                        userEmail: "$userDetail.userEmail",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        isDeleted: "$isDeleted"
                    }
                }
            ]).toArray();

            if (!detail || detail.length === 0) {
                throw new Error("Failed card record not found");
            }

            return {
                success: true,
                data: detail[0]
            };
            
        } catch (err) {
            console.error('Error in FailedCardsService.detail:', err);
            throw err;
        }
    },

    /**
     * Create a new failed card record
     */
    create: async function(failedCardData) {
        try {
            // Validate required fields
            if (!failedCardData.error || !failedCardData.userId) {
                throw new Error("Error and userId are required fields");
            }
            
            // Validate ObjectId format
            if (!ObjectId.isValid(failedCardData.userId)) {
                throw new Error("Invalid userId format");
            }
            
            if (failedCardData.dispensary_id && !ObjectId.isValid(failedCardData.dispensary_id)) {
                throw new Error("Invalid dispensary_id format");
            }
            
            const newFailedCard = {
                ...failedCardData,
                userId: new ObjectId(failedCardData.userId),
                dispensary_id: failedCardData.dispensary_id ? new ObjectId(failedCardData.dispensary_id) : null,
                createdAt: new Date(),
                updatedAt: new Date(),
                isDeleted: false
            };
            
            const result = await FailedCards.native().insertOne(newFailedCard);
            
            return {
                success: true,
                data: { ...newFailedCard, _id: result.insertedId },
                message: "Failed card record created successfully"
            };
            
        } catch (err) {
            console.error('Error in FailedCardsService.create:', err);
            throw err;
        }
    },

    /**
     * Update an existing failed card record
     */
    update: async function(id, updateData) {
        try {
            if (!id || !ObjectId.isValid(id)) {
                throw new Error("Invalid ID format");
            }
            
            // Convert ObjectId fields if present
            if (updateData.userId) {
                if (!ObjectId.isValid(updateData.userId)) {
                    throw new Error("Invalid userId format");
                }
                updateData.userId = new ObjectId(updateData.userId);
            }
            
            if (updateData.dispensary_id) {
                if (!ObjectId.isValid(updateData.dispensary_id)) {
                    throw new Error("Invalid dispensary_id format");
                }
                updateData.dispensary_id = new ObjectId(updateData.dispensary_id);
            }
            
            updateData.updatedAt = new Date();
            
            const result = await FailedCards.native().findOneAndUpdate(
                { _id: new ObjectId(id), isDeleted: false },
                { $set: updateData },
                { returnDocument: 'after' }
            );
            
            if (!result.value) {
                throw new Error("Failed card record not found");
            }
            
            return {
                success: true,
                data: result.value,
                message: "Failed card record updated successfully"
            };
            
        } catch (err) {
            console.error('Error in FailedCardsService.update:', err);
            throw err;
        }
    },

    /**
     * Soft delete a failed card record
     */
    softDelete: async function(id) {
        try {
            if (!id || !ObjectId.isValid(id)) {
                throw new Error("Invalid ID format");
            }
            
            const result = await FailedCards.native().findOneAndUpdate(
                { _id: new ObjectId(id), isDeleted: false },
                { 
                    $set: { 
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );
            
            if (!result.value) {
                throw new Error("Failed card record not found or already deleted");
            }
            
            return {
                success: true,
                data: result.value,
                message: "Failed card record soft deleted successfully"
            };
            
        } catch (err) {
            console.error('Error in FailedCardsService.softDelete:', err);
            throw err;
        }
    },

    /**
     * Fix for the original detail method bug (for backward compatibility)
     * This mimics the original broken behavior but fixes it
     */
    detailOriginal: async function(reqParams) {
        try {
            const id = reqParams.id;
            
            if (!id) {
                throw new Error("ID is required");
            }
            
            // Original bug: req.param("id").populate('userId')
            // We'll just fetch the document without the broken populate
            const detail = await FailedCards.native().findOne({ _id: new ObjectId(id) });
            
            if (!detail) {
                throw new Error("Failed card record not found");
            }
            
            return {
                success: true,
                data: detail
            };
            
        } catch (err) {
            console.error('Error in FailedCardsService.detailOriginal:', err);
            throw err;
        }
    },

    /**
     * Custom find method for specific queries
     */
    find: async function(query = {}, options = {}) {
        try {
            const { 
                page = 1, 
                count = 10, 
                sortBy = 'createdAt desc',
                populate = [] 
            } = options;
            
            // Parse sortBy
            const [field, direction] = sortBy.split(' ');
            const sortOrder = direction === 'desc' ? -1 : 1;
            
            let pipeline = [{ $match: { ...query, isDeleted: false } }];
            
            // Add lookups for population
            if (populate.includes('user')) {
                pipeline.push({
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: "user"
                    }
                });
                pipeline.push({
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                });
            }
            
            if (populate.includes('dispensary')) {
                pipeline.push({
                    $lookup: {
                        from: 'item',
                        localField: 'dispensary_id',
                        foreignField: '_id',
                        as: "dispensary"
                    }
                });
                pipeline.push({
                    $unwind: {
                        path: '$dispensary',
                        preserveNullAndEmptyArrays: true
                    }
                });
            }
            
            // Get total count
            const countPipeline = [...pipeline, { $count: "total" }];
            const totalResult = await FailedCards.native().aggregate(countPipeline).toArray();
            const total = totalResult && totalResult.length > 0 ? totalResult[0].total : 0;
            
            // Add sorting and pagination
            pipeline.push({ $sort: { [field]: sortOrder } });
            pipeline.push({ $skip: (page - 1) * count });
            pipeline.push({ $limit: Number(count) });
            
            const results = await FailedCards.native().aggregate(pipeline).toArray();
            
            return {
                success: true,
                data: results,
                total: total,
                page: Number(page),
                count: results.length,
                totalPages: Math.ceil(total / count)
            };
            
        } catch (err) {
            console.error('Error in FailedCardsService.find:', err);
            throw err;
        }
    }
};