import { randomUUID } from 'node:crypto';

const users = [];
const projects = [];

function createId() {
  return randomUUID();
}

const userRepository = {
  findByEmail(email) {
    return users.find((user) => user.email === email.toLowerCase());
  },
  findById(id) {
    return users.find((user) => user.id === id);
  },
  create(user) {
    const record = { id: createId(), createdAt: new Date().toISOString(), ...user };
    users.push(record);
    return record;
  }
};

const projectRepository = {
  findAllByUserId(userId) {
    return projects.filter((project) => project.userId === userId);
  },
  findByIdAndUserId(id, userId) {
    return projects.find((project) => project.id === id && project.userId === userId);
  },
  create(project) {
    const record = { id: createId(), createdAt: new Date().toISOString(), ...project };
    projects.push(record);
    return record;
  },
  update(record, values) {
    Object.assign(record, values, { updatedAt: new Date().toISOString() });
    return record;
  },
  delete(record) {
    const index = projects.indexOf(record);
    if (index !== -1) projects.splice(index, 1);
  }
};

export { userRepository, projectRepository };
