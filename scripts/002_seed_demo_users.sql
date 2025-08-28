-- Seed demo users for testing the authentication system
-- Password for all users: password123 (in production, use proper hashing)

INSERT INTO users (id, email, name, role) VALUES 
  ('admin-001', 'admin@university.edu', 'System Administrator', 'ADMIN'),
  ('college-001', 'college@university.edu', 'College Manager', 'COLLEGE'),
  ('dept-001', 'cs.dept@university.edu', 'CS Department Head', 'DEPARTMENT'),
  ('teacher-001', 'john.doe@university.edu', 'Dr. John Doe', 'TEACHER'),
  ('teacher-002', 'jane.smith@university.edu', 'Prof. Jane Smith', 'TEACHER'),
  ('assistant-001', 'ta.mike@university.edu', 'Mike Johnson', 'ASSISTANT')
ON CONFLICT (id) DO NOTHING;

-- Create a sample college
INSERT INTO colleges (id, name, code, description, user_id) VALUES 
  ('college-001', 'College of Engineering', 'COE', 'Main engineering college', 'college-001')
ON CONFLICT (id) DO NOTHING;

-- Create a sample department
INSERT INTO departments (id, name, code, description, college_id, user_id) VALUES 
  ('dept-001', 'Computer Science', 'CS', 'Computer Science Department', 'college-001', 'dept-001')
ON CONFLICT (id) DO NOTHING;
