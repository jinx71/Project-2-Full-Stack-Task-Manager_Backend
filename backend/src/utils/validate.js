const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const validateRegister = ({ name, email, password }) => {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !EMAIL_RE.test(email)) errors.push('A valid email is required');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
  return errors;
};

const validateLogin = ({ email, password }) => {
  const errors = [];
  if (!email || !EMAIL_RE.test(email)) errors.push('A valid email is required');
  if (!password) errors.push('Password is required');
  return errors;
};

const validateTask = (body, { partial = false } = {}) => {
  const errors = [];
  const { title, status, priority, dueDate } = body;

  if (!partial || title !== undefined) {
    if (!title || !title.trim()) errors.push('Title is required');
    else if (title.length > 200) errors.push('Title must be 200 characters or fewer');
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${STATUSES.join(', ')}`);
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.push(`Priority must be one of: ${PRIORITIES.join(', ')}`);
  }
  if (dueDate !== undefined && dueDate !== null && Number.isNaN(Date.parse(dueDate))) {
    errors.push('Due date must be a valid date');
  }
  return errors;
};

module.exports = { validateRegister, validateLogin, validateTask, STATUSES, PRIORITIES };
