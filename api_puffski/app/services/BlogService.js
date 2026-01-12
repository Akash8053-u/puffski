const { ObjectId } = require('mongodb');
//const constantObj = require('../config/constants');
const Blogs = require('../models/Blogs');
const Comments = require('../models/Comments');

const slugify = (string) =>
  string.toString().trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

const BlogService = {

  
  saveBlog: async (data, context) => {
   
    
    if (!data.body.title) return { success: false, error: { code: 404, message: 'TITLE_REQUIRED' } };
    if (!data.body.description) return { success: false, error: { code: 404, message:  'DESCRIPTION_REQUIRED' } };
console.log();

    data.slug = slugify(data.body.title);
    data.createdBy = context.identity;

    try {
      const existing = await Blogs.findOne({ title: data.title, isDeleted: false });
      if (existing) return { success: false, error: { code: 400,  key: 'BLOG_ALREADY_EXIST' } };

      const blog = await Blogs.create(data);
      return { success: true, code: 200, data: { blog,  key: 'SAVED_BLOGS' } };
    } catch (err) {
      return { success: false, error: { code: 400, message: err.message || err } };
    }
  },

  // Add a comment
  addComment: async (data, context) => {
    if (!data.blog_id) return { success: false, error: { code: 404, message:  'ID_REQUIRED' } };
    if (!data.blog_comment) return { success: false, error: { code: 404, key: 'DESCRIPTION_REQUIRED' } };

    data.createdBy = context.identity.id;

    try {
      const comment = await Comments.create(data);
      return { success: true, code: 200, data: { blog: comment, message: 'Comment Saved Successfully' } };
    } catch (err) {
      return { success: false, error: { code: 400, message: err.message || err } };
    }
  },

  // Update a blog
  updateBlog: async (data, context) => {
    if (!data.id) return { success: false, error: { code: 404, message: 'Blog ID required' } };

    data.slug = slugify(data.title);
    data.updatedBy = context.identity.id;

    try {
      const blog = await Blogs.findOne({ _id: ObjectId(data.id), isDeleted: false, status: 'active' });
      if (!blog) return { success: false, error: { code: 400, message: 'Blog not found' } };

      const updated = await Blogs.updateOne({ _id: ObjectId(data.id) }).set(data);
      return { success: true, code: 200, data: { blog: updated, message: 'Blog Updated Successfully', key: 'UPDATED_BLOGS' } };
    } catch (err) {
      return { success: false, error: { code: 400, message: err.message || err } };
    }
  }

};

module.exports = BlogService;
