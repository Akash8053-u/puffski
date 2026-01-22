const { ObjectId } = require('mongodb');
const DriverScheduler = require('../models/DriverScheduler');
const User = require('../models/users');
const Item = require('../models/item');

module.exports = {
    saveDriverScheduler: async (data) => {
        try {
            console.log("data", JSON.stringify(data));
            
            if (data.endDate) { data.endDate = new Date(data.endDate); }
            if (data.startDate) { data.startDate = new Date(data.startDate); }
                     
            const dsData = await DriverScheduler.create(data);
            
            return {
                success: true,
                code: 200,
                data: {
                    data: dsData,
                    message: "Driver schedule added successfully"
                }
            };
        } catch (err) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: "Error: " + err.message
                }
            };
        }
    },

    saveDriverMultipleScheduler: async (data) => {
        try {
            var allDriver = data.driverId;
            var alreadyExist = [];
            
            if (allDriver && allDriver.length > 0) {
                delete data.driverId;
                
                for (let itm of allDriver) {
                    let already = "";
                    data.driverId = itm;
                    var end = new Date(data.endDate);
                    
                    var start = new Date(data.startDate);
                    start.setUTCHours(0, 0, 0, 0);
                    
                    var driverQuery = {
                        driverId: new ObjectId(itm),
                        store: data.store,
                        shiftType: data.shiftType,
                        startDate: { $gte: start }
                    };
                    
                    already = await DriverScheduler.findOne(driverQuery).populate("driverId");
                    
                    if (already) {
                        alreadyExist.push(already.driverId);
                    } else {
                        data.startDate = new Date(data.startDate);
                        data.endDate = new Date(data.endDate);
                        await DriverScheduler.create(data);
                    }
                }
                
                return {
                    success: true,
                    code: 200,
                    data: {
                        alreadyExist: alreadyExist,
                        message: "Driver schedule added successfully"
                    }
                };
            } else {
                return {
                    success: false,
                    error: {
                        code: 400,
                        message: "Error: Please try after sometime"
                    }
                };
            }
        } catch (err) {
            return {
                success: false,
                error: {
                    code: 400,
                    message: "Error: " + err.message
                }
            };
        }
    },

    getAllDriverScheduler: async (queryParams) => {
        try {
            var page = queryParams.page;
            var count = queryParams.count;
            var sortBy = queryParams.sortBy;
            var search = queryParams.search;
            var addedBy = queryParams.addedBy;
            var startDate = queryParams.startDate;
            var endDate = queryParams.endDate;
            var driverId = queryParams.driverId;
            var driver = queryParams.driver;
            var store = queryParams.store;
            var city = queryParams.city;
            var shiftType = queryParams.shiftType;
            
            var query = { isDeleted: false };
            var sortquery = {};
            
            if (sortBy) {
                var typeArr = sortBy.split(" ");
                var sortType = typeArr[1];
                var field = typeArr[0];
            }
            
            if (addedBy) {
                query.addedBy = new ObjectId(addedBy);
            }
            
            if (driverId) {
                query.driverId = new ObjectId(driverId);
            }
            
            if (driver) {
                query.driverId = new ObjectId(driver);
            }
            
            if (store) {
                query.store = new ObjectId(store);
            }
            
            if (shiftType) {
                query.shiftType = shiftType;
            }
            
            if (city) {
                query.city = { $regex: city, $options: 'i' };
            }
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { storeName: { $regex: search, $options: 'i' } }
                ];
            }
            
            sortquery[field ? field : 'createdAt'] = sortType ? (sortType == 'desc' ? -1 : 1) : -1;
            
            if (!endDate && startDate) {
                var start = new Date(startDate);
                start.setUTCHours(0, 0, 0, 0);
                var end = new Date(start);
                end.setUTCHours(23, 59, 59, 999);
                query.startDate = { $gte: start };
            } else if (endDate && !startDate) {
                var end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                query.endDate = { $lte: end };
            } else if (endDate && startDate) {
                var start = new Date(startDate);
                var end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                query.startDate = { $gte: start };
                query.endDate = { $lte: end };
            }
            
            const pipeline = [
                {
                    $lookup: {
                        from: 'users',
                        localField: 'driverId',
                        foreignField: '_id',
                        as: "driverDetail"
                    }
                },
                {
                    $unwind: {
                        path: '$driverDetail',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'items',
                        localField: 'store',
                        foreignField: '_id',
                        as: "storeDetail"
                    }
                },
                {
                    $unwind: {
                        path: '$storeDetail',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        id: "$_id",
                        driverId: "$driverId",
                        driverDetail: "$driverDetail",
                        name: "$driverDetail.fullName",
                        email: "$driverDetail.email",
                        phone: "$driverDetail.mobile",
                        city: "$city",
                        isCustom: "$isCustom",
                        cityDriver: "$driverDetail.cityDriver",
                        cityDriverString: "$driverDetail.cityDriverString",
                        username1: "$driverDetail.username1",
                        username: "$driverDetail.username",
                        registeredDate: "$driverDetail.date_registered",
                        startDate: "$startDate",
                        endDate: "$endDate",
                        startTime: "$startTime",
                        endTime: "$endTime",
                        shiftType: "$shiftType",
                        shiftingTiming: "$shiftingTiming",
                        store: "$store",
                        storeDetail: "$storeDetail",
                        storeName: "$storeDetail.name",
                        isCompleted: "$isCompleted",
                        morningStartTime: "$morningStartTime",
                        morningEndTime: "$morningEndTime",
                        afternoonStartTime: "$afternoonStartTime",
                        afternoonEndTime: "$afternoonEndTime",
                        eveningStartTime: "$eveningStartTime",
                        eveningEndTime: "$eveningEndTime",
                        morning: "$morning",
                        afternoon: "$afternoon",
                        evening: "$evening",
                        status: "$status",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                        isDeleted: "$isDeleted"
                    }
                },
                {
                    $match: query
                }
            ];
            
            const countPipeline = [...pipeline];
            countPipeline.push({ $count: "total" });
            
            const totalResult = await DriverScheduler.aggregate(countPipeline);
            const total = totalResult.length > 0 ? totalResult[0].total : 0;
            
            if (page && count) {
                var skipNo = (Number(page) - 1) * Number(count);
                pipeline.push(
                    { $sort: sortquery },
                    { $skip: skipNo },
                    { $limit: Number(count) }
                );
            } else {
                pipeline.push({ $sort: sortquery });
            }
            
            const results = await DriverScheduler.aggregate(pipeline);
            
            return {
                success: true,
                data: results,
                total: total
            };
            
        } catch (err) {
            return {
                success: false,
                error: { code: 500, message: err.message }
            };
        }
    },

    getDetail: async (id) => {
        try {
            const detail = await DriverScheduler.findOne({ _id: new ObjectId(id) })
                .populate('driverId');
            
            return {
                success: true,
                data: detail
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 400, message: err.message }
            };
        }
    },

    update: async (data) => {
        try {
            const id = data.id;
            delete data.id; 
            const updated = await DriverScheduler.findByIdAndUpdate(
                new ObjectId(id),
                data,
                { new: true }
            );
            
            return {
                success: true,
                message: "Driver schedule updated successfully.",
                data: updated
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 400, message: err.message }
            };
        }
    },

    deleteSelectedSlot: async (id) => {
        try {
            const result = await DriverScheduler.deleteOne({ _id: new ObjectId(id) });
            
            if (result.deletedCount === 0) {
                return {
                    success: false,
                    error: { message: "Record not found" }
                };
            }
            
            return {
                success: true,
                data: {
                    message: "Deleted Successfully"
                }
            };
        } catch (err) {
            return {
                success: false,
                error: err
            };
        }
    },

    getDriverSchedulesByDriverId: async (driverId, options = {}) => {
        try {
            const query = {
                driverId: new ObjectId(driverId),
                isDeleted: false
            };

            if (options.startDate || options.endDate) {
                if (options.startDate && !options.endDate) {
                    const start = new Date(options.startDate);
                    start.setUTCHours(0, 0, 0, 0);
                    const end = new Date(start);
                    end.setUTCHours(23, 59, 59, 999);
                    query.startDate = { $gte: start };
                } else if (options.endDate && !options.startDate) {
                    const end = new Date(options.endDate);
                    end.setUTCHours(23, 59, 59, 999);
                    query.endDate = { $lte: end };
                } else if (options.startDate && options.endDate) {
                    const start = new Date(options.startDate);
                    const end = new Date(options.endDate);
                    end.setUTCHours(23, 59, 59, 999);
                    query.startDate = { $gte: start };
                    query.endDate = { $lte: end };
                }
            }

            if (options.store) {
                query.store = new ObjectId(options.store);
            }

            if (options.shiftType) {
                query.shiftType = options.shiftType;
            }

            if (options.status !== undefined) {
                query.status = options.status;
            }

            const schedules = await DriverScheduler.find(query)
                .populate('driverId', 'fullName email mobile')
                .populate('store', 'name address city')
                .sort({ startDate: 1, startTime: 1 });

            return {
                success: true,
                data: schedules,
                total: schedules.length
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 500, message: err.message }
            };
        }
    },

    getDriverSchedulesByStore: async (storeId, options = {}) => {
        try {
            const query = {
                store: new ObjectId(storeId),
                isDeleted: false
            };

            if (options.startDate || options.endDate) {
                if (options.startDate && !options.endDate) {
                    const start = new Date(options.startDate);
                    start.setUTCHours(0, 0, 0, 0);
                    const end = new Date(start);
                    end.setUTCHours(23, 59, 59, 999);
                    query.startDate = { $gte: start };
                } else if (options.endDate && !options.startDate) {
                    const end = new Date(options.endDate);
                    end.setUTCHours(23, 59, 59, 999);
                    query.endDate = { $lte: end };
                } else if (options.startDate && options.endDate) {
                    const start = new Date(options.startDate);
                    const end = new Date(options.endDate);
                    end.setUTCHours(23, 59, 59, 999);
                    query.startDate = { $gte: start };
                    query.endDate = { $lte: end };
                }
            }

            if (options.driverId) {
                query.driverId = new ObjectId(options.driverId);
            }

            if (options.shiftType) {
                query.shiftType = options.shiftType;
            }

            if (options.isCompleted !== undefined) {
                query.isCompleted = options.isCompleted;
            }

            const schedules = await DriverScheduler.find(query)
                .populate('driverId', 'fullName email mobile')
                .populate('store', 'name address city')
                .sort({ startDate: 1, startTime: 1 });

            return {
                success: true,
                data: schedules,
                total: schedules.length
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 500, message: err.message }
            };
        }
    },

    getAvailableDriversForSlot: async (storeId, date, shiftType) => {
        try {
            const startDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            
            const endDate = new Date(startDate);
            endDate.setUTCHours(23, 59, 59, 999);

            const scheduledDrivers = await DriverScheduler.find({
                store: new ObjectId(storeId),
                startDate: { $gte: startDate },
                endDate: { $lte: endDate },
                shiftType: shiftType,
                isDeleted: false
            }).select('driverId');

            const scheduledDriverIds = scheduledDrivers.map(schedule => schedule.driverId.toString());

            const allDrivers = await User.find({
                role: 'driver',
                status: 'active',
                isDeleted: false
            }).select('_id fullName email mobile city');
           const availableDrivers = allDrivers.filter(driver => 
                !scheduledDriverIds.includes(driver._id.toString())
            );

            return {
                success: true,
                data: {
                    availableDrivers: availableDrivers,
                    scheduledDrivers: scheduledDrivers.length,
                    totalDrivers: allDrivers.length
                }
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 500, message: err.message }
            };
        }
    },

    markScheduleAsCompleted: async (scheduleId) => {
        try {
            const updated = await DriverScheduler.findByIdAndUpdate(
                new ObjectId(scheduleId),
                {
                    isCompleted: true,
                    completedAt: new Date()
                },
                { new: true }
            );

            if (!updated) {
                return {
                    success: false,
                    error: { message: "Schedule not found" }
                };
            }

            return {
                success: true,
                data: updated,
                message: "Schedule marked as completed"
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 400, message: err.message }
            };
        }
    },

    bulkDeleteSchedules: async (scheduleIds) => {
        try {
            if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
                return {
                    success: false,
                    error: { message: "No schedule IDs provided" }
                };
            }

            const objectIds = scheduleIds.map(id => new ObjectId(id));

            const result = await DriverScheduler.deleteMany({
                _id: { $in: objectIds }
            });

            return {
                success: true,
                data: {
                    deletedCount: result.deletedCount,
                    message: `${result.deletedCount} schedules deleted successfully`
                }
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 400, message: err.message }
            };
        }
    },

    getDriverScheduleSummary: async (driverId, startDate, endDate) => {
        try {
            const query = {
                driverId: new ObjectId(driverId),
                isDeleted: false
            };

            if (startDate && endDate) {
                const start = new Date(startDate);
                start.setUTCHours(0, 0, 0, 0);
                const end = new Date(endDate);
                end.setUTCHours(23, 59, 59, 999);
                query.startDate = { $gte: start };
                query.endDate = { $lte: end };
            }

            const schedules = await DriverScheduler.find(query)
                .populate('store', 'name city')
                .sort({ startDate: 1 });

             const summary = {
                totalSchedules: schedules.length,
                completedSchedules: schedules.filter(s => s.isCompleted).length,
                pendingSchedules: schedules.filter(s => !s.isCompleted).length,
                stores: {},
                shiftTypes: {}
            };

             schedules.forEach(schedule => {
                const storeName = schedule.store?.name || 'Unknown';
                if (!summary.stores[storeName]) {
                    summary.stores[storeName] = 0;
                }
                summary.stores[storeName]++;
                const shiftType = schedule.shiftType || 'Unknown';
                if (!summary.shiftTypes[shiftType]) {
                    summary.shiftTypes[shiftType] = 0;
                }
                summary.shiftTypes[shiftType]++;
            });

            return {
                success: true,
                data: {
                    schedules: schedules,
                    summary: summary
                }
            };
        } catch (err) {
            return {
                success: false,
                error: { code: 500, message: err.message }
            };
        }
    }
};