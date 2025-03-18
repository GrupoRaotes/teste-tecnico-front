CREATE DATABASE CadastroMedidas;

CREATE TABLE medidas (
  id SERIAL PRIMARY KEY,
  codigo_erp VARCHAR(5) CHECK (codigo_erp ~ '^[A-Z0-9]{0,5}$'), 
  sigla VARCHAR(3) NOT NULL UNIQUE, 
  descricao VARCHAR(100) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE
);

\c CadastroMedidas;

INSERT INTO medidas (descricao, sigla, codigo_erp, status) VALUES
  ('Kilos', 'KG', 'A123', TRUE),
  ('Litros', 'LTS', 'B456', TRUE),
  ('Peça', 'PC', NULL, FALSE);

INSERT INTO medidas (descricao, sigla, codigo_erp, status) VALUES
	('Metros Cubico', 'M³', 'A222', TRUE);
	

select * from medidas;