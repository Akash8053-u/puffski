const { ObjectId } = require('mongodb');
const service = require('../services/index');


const BlogsController = {

  save: async (req, res) => {
    const result = await service.BlogService.saveBlog(req,res);
    return res.status(result.success ? 200 : 400).json(result);
  },

  edit: async (req, res) => {
    const result = await service.BlogService.updateBlog(req.body, req);
    return res.status(result.success ? 200 : 400).json(result);
  },

  addComment: async (req, res) => {
    const result = await service.BlogService.addComment(req.body, req);
    return res.status(result.success ? 200 : 400).json(result);
  },

  getAllBlog: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const count = parseInt(req.query.count) || 10;
      const skip = (page - 1) * count;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt DESC';

      let query = { isDeleted: false, createdBy: req.identity.id };
      if (search) {
        query.or = [
          { title: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const total = await Blogs.count(query);
      const blogs = await Blogs.find(query).populate('createdBy').sort(sortBy).skip(skip).limit(count);

      return res.json({ success: true, data: { blog: blogs, total } });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  },

  dispensaryblogs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const count = 15;
      const skip = (page - 1) * count;
      const search = req.query.search;
      const sortBy = req.query.sortBy || 'createdAt DESC';

      let query = { isDeleted: false, dispensary_id: ObjectId(req.query.id) };
      if (search) {
        query.or = [
          { title: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const total = await Blogs.count(query);
      const blogs = await Blogs.find(query).populate('createdBy').sort(sortBy).skip(skip).limit(count);

      return res.json({ success: true, data: { blog: blogs, total } });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  },

  getSingleBlog: async (req, res) => {
    try {
      const blog = await Blogs.findOne({ _id: ObjectId(req.query.id) }).populate('createdBy');
      return res.json({ success: true, data: { blog } });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  },

  getTop3Blogs: async (req, res) => {
    try {
      const blogs = await Blogs.find({ isDeleted: false, dispensary_id: ObjectId(req.query.id) })
        .populate('dispensary_id')
        .sort({ createdAt: -1 })
        .limit(3);

      if (!blogs.length) {
        return res.json({ success: true, data: { message: constantObj.messages.NO_DATA_FOUND, key: 'NO_DATA_FOUND' } });
      }

      return res.json({ success: true, data: { data: blogs } });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message || err });
    }
  },
  blogdetail: async (req, res) => {
    try {
      const blogId = req.params.id;

      if (!ObjectId.isValid(blogId)) {
        return res.status(400).json({ success: false, error: 'Invalid Blog ID' });
      }

     
      const blog = await Blogs.findOne({ _id: ObjectId(blogId), isDeleted: false });

      if (!blog) {
        return res.status(404).json({ success: false, error: 'Blog not found' });
      }

      const comments = await Comments.find({ news_id: blogId, isDeleted: false })
        .populate('addedBy', 'name email') 
        .sort({ createdAt: 1 });

      return res.json({
        success: true,
        data: {
          blog,
          comments
        }
      });

    } catch (err) {
      console.error('Blog Detail Error:', err);
      return res.status(500).json({ success: false, error: err.message || err });
    }
  }
};

module.exports = BlogsController;
