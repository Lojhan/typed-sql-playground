SELECT json_object(
  'id', id, 'email', email, 'status', status,
  'labels', json_array('playground', 'rc')
) AS account
FROM account WHERE id = ?
