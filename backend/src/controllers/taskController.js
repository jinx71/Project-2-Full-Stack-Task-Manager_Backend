const prisma = require('../config/prisma');
const { validateTask } = require('../utils/validate');

// GET /api/tasks?status=&priority=&search=
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const where = { userId: req.userId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: { tasks }, message: 'OK' });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const errors = validateTask(req.body || {});
    if (errors.length) {
      return res.status(400).json({ success: false, data: null, message: errors.join('. ') });
    }

    const { title, description, status, priority, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.userId,
      },
    });

    res.status(201).json({ success: true, data: { task }, message: 'Task created' });
  } catch (err) {
    next(err);
  }
};

// Ownership check shared by update/delete — 404 (not 403) so task IDs can't be probed
const findOwnedTask = async (id, userId) => {
  const task = await prisma.task.findUnique({ where: { id } });
  return task && task.userId === userId ? task : null;
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const existing = await findOwnedTask(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }

    const errors = validateTask(req.body || {}, { partial: true });
    if (errors.length) {
      return res.status(400).json({ success: false, data: null, message: errors.join('. ') });
    }

    const { title, description, status, priority, dueDate } = req.body;
    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({ where: { id: existing.id }, data });
    res.json({ success: true, data: { task }, message: 'Task updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const existing = await findOwnedTask(req.params.id, req.userId);
    if (!existing) {
      return res.status(404).json({ success: false, data: null, message: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: existing.id } });
    res.json({ success: true, data: null, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };


// this is task controller