// Shared helper functions for database operations

async function getOrCreateAuthor(conn, authorName) {
  // conn = await db.getConnection
  // Check if author already exists
  const [rows] = await conn.query(
    'SELECT Authors_id FROM Authors WHERE Name = ?',
    [authorName]
  );
  // if rows found, return the id
  if (rows.length > 0) {
    return rows[0].Authors_id;
  }

  // If not, generate new id
  // 1. Ask DB: what's the biggest Authors_id number so far?
  const [maxRows] = await conn.query( 
    'SELECT MAX(CAST(SUBSTRING(Authors_id, 3) AS UNSIGNED)) AS maxNum FROM Authors'
  );
  // 2. Take that max number, or 0 if table is empty, then add 1
  const nextNum = (maxRows[0].maxNum || 0) + 1;
  // 3. Build new ID
  const newId = 'AT' + String(nextNum).padStart(3, '0'); // if nextNum = 1 || padStart(3, '0') = "001"

  await conn.query(
    'INSERT INTO Authors (Authors_id, Name) VALUES (?, ?)',  
    [newId, authorName]
  );
  return newId;
}

async function getOrCreatePublisher(conn, publisherName) {
  // Same as author function but for publishers
  const [rows] = await conn.query(
    'SELECT Publishers_id FROM Publishers WHERE Name = ?',
    [publisherName]
  );
  if (rows.length > 0) {
    return rows[0].Publishers_id;
  }

  const [maxRows] = await conn.query(
    "SELECT MAX(CAST(SUBSTRING(Publishers_id, 2) AS UNSIGNED)) AS maxNum FROM Publishers"
  );
  const nextNum = (maxRows[0].maxNum || 0) + 1;
  const newId = 'P' + String(nextNum).padStart(3, '0');

  await conn.query(
    'INSERT INTO Publishers (Publishers_id, Name) VALUES (?, ?)',
    [newId, publisherName]
  );
  return newId;
}

module.exports = {
  getOrCreateAuthor,
  getOrCreatePublisher
};