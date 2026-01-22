const CultivatorModel = require('../models/Cultivators');
const ProvinceModel = require('../models/Province'); 
const CityModel = require('../models/City'); 

const constants = {
    cultivators: {
        NAME_REQUIRED: "Cultivator name is required",
        ADDED_SUCCESSFULLY: "Cultivator added successfully",
        ALREADY_EXIST: "Cultivator already exists",
        UPDATED_SUCCESSFULLY: "Cultivator updated successfully"
    }
};

module.exports = {
    addCultivators: async (req, res) => {
        try {
            const data = req.body;
            if (!data.name || typeof data.name === 'undefined') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: constants.cultivators.NAME_REQUIRED
                    }
                });
            }
            data.name = data.name.toLowerCase().trim();

            const existingCultivator = await CultivatorModel.findOne({
                name: data.name,
                isDeleted: false
            });

            if (!existingCultivator) {
                // if (data.province) {
                //     const provinceExists = await ProvinceModel.findById(data.province);
                //     if (!provinceExists) {
                //         return res.status(400).json({
                //             success: false,
                //             error: {
                //                 code: 400,
                //                 message: "Province not found"
                //             }
                //         });
                //     }
                // }

                // if (data.city) {
                //     const cityExists = await CityModel.findById(data.city);
                //     if (!cityExists) {
                //         return res.status(400).json({
                //             success: false,
                //             error: {
                //                 code: 400,
                //                 message: "City not found"
                //             }
                //         });
                //     }
                // }

                if (!data.status) {
                    data.status = 'active';
                }

                const createdCultivator = await CultivatorModel.create(data);

                return res.status(200).json({
                    success: true,
                    code: 200,
                    message: constants.cultivators.ADDED_SUCCESSFULLY,
                    data: createdCultivator
                });
            } else {
                                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: constants.cultivators.ALREADY_EXIST
                    }
                });
            }
        } catch (err) {
                        console.error("Error adding cultivator:", err);
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: err.message || "Error adding cultivator"
                }
            });
        }
    },

       updateCultivator: async (req, res) => {
        try {
            const data = req.body;

             if (!data.id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: "Cultivator ID is required"
                    }
                });
            }

            if (!data.name || typeof data.name === 'undefined') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: constants.cultivators.NAME_REQUIRED
                    }
                });
            }

            data.name = data.name.toLowerCase().trim();

             const existedCultivator = await CultivatorModel.findOne({
                name: data.name,
                isDeleted: false,
                _id: { $ne: data.id }
            });

            if (existedCultivator) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: constants.cultivators.ALREADY_EXIST
                    }
                });
            } else {
                const updatedCultivator = await CultivatorModel.findByIdAndUpdate(
                    data.id,
                    data,
                    { new: true, runValidators: true }
                );

                if (!updatedCultivator) {
                    return res.status(404).json({
                        success: false,
                        error: {
                            code: 404,
                            message: "Cultivator not found"
                        }
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: constants.cultivators.UPDATED_SUCCESSFULLY,
                    data: updatedCultivator
                });
            }
        } catch (err) {
             console.error("Error updating cultivator:", err);
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: err.message || "Error updating cultivator"
                }
            });
        }
    },

     cultivatorDetail: async (req, res) => {
        try {
            const { id } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 400,
                        message: "Cultivator ID is required"
                    }
                });
            }

            const cultivator = await CultivatorModel.findOne({
                _id: id,
                isDeleted: false
            })
                .populate('province', 'name _id')
                .populate('city', 'name _id');

            if (!cultivator) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 404,
                        message: "Cultivator not found"
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: cultivator
            });
        } catch (err) {
            console.error("Error getting cultivator detail:", err);
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: err.message || "Error getting cultivator detail"
                }
            });
        }
    },

       clutivatorsListing: async (req, res) => {
        try {
            let { page, count, status, search } = req.query;
            if (!page || page === 'undefined') {
                page = 1;
            }
            if (!count || count === 'undefined') {
                count = 999999999999999; 
            }

            page = parseInt(page);
            count = parseInt(count);
            const skipNo = (page - 1) * count;

            let query = { isDeleted: false };

            if (status) {
                query.status = status;
            }

            if (search) {
                search = search.trim();
                query.$or = [
                    { name: { $regex: search, $options: 'i' } }
                ];
            }

            const sortBy = { name: 1 };

            const totalResults = await CultivatorModel.countDocuments(query);

            const results = await CultivatorModel.aggregate([
                { $match: query },

                {
                    $lookup: {
                        from: "provinces", 
                        localField: "province",
                        foreignField: "_id",
                        as: "province"
                    }
                },

                {
                    $unwind: {
                        path: "$province",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "cities",
                        localField: "city",
                        foreignField: "_id",
                        as: "city"
                    }
                },

                {
                    $unwind: {
                        path: "$city",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $project: {
                        id: "$_id",
                        name: "$name",
                        province: "$province",
                        provinceName: "$province.name",
                        city: "$city",
                        cityName: "$city.name",
                        status: "$status",
                        isDeleted: "$isDeleted",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt"
                    }
                },

                { $sort: sortBy },

                { $skip: skipNo },
                { $limit: count }
            ]);

            return res.json({
                success: true,
                data: results,
                total: totalResults,
                page: page,
                count: results.length,
                totalPages: Math.ceil(totalResults / count)
            });

        } catch (err) {
            console.error("Error in cultivators listing:", err);
            return res.status(400).json({
                success: false,
                error: {
                    code: 400,
                    message: err.message || "Error getting cultivators list"
                }
            });
        }
    }
};