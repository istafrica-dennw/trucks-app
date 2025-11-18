import {
  getAllDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
  addInstallment,
  getDriveStats,
  getDrivesByTruck,
  getDrivesByDriver,
  getDrivesByCustomer,
  getDrivesByDate
} from '../services/driveService.js';
import { createJourneyActivity, createPaymentActivity } from '../services/activityService.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export const getAllDrivesController = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      status: req.query.status || '',
      truckId: req.query.truckId || '',
      driverId: req.query.driverId || '',
      customer: req.query.customer || '',
      departureCity: req.query.departureCity || '',
      destinationCity: req.query.destinationCity || '',
      paidOption: req.query.paidOption || '',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sortBy: req.query.sortBy || 'date',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await getAllDrives(filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getAllDrivesController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives',
      error: error.message
    });
  }
};

export const getDriveByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const drive = await getDriveById(id);

    if (!drive) {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    logger.error('Error in getDriveByIdController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drive',
      error: error.message
    });
  }
};

export const createDriveController = async (req, res) => {
  try {
    // Handle FormData (for file uploads) or JSON requests
    let driveData;
    
    // Check if there are any files (payment proof or expense attachments)
    const hasFiles = req.file || (req.files && Object.keys(req.files).length > 0);
    
    if (hasFiles) {
      // This is a FormData request with a file (full payment proof)
      // Extract data from FormData
      driveData = {
        driver: req.body.driver,
        truck: req.body.truck,
        departureCity: req.body.departureCity,
        destinationCity: req.body.destinationCity,
        cargo: req.body.cargo,
        customer: req.body.customer,
        notes: req.body.notes || '',
        status: req.body.status || 'started',
        date: req.body.date || new Date(),
        expenses: (() => {
          const expenses = req.body.expenses ? (Array.isArray(req.body.expenses) ? req.body.expenses : JSON.parse(req.body.expenses)) : [];
          // Process expense attachments from FormData
          return expenses.map((expense, index) => {
            const expenseData = {
              title: expense.title || req.body[`expenses[${index}][title]`],
              amount: parseFloat(expense.amount || req.body[`expenses[${index}][amount]`] || 0),
              note: expense.note || req.body[`expenses[${index}][note]`] || ''
            };
            
            // Check if there's an attachment file for this expense
            const attachmentKey = `expenses[${index}][attachment]`;
            if (req.files && req.files[attachmentKey] && req.files[attachmentKey][0]) {
              const file = req.files[attachmentKey][0];
              expenseData.attachment = {
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
              };
            } else if (expense.attachment) {
              // Preserve existing attachment if no new file is provided
              expenseData.attachment = expense.attachment;
            }
            
            return expenseData;
          });
        })(),
        pay: {
          totalAmount: parseFloat(req.body['pay[totalAmount]'] || req.body.pay?.totalAmount),
          currency: req.body['pay[currency]'] || req.body.pay?.currency || 'RWF',
          exchangeRate: parseFloat(req.body['pay[exchangeRate]'] || req.body.pay?.exchangeRate || 1),
          paidOption: req.body['pay[paidOption]'] || req.body.pay?.paidOption || 'full',
          installments: []
        }
      };
      
      // If this is a full payment with attachment, add the attachment data
      if (driveData.pay.paidOption === 'full' && req.file) {
        driveData.pay.attachment = {
          filename: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size
        };
      }
    } else {
      // Regular JSON request
      driveData = req.body;
    }
    
    const userId = req.user.id;
    
    const drive = await createDrive(driveData, userId);

    // Create activity for journey started
    try {
      await createJourneyActivity(drive, req.user, 'started');
    } catch (activityError) {
      logger.warn('Failed to create journey activity', { error: activityError.message, driveId: drive._id });
    }

    res.status(201).json({
      success: true,
      message: 'Drive created successfully',
      data: drive
    });
  } catch (error) {
    logger.error('Error in createDriveController', { error: error.message });
    
    if (error.message.includes('not found') || error.message.includes('exceed')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create drive',
      error: error.message
    });
  }
};

