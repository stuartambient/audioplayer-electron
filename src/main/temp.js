CREATE TABLE your_table_name (
    id INTEGER PRIMARY KEY,
    name TEXT
);

CREATE TABLE images (
    id INTEGER PRIMARY KEY,
    your_table_id INTEGER,
    image BLOB,
    FOREIGN KEY (your_table_id) REFERENCES your_table_name(id)
);