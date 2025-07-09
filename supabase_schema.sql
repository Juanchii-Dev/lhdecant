-- Script SQL para crear la base de datos LH Decants en Supabase
-- Este script crea todas las tablas necesarias para el sistema de perfumes

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (administradores)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de perfumes
CREATE TABLE perfumes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT NOT NULL,
  sizes TEXT[] NOT NULL, -- Array de tamaños: ["5ml", "10ml", "15ml"]
  prices TEXT[] NOT NULL, -- Array de precios: ["15.00", "25.00", "35.00"]
  category TEXT NOT NULL, -- "masculine", "feminine", "unisex", "niche"
  notes TEXT[] NOT NULL, -- Array de notas olfativas
  image_url TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  in_stock BOOLEAN DEFAULT true,
  show_on_homepage BOOLEAN DEFAULT false,
  is_on_offer BOOLEAN DEFAULT false,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  offer_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de colecciones
CREATE TABLE collections (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  theme TEXT NOT NULL, -- "summer", "winter", "date_night", "office", "weekend"
  sizes TEXT[] NOT NULL DEFAULT '{2ml,4ml,6ml}', -- Tamaños de colección
  prices TEXT[] NOT NULL DEFAULT '{10,20,30}', -- Precios correspondientes
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT NOT NULL,
  perfume_ids INTEGER[] NOT NULL, -- Array de IDs de perfumes
  perfume_sizes TEXT[] NOT NULL, -- Tamaños correspondientes para cada perfume
  is_new BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de configuración del sistema
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de mensajes de contacto
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de items del carrito de compras
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  perfume_id INTEGER NOT NULL REFERENCES perfumes(id),
  size TEXT NOT NULL, -- "5ml" o "10ml"
  quantity INTEGER DEFAULT 1 NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de órdenes
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- pending, confirmed, shipped, delivered
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tabla de items de órdenes
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  perfume_id INTEGER NOT NULL REFERENCES perfumes(id),
  perfume_name TEXT NOT NULL,
  perfume_brand TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL
);

-- Tabla de sesiones para express-session (opcional si usas sesiones)
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;

-- Índices para optimizar consultas
CREATE INDEX idx_perfumes_category ON perfumes(category);
CREATE INDEX idx_perfumes_show_on_homepage ON perfumes(show_on_homepage);
CREATE INDEX idx_perfumes_in_stock ON perfumes(in_stock);
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_settings_key ON settings(key);

-- Configuración inicial del sistema
INSERT INTO settings (key, value) VALUES 
('collections_enabled', 'true'),
('site_name', 'LH Decants'),
('contact_email', 'info@lhdecants.com'),
('shipping_info', 'Envío gratuito en pedidos superiores a $50'),
('about_text', 'Especialistas en decants de perfumes originales de las mejores marcas del mundo.');

-- Crear usuario administrador por defecto (password: admin123)
-- Nota: La contraseña debe ser hasheada en producción
INSERT INTO users (username, password) VALUES 
('admin', '$2b$10$rOFVVVrFzKnMF9YGzpVqVeK3OmYLmXwXjGGGGGGGGGGGGGGGGGGGG');

-- Función para actualizar el timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en settings
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de RLS (Row Level Security) para Supabase
-- Deshabilitamos RLS para simplificar el uso inicial, pero puedes habilitarlo según necesites

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Ejemplo de política para lectura pública de perfumes
-- CREATE POLICY "Allow public read access to perfumes" ON perfumes FOR SELECT USING (true);

-- Comentarios sobre el esquema
COMMENT ON TABLE perfumes IS 'Catálogo de perfumes con información detallada y precios por tamaño';
COMMENT ON TABLE collections IS 'Colecciones temáticas de perfumes con precios especiales';
COMMENT ON TABLE cart_items IS 'Items del carrito de compras basado en sesiones';
COMMENT ON TABLE orders IS 'Órdenes de compra de los clientes';
COMMENT ON TABLE settings IS 'Configuración general del sistema';
COMMENT ON TABLE contact_messages IS 'Mensajes de contacto de los usuarios';

-- Fin del script