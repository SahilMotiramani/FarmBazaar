// controllers/contractController.js
const Contract = require('../models/Contract');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and documents
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Not an accepted file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Middleware to handle multiple file uploads
const uploadFiles = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'idProof', maxCount: 1 },
  { name: 'landProof', maxCount: 1 },
  { name: 'existingImages', maxCount: 5 }
]);

exports.processUploads = (req, res, next) => {
  uploadFiles(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: 'fail',
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
    
    // Process uploaded files
    if (req.files) {
      // Add file paths to req.body
      if (req.files.images) {
        req.body.images = req.files.images.map(file => file.path);
      }
      if (req.files.idProof) {
        req.body.idProofDocument = req.files.idProof[0].path;
      }
      if (req.files.landProof) {
        req.body.landProofDocument = req.files.landProof[0].path;
      }
      if (req.files.existingImages) {
        req.body.existingImages = req.files.existingImages.map(file => file.path);
      }
    }

    // Handle existing images from form data (for updates)
    if (req.body.existingImages && typeof req.body.existingImages === 'string') {
      req.body.existingImages = [req.body.existingImages];
    }
    
    next();
  });
};

// Helper function to clean up files if transaction fails
const cleanupFiles = (files) => {
  if (!files) return;
  
  Object.values(files).forEach(fileArray => {
    fileArray.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error(`Error deleting file ${file.path}:`, err);
      }
    });
  });
};

exports.getAllContracts = async (req, res) => {
  try {
    // Filter contracts based on visibility and status
    const filter = {
      allowVisibility: true,
      status: 'Active'
    };

    // If user is logged in, show their contracts regardless of visibility
    if (req.user) {
      filter.$or = [
        { allowVisibility: true, status: 'Active' },
        { createdBy: req.user.id }
      ];
    }

    const contracts = await Contract.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: contracts.length,
      contracts
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createContract = async (req, res) => {
  try {
    // Add the current user as the creator of the contract
    req.body.createdBy = req.user.id;

    // Set default status
    req.body.status = 'Active';

    // Handle blockchain smart contract defaults
    if (req.body.useSmartContract) {
      req.body.automaticPayout = req.body.automaticPayout !== false;
      req.body.escrowRequired = req.body.escrowRequired || false;
      req.body.escrowPercentage = req.body.escrowRequired ? req.body.escrowPercentage : undefined;
    }

    const newContract = await Contract.create(req.body);
    
    res.status(201).json({
      status: 'success',
      contract: newContract
    });
  } catch (err) {
    // Clean up uploaded files if creation fails
    if (req.files) {
      cleanupFiles(req.files);
    }
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found'
      });
    }

    // Check if user is authorized to view this contract
    if (!contract.allowVisibility && (!req.user || !contract.createdBy.equals(req.user.id))) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to view this contract'
      });
    }
    
    res.status(200).json({
      status: 'success',
      contract
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateContract = async (req, res) => {
  try {
    // Get the existing contract first
    const existingContract = await Contract.findById(req.params.id);
    if (!existingContract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found'
      });
    }

    // Check if user is authorized to update this contract
    if (!existingContract.createdBy.equals(req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to update this contract'
      });
    }

    // Handle image updates - combine existing and new images
    if (req.body.existingImages || req.body.images) {
      let images = [];
      
      // Keep existing images that weren't removed
      if (req.body.existingImages) {
        images = images.concat(req.body.existingImages);
      }
      
      // Add new images
      if (req.body.images) {
        images = images.concat(req.body.images);
      }
      
      req.body.images = images;
    }

    // Handle blockchain smart contract updates
    if (req.body.useSmartContract) {
      req.body.automaticPayout = req.body.automaticPayout !== false;
      req.body.escrowRequired = req.body.escrowRequired || false;
      req.body.escrowPercentage = req.body.escrowRequired ? req.body.escrowPercentage : undefined;
    }

    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');
    
    res.status(200).json({
      status: 'success',
      contract: updatedContract
    });
  } catch (err) {
    // Clean up uploaded files if update fails
    if (req.files) {
      cleanupFiles(req.files);
    }
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await Contract.find({ 
      createdBy: req.user.id,
      status: { $in: ['Active', 'Pending'] }
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      listings
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getActiveContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      createdBy: req.user.id,
      status: 'Active'
    })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: contracts.length,
      contracts
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contract not found'
      });
    }

    // Check if user is authorized to delete this contract
    if (!contract.createdBy.equals(req.user.id)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to delete this contract'
      });
    }

    // Delete associated files
    const filesToDelete = [
      ...contract.images,
      contract.idProofDocument,
      contract.landProofDocument
    ].filter(Boolean);

    await Contract.findByIdAndDelete(req.params.id);

    // Delete files asynchronously
    filesToDelete.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, err => {
          if (err) console.error(`Error deleting file ${filePath}:`, err);
        });
      }
    });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};