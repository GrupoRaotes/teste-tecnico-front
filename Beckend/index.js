const express = require('express');
const cors = require('cors');
const pool = require('./src/db'); 

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const capitalizarDescricao = (descricao) => {
  return descricao
    .split(' ')
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
};


app.get('/api/medidas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medidas WHERE status = true');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar medidas:', error);
    res.status(500).json({ error: 'Erro ao buscar medidas' });
  }
});


app.post('/api/medidas', async (req, res) => {
  const { descricao, sigla, codigo_erp, status } = req.body;

  try {

    if (!sigla || sigla.length < 1 || sigla.length > 3) {
      return res.status(400).json({ error: 'Sigla é obrigatória e deve ter até 3 caracteres!' });
    }
    const siglaExistente = await pool.query(
      'SELECT * FROM medidas WHERE sigla = $1',
      [sigla]
    );
    if (siglaExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Sigla já existente!' });
    }


    if (codigo_erp && !/^[A-Z0-9]{0,5}$/.test(codigo_erp)) {
      return res.status(400).json({ error: 'Código ERP deve ter até 5 caracteres alfanuméricos maiúsculos!' });
    }
    if (codigo_erp) {
      const codigoErpExistente = await pool.query(
        'SELECT * FROM medidas WHERE codigo_erp = $1',
        [codigo_erp]
      );
      if (codigoErpExistente.rows.length > 0) {
        return res.status(400).json({ error: 'Código ERP já existe!' });
      }
    }

 
    const descricaoCapitalizada = capitalizarDescricao(descricao);


    const result = await pool.query(
      'INSERT INTO medidas (descricao, sigla, codigo_erp, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [descricaoCapitalizada, sigla, codigo_erp, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar medida:', error);
    res.status(500).json({ error: 'Erro ao adicionar medida' });
  }
});


app.put('/api/medidas/:id', async (req, res) => {
  const medidaId = parseInt(req.params.id);
  const { descricao, sigla, codigo_erp, status } = req.body;

  try {
   
    const medidaExistente = await pool.query(
      'SELECT * FROM medidas WHERE id = $1',
      [medidaId]
    );
    if (medidaExistente.rows.length === 0) {
      return res.status(404).json({ error: 'Medida não encontrada!' });
    }

  
    if (!sigla || sigla.length < 1 || sigla.length > 3) {
      return res.status(400).json({ error: 'Sigla é obrigatória e deve ter até 3 caracteres!' });
    }
    const siglaExistente = await pool.query(
      'SELECT * FROM medidas WHERE sigla = $1 AND id != $2',
      [sigla, medidaId]
    );
    if (siglaExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Sigla já existente!' });
    }


    if (codigo_erp && !/^[A-Z0-9]{0,5}$/.test(codigo_erp)) {
      return res.status(400).json({ error: 'Código ERP deve ter até 5 caracteres alfanuméricos maiúsculos!' });
    }
    if (codigo_erp) {
      const codigoErpExistente = await pool.query(
        'SELECT * FROM medidas WHERE codigo_erp = $1 AND id != $2',
        [codigo_erp, medidaId]
      );
      if (codigoErpExistente.rows.length > 0) {
        return res.status(400).json({ error: 'Código ERP já existe!' });
      }
    }


    const descricaoCapitalizada = capitalizarDescricao(descricao);


    const result = await pool.query(
      'UPDATE medidas SET descricao = $1, sigla = $2, codigo_erp = $3, status = $4 WHERE id = $5 RETURNING *',
      [descricaoCapitalizada, sigla, codigo_erp, status, medidaId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar medida:', error);
    res.status(500).json({ error: 'Erro ao atualizar medida' });
  }
});


app.delete('/api/medidas/:id', async (req, res) => {
  const medidaId = parseInt(req.params.id);

  try {

    const medidaExistente = await pool.query(
      'SELECT * FROM medidas WHERE id = $1',
      [medidaId]
    );
    if (medidaExistente.rows.length === 0) {
      return res.status(404).json({ error: 'Medida não encontrada!' });
    }


    await pool.query('DELETE FROM medidas WHERE id = $1', [medidaId]);

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir medida:', error);
    res.status(500).json({ error: 'Erro ao excluir medida' });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});