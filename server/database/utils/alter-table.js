function alterColumnTable(db, query, newColumn, table) {
  const columns = db.prepare(query).all();
  const hasKey = columns.some((col) => col.name === newColumn);

  if (!hasKey) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${newColumn} TEXT;`);
  }
}

module.exports = {
  alterColumnTable,
};