export const updateDriveController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Handle FormData (for file uploads) or JSON requests
    let updateData;
    
    // Check if there are any files (payment proof or expense attachments)
    const hasFiles = req.file || (req.files && Object.keys(req.files).length > 0);
    
    if (hasFiles) {
      // This is a FormData request with a file (full payment proof)
      // Extract data from FormData
      updateData = {
        driver: req.body.driver,
        truck: req.body.truck,
        departureCity: req.body.departureCity,
        destinationCity: req.body.destinationCity,
        cargo: req.body.cargo,
        customer: req.body.customer,
        notes: req.body.notes || '',
        status: req.body.status || 'started',
        date: req.body.date || new Date(),
        expenses: (() => {
          const expenses = req.body.expenses ? (Array.isArray(req.body.expenses) ? req.body.expenses : JSON.parse(req.body.expenses)) : [];
          // Process expense attachments from FormData
          return expenses.map((expense, index) => {
            const expenseData = {
              title: expense.title || req.body[`expenses[${index}][title]`],
              amount: parseFloat(expense.amount || req.body[`expenses[${index}][amount]`] || 0),
              note: expense.note || req.body[`expenses[${index}][note]`] || ''
            };
            
            // Check if there's an attachment file for this expense
            const attachmentKey = `expenses[${index}][attachment]`;
            if (req.files && req.files[attachmentKey] && req.files[attachmentKey][0]) {
              const file = req.files[attachmentKey][0];
              expenseData.attachment = {
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
              };
            } else if (expense.attachment) {
              // Preserve existing attachment if no new file is provided
              expenseData.attachment = expense.attachment;
            }
            
            return expenseData;
          });
        })(),
        pay: {
          totalAmount: parseFloat(req.body['pay[totalAmount]'] || req.body.pay?.totalAmount),
          currency: req.body['pay[currency]'] || req.body.pay?.currency || 'RWF',
          exchangeRate: parseFloat(req.body['pay[exchangeRate]'] || req.body.pay?.exchangeRate || 1),
          paidOption: req.body['pay[paidOption]'] || req.body.pay?.paidOption || 'full',
          installments: req.body['pay[installments]'] ? (Array.isArray(req.body['pay[installments]']) ? req.body['pay[installments]'] : JSON.parse(req.body['pay[installments]'])) : []
        }
      };
      
      // If this is a full payment with attachment, add the attachment data
      if (updateData.pay.paidOption === 'full' && req.file) {
        updateData.pay.attachment = {
          filename: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size
        };
      }
    } else {
      // Regular JSON request
      updateData = req.body;
    }
    
    // Get the original drive to check status changes
    const originalDrive = await getDriveById(id);
    const drive = await updateDrive(id, updateData);

    // Create activity if status changed to completed
    if (originalDrive && originalDrive.status !== 'completed' && drive.status === 'completed') {
      try {
        await createJourneyActivity(drive, req.user, 'completed');
      } catch (activityError) {
        logger.warn('Failed to create journey completion activity', { error: activityError.message, driveId: drive._id });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Drive updated successfully',
      data: drive
    });
  } catch (error) {
    logger.error('Error in updateDriveController', { error: error.message });
    
    if (error.message === 'Drive not found') {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    if (error.message.includes('exceed') || error.message.includes('Payment incomplete') || error.message.includes('Cannot complete journey')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update drive',
      error: error.message
    });
  }
};

export const deleteDriveController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteDrive(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    logger.error('Error in deleteDriveController', { error: error.message });
    
    if (error.message === 'Drive not found') {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete drive',
      error: error.message
    });
  }
};

