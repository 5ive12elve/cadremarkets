import Ticket from '../models/ticket.model.js';
import { errorHandler } from '../utils/error.js';

// Get all tickets
export const getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
};

// Create a new ticket
export const createTicket = async (req, res, next) => {
  try {
    const lastTicket = await Ticket.findOne().sort({ id: -1 });
    const lastId = lastTicket ? parseInt(lastTicket.id.slice(3)) : 0;
    const ticketId = `TKT${String(lastId + 1).padStart(4, '0')}`;

    const ticket = await Ticket.create({
      ...req.body,
      id: ticketId
    });

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

// Update ticket status
export const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return next(errorHandler(400, 'Invalid status'));
    }

    const ticket = await Ticket.findOneAndUpdate(
      { id: req.params.id },
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!ticket) {
      return next(errorHandler(404, 'Ticket not found'));
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
};

// Get a single ticket
export const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) {
      return next(errorHandler(404, 'Ticket not found'));
    }
    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
}; 