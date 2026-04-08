INSERT INTO rooms (id, type, name, description)
VALUES
  ('general', 'group', 'General', 'Default room for all members'),
  ('frontend', 'group', 'Frontend', 'UI and client-side discussion'),
  ('backend', 'group', 'Backend', 'API and server-side discussion'),
  ('dm-u1-u2', 'private', 'William & Amy', 'Private chat between William and Amy'),
  ('dm-u1-u3', 'private', 'William & Kevin', 'Private chat between William and Kevin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO room_members (room_id, user_id, role)
VALUES
  ('general', 'u1', 'member'),
  ('general', 'u2', 'member'),
  ('general', 'u3', 'member'),
  ('frontend', 'u2', 'member'),
  ('backend', 'u1', 'member'),
  ('dm-u1-u2', 'u1', 'member'),
  ('dm-u1-u2', 'u2', 'member'),
  ('dm-u1-u3', 'u1', 'member'),
  ('dm-u1-u3', 'u3', 'member')
ON CONFLICT (room_id, user_id) DO NOTHING;

INSERT INTO messages (id, room_id, user_id, username, type, content)
VALUES
  ('1', 'general', 'u1', 'william', 'text', 'Hello LiHoChat'),
  ('2', 'general', 'u2', 'amy', 'text', 'Hi William, I can see your message.'),
  ('3', 'general', 'u3', 'kevin', 'text', 'This is the default room for everyone.'),
  ('4', 'frontend', 'u2', 'amy', 'text', 'I am working on the chat page layout.'),
  ('5', 'backend', 'u1', 'william', 'text', 'I am building the message API first.'),
  ('6', 'dm-u1-u2', 'u1', 'william', 'text', 'Amy, this private room is ready now.'),
  ('7', 'dm-u1-u2', 'u2', 'amy', 'text', 'Good. Next step is building the friend flow.'),
  ('8', 'dm-u1-u3', 'u3', 'kevin', 'text', 'This one will become the private chat example.')
ON CONFLICT (id) DO NOTHING;