export const addInstallmentController = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, date } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Proof of payment attachment is required'
      });
    }

    // Prepare installment data with attachment info
    const installmentData = {
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      attachment: {
        filename: req.file.originalname,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    };
    
    const drive = await addInstallment(id, installmentData);

    // Create activity for installment payment
    try {
      const paymentData = {
        amount: installmentData.amount,
        method: 'installment',
        remainingBalance: drive.balance || 0,
        installmentNumber: drive.pay?.installments?.length || 1
      };
      await createPaymentActivity(drive, paymentData, req.user, 'installment_paid');
    } catch (activityError) {
      logger.warn('Failed to create payment activity', { error: activityError.message, driveId: drive._id });
    }

    res.status(200).json({
      success: true,
      message: 'Installment added successfully',
      data: drive
    });
  } catch (error) {
    logger.error('Error in addInstallmentController', { error: error.message });
    
    if (error.message === 'Drive not found') {
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    if (error.message.includes('installment') || error.message.includes('exceed')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add installment',
      error: error.message
    });
  }
};

export const getDriveStatsController = async (req, res) => {
  try {
    const stats = await getDriveStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error in getDriveStatsController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drive statistics',
      error: error.message
    });
  }
};

export const getDrivesByTruckController = async (req, res) => {
  try {
    const { truckId } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status || ''
    };

    const result = await getDrivesByTruck(truckId, filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getDrivesByTruckController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives by truck',
      error: error.message
    });
  }
};

export const getDrivesByDriverController = async (req, res) => {
  try {
    const { driverId } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status || ''
    };

    const result = await getDrivesByDriver(driverId, filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getDrivesByDriverController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives by driver',
      error: error.message
    });
  }
};

export const getDrivesByCustomerController = async (req, res) => {
  try {
    const { customerId } = req.params;
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      status: req.query.status || ''
    };

    const result = await getDrivesByCustomer(customerId, filters);

    res.status(200).json({
      success: true,
      data: result.drives,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error in getDrivesByCustomerController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customer journeys',
      error: error.message
    });
  }
};

export const getDrivesByDateController = async (req, res) => {
  try {
    const { date } = req.params;
    const drives = await getDrivesByDate(date);

    res.status(200).json({
      success: true,
      data: drives
    });
  } catch (error) {
    logger.error('Error in getDrivesByDateController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve drives by date',
      error: error.message
    });
  }
};

export const getExpenseProofController = async (req, res) => {
  try {
    const { id, expenseIndex } = req.params;
    const index = parseInt(expenseIndex, 10);
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ success: false, message: 'Invalid expense index' });
    }
    
    const drive = await getDriveById(id);
    if (!drive) {
      return res.status(404).json({ success: false, message: 'Journey not found' });
    }
    
    const driveObj = drive.toObject ? drive.toObject() : drive;
    
    if (!driveObj.expenses || !Array.isArray(driveObj.expenses) || index >= driveObj.expenses.length) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    
    const expense = driveObj.expenses[index];
    if (!expense.attachment || !expense.attachment.path) {
      logger.warn('Expense missing attachment', { driveId: id, expenseIndex: index });
      return res.status(404).json({ success: false, message: 'Expense proof attachment not found' });
    }
    
    const filePath = expense.attachment.path;
    if (!fs.existsSync(filePath)) {
      logger.error('Expense proof file not found on disk', { filePath, driveId: id, expenseIndex: index });
      return res.status(404).json({ success: false, message: 'Expense proof file not found' });
    }
    
    const stats = fs.statSync(filePath);
    const actualFileSize = stats.size;
    
    if (actualFileSize !== expense.attachment.size) {
      logger.warn('Expense proof file size mismatch', { 
        expected: expense.attachment.size, 
        actual: actualFileSize, 
        driveId: id, 
        expenseIndex: index 
      });
    }
    
    const filename = expense.attachment.filename || 'expense-proof';
    res.setHeader('Content-Type', expense.attachment.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', actualFileSize);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        logger.error('Error sending expense proof file', { 
          filePath, 
          error: err.message, 
          stack: err.stack,
          driveId: id,
          expenseIndex: index
        });
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Error sending file' });
        }
      }
    });
  } catch (error) {
    logger.error('Error in getExpenseProofController', { error: error.message, stack: error.stack });
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Failed to retrieve expense proof', error: error.message });
    }
  }
};

export const getFullPaymentProofController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log for debugging
    logger.info('Full payment proof request received', {
      id,
      allParams: req.params,
      url: req.url
    });
    
    // Validate drive ID format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      logger.warn('Invalid drive ID format', { id });
      return res.status(400).json({
        success: false,
        message: 'Invalid drive ID format'
      });
    }
    
    const drive = await getDriveById(id);
    
    if (!drive) {
      logger.warn('Full payment proof requested for non-existent drive', { driveId: id });
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    // Convert to plain object if it's a Mongoose document
    const driveObj = drive.toObject ? drive.toObject() : drive;

    // Check if drive has payment info
    if (!driveObj.pay) {
      logger.warn('Drive has no payment info', { driveId: id });
      return res.status(404).json({
        success: false,
        message: 'Drive has no payment information'
      });
    }

    // Check if this is a full payment
    if (driveObj.pay.paidOption !== 'full') {
      logger.warn('Drive is not a full payment', { driveId: id, paidOption: driveObj.pay.paidOption });
      return res.status(400).json({
        success: false,
        message: 'This drive is not a full payment'
      });
    }

    // Check if attachment exists
    if (!driveObj.pay.attachment || !driveObj.pay.attachment.path) {
      logger.warn('Full payment has no attachment', { driveId: id });
      return res.status(404).json({
        success: false,
        message: 'Payment proof attachment not found'
      });
    }

    const filePath = driveObj.pay.attachment.path;
    
    if (!fs.existsSync(filePath)) {
      logger.warn('Payment proof file not found on filesystem', { filePath, driveId: id });
      return res.status(404).json({
        success: false,
        message: 'Payment proof file not found'
      });
    }

    // Get actual file stats to ensure size matches
    const fileStats = fs.statSync(filePath);
    const actualFileSize = fileStats.size;
    
    // Verify stored size matches actual file size
    if (driveObj.pay.attachment.size !== actualFileSize) {
      logger.warn('File size mismatch', {
        storedSize: driveObj.pay.attachment.size,
        actualSize: actualFileSize,
        filePath
      });
    }

    // Ensure filename is properly encoded for HTTP headers
    const filename = driveObj.pay.attachment.filename || 'payment-proof';

    // Set headers BEFORE sending the file (this is more reliable than passing to res.download)
    res.setHeader('Content-Type', driveObj.pay.attachment.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', actualFileSize);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Use res.sendFile() which is more reliable for binary files
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        logger.error('Error sending full payment proof file', { 
          filePath, 
          error: err.message, 
          stack: err.stack,
          driveId: id
        });
        if (!res.headersSent) {
          if (err.code === 'ENOENT') {
            return res.status(404).json({
              success: false,
              message: 'Payment proof file not found'
            });
          }
          res.status(500).json({
            success: false,
            message: 'Error reading payment proof file',
            error: err.message
          });
        }
      } else {
        logger.info('Full payment proof file sent successfully', {
          driveId: id,
          filename,
          fileSize: actualFileSize
        });
      }
    });

  } catch (error) {
    logger.error('Error in getFullPaymentProofController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment proof',
      error: error.message
    });
  }
};

