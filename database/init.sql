CREATE TABLE IF NOT EXISTS operation_records (
  id SERIAL PRIMARY KEY,
  module_name VARCHAR(120) NOT NULL,
  owner_name VARCHAR(80) NOT NULL,
  status VARCHAR(40) NOT NULL,
  metric VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO operation_records (module_name, owner_name, status, metric)
VALUES ('多门店SKU统一管理', '运营组', 'ready', '100%');

CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  code VARCHAR(40) NOT NULL UNIQUE,
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  code VARCHAR(40) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  barcode VARCHAR(80),
  spec VARCHAR(120),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_inventory (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  stock INTEGER NOT NULL DEFAULT 0,
  safe_stock INTEGER NOT NULL DEFAULT 10,
  last_sale_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, product_id)
);

CREATE TYPE suggestion_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

CREATE TABLE IF NOT EXISTS slow_moving_products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  stock INTEGER NOT NULL,
  slow_days INTEGER NOT NULL,
  last_sale_at TIMESTAMP,
  suggestion_status suggestion_status NOT NULL DEFAULT 'PENDING',
  suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(store_id, product_id)
);

CREATE TABLE IF NOT EXISTS operation_tasks (
  id SERIAL PRIMARY KEY,
  slow_moving_product_id INTEGER NOT NULL UNIQUE REFERENCES slow_moving_products(id),
  task_name VARCHAR(255) NOT NULL,
  task_type VARCHAR(80) NOT NULL,
  priority VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  assignee VARCHAR(80) NOT NULL,
  store_name VARCHAR(120) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stores (name, code, address) VALUES
('朝阳门店', 'ST001', '北京市朝阳区建国路88号'),
('海淀店', 'ST002', '北京市海淀区中关村大街1号'),
('西城店', 'ST003', '北京市西城区西单北大街100号'),
('东城店', 'ST004', '北京市东城区王府井大街50号');

INSERT INTO categories (name, code) VALUES
('食品饮料', 'CAT001'),
('日用百货', 'CAT002'),
('家居用品', 'CAT003'),
('个人护理', 'CAT004'),
('休闲零食', 'CAT005');

INSERT INTO products (sku, name, barcode, spec, category_id) VALUES
('SKU001', '进口橄榄油500ml', '6901234567890', '500ml/瓶', 1),
('SKU002', '有机大米5kg', '6901234567891', '5kg/袋', 1),
('SKU003', '洗衣液2kg', '6901234567892', '2kg/瓶', 2),
('SKU004', '抽纸3层120抽', '6901234567893', '24包/箱', 2),
('SKU005', '不粘锅炒锅', '6901234567894', '32cm', 3),
('SKU006', '保温杯500ml', '6901234567895', '500ml', 3),
('SKU007', '洗发水750ml', '6901234567896', '750ml/瓶', 4),
('SKU008', '牙膏120g', '6901234567897', '120g/支', 4),
('SKU009', '坚果礼盒1kg', '6901234567898', '1kg/盒', 5),
('SKU010', '巧克力礼盒', '6901234567899', '200g/盒', 5),
('SKU011', '红酒750ml', '6901234567900', '750ml/瓶', 1),
('SKU012', '蜂蜜500g', '6901234567901', '500g/瓶', 1);
