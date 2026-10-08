CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  license_key VARCHAR(128) NOT NULL UNIQUE,
  license_type VARCHAR(20) NOT NULL CHECK (license_type IN ('monthly', 'quarterly', 'yearly')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'expired', 'revoked')),
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
  activation_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_activations INT NOT NULL DEFAULT 1,
  activation_count INT NOT NULL DEFAULT 0,
  activated_device_hash VARCHAR(128),
  notes TEXT,
  signature TEXT NOT NULL,
  public_key_id VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE devices (
  id UUID PRIMARY KEY,
  license_id UUID REFERENCES licenses(id),
  device_hash VARCHAR(128) NOT NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'bound'
);

CREATE TABLE activations (
  id UUID PRIMARY KEY,
  license_id UUID REFERENCES licenses(id),
  device_hash VARCHAR(128) NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_ip VARCHAR(64),
  status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID,
  action VARCHAR(64) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_licenses_customer_id ON licenses(customer_id);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);
CREATE INDEX idx_devices_license_id ON devices(license_id);
CREATE INDEX idx_activations_license_id ON activations(license_id);