export const getPaymentProofController = async (req, res) => {
  try {
    const { id, installmentIndex } = req.params;
    
    // Log for debugging
    logger.info('Payment proof request received', {
      id,
      installmentIndex,
      allParams: req.params,
      url: req.url,
      originalUrl: req.originalUrl
    });
    
    // Validate drive ID format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      logger.warn('Invalid drive ID format', { id });
      return res.status(400).json({
        success: false,
        message: 'Invalid drive ID format'
      });
    }
    
    // Check if installmentIndex is provided
    if (!installmentIndex || installmentIndex === undefined || installmentIndex === null || installmentIndex === '') {
      logger.warn('Missing installmentIndex parameter', { 
        params: req.params,
        installmentIndex,
        allParams: Object.keys(req.params)
      });
      return res.status(400).json({
        success: false,
        message: 'Installment index is required'
      });
    }
    
    const index = parseInt(installmentIndex, 10);
    
    // Validate index
    if (isNaN(index) || index < 0) {
      logger.warn('Invalid installment index', { 
        installmentIndex, 
        parsedIndex: index,
        isNaN: isNaN(index),
        type: typeof installmentIndex
      });
      return res.status(400).json({
        success: false,
        message: `Invalid installment index: "${installmentIndex}". Expected a non-negative integer.`
      });
    }
    
    const drive = await getDriveById(id);
    
    if (!drive) {
      logger.warn('Payment proof requested for non-existent drive', { driveId: id });
      return res.status(404).json({
        success: false,
        message: 'Drive not found'
      });
    }

    // Convert to plain object if it's a Mongoose document
    const driveObj = drive.toObject ? drive.toObject() : drive;

    // Check if drive has payment info
    if (!driveObj.pay) {
      logger.warn('Drive has no payment info', { driveId: id });
      return res.status(404).json({
        success: false,
        message: 'Drive has no payment information'
      });
    }

    // Check if installments exist
    if (!driveObj.pay.installments || !Array.isArray(driveObj.pay.installments)) {
      logger.warn('Drive has no installments array', { driveId: id, payOption: driveObj.pay.paidOption });
      return res.status(404).json({
        success: false,
        message: 'Drive has no installments'
      });
    }

    // Check if index is valid
    if (index >= driveObj.pay.installments.length) {
      logger.warn('Installment index out of bounds', { 
        driveId: id, 
        requestedIndex: index, 
        installmentsCount: driveObj.pay.installments.length 
      });
      return res.status(404).json({
        success: false,
        message: `Installment not found. Drive has ${driveObj.pay.installments.length} installment(s), but index ${index} was requested.`
      });
    }

    const installment = driveObj.pay.installments[index];
    
    // Log for debugging
    logger.info('Payment proof request', {
      driveId: id,
      installmentIndex: index,
      totalInstallments: driveObj.pay.installments.length,
      installmentHasAttachment: !!installment.attachment
    });
    
    if (!installment.attachment || !installment.attachment.path) {
      logger.warn('Installment missing attachment', {
        driveId: id,
        installmentIndex: index,
        installment: installment
      });
      return res.status(404).json({
        success: false,
        message: 'Payment proof attachment not found for this installment'
      });
    }

    const filePath = installment.attachment.path;
    
    if (!fs.existsSync(filePath)) {
      logger.warn('Payment proof file not found on filesystem', { filePath, driveId: id, installmentIndex: index });
      return res.status(404).json({
        success: false,
        message: 'Payment proof file not found'
      });
    }

    // Get actual file stats to ensure size matches
    const fileStats = fs.statSync(filePath);
    const actualFileSize = fileStats.size;
    
    // Verify stored size matches actual file size
    if (installment.attachment.size !== actualFileSize) {
      logger.warn('File size mismatch', {
        storedSize: installment.attachment.size,
        actualSize: actualFileSize,
        filePath
      });
    }

    // Ensure filename is properly encoded for HTTP headers
    const filename = installment.attachment.filename || 'payment-proof';

    // Set headers BEFORE sending the file (this is more reliable than passing to res.download)
    res.setHeader('Content-Type', installment.attachment.mimetype || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', actualFileSize);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Use res.sendFile() which is more reliable for binary files
    res.sendFile(path.resolve(filePath), (err) => {
      if (err) {
        logger.error('Error sending payment proof file', { 
          filePath, 
          error: err.message, 
          stack: err.stack,
          driveId: id,
          installmentIndex: index
        });
        // Only send error if headers haven't been sent yet
        if (!res.headersSent) {
          // Check if it's a specific error
          if (err.code === 'ENOENT') {
            return res.status(404).json({
              success: false,
              message: 'Payment proof file not found'
            });
          }
          res.status(500).json({
            success: false,
            message: 'Error reading payment proof file',
            error: err.message
          });
        }
      } else {
        logger.info('Payment proof file sent successfully', {
          driveId: id,
          installmentIndex: index,
          filename,
          fileSize: actualFileSize
        });
      }
    });

  } catch (error) {
    logger.error('Error in getPaymentProofController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment proof',
      error: error.message
    });
  }
};