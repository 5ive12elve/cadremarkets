import Project from '../models/project.model.js';
import { errorHandler } from '../utils/error.js';

// Create a new project
export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// Get all projects with optional filters
export const getProjects = async (req, res, next) => {
  try {
    const { status, featured, category } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    if (category) query.category = category;
    
    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Get a single project by ID
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Update a project
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Delete a project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle project featured status
export const toggleFeatured = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }
    
    project.featured = !project.featured;
    await project.save();
    
    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Update project status
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return next(errorHandler(400, 'Invalid status'));
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!project) {
      return next(errorHandler(404, 'Project not found'));
    }
    
    res.json(project);
  } catch (error) {
    next(error);
  }
}; 