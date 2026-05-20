const pool = require('../models/db');

// Criar receita
exports.criar = async (req, res) => {
  const { nome, descricao, link, categorias } = req.body;
  const aluno_id = req.user.id;

  try {
    const novaReceita = await pool.query(
      'INSERT INTO receitas (nome, descricao, link, aluno_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [nome, descricao, link, aluno_id]
    );

    const receitaId = novaReceita.rows[0].id;

    if (categorias && categorias.length > 0) {
      for (const categoria_id of categorias) {
        await pool.query(
          'INSERT INTO receita_categorias (receita_id, categoria_id) VALUES ($1, $2)',
          [receitaId, categoria_id]
        );
      }
    }

    res.json({ mensagem: 'Receita criada e categorizada com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar receitas
exports.listar = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM receitas');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Editar receita
exports.editar = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, link } = req.body;
  const aluno_id = req.user.id;
  const isAdmin = req.user.isAdmin;

  try {
    let result;

    if (isAdmin) {
      result = await pool.query(
        `UPDATE receitas 
         SET nome = $1, descricao = $2, link = $3 
         WHERE id = $4`,
        [nome, descricao, link, id]
      );
    } else {
      result = await pool.query(
        `UPDATE receitas 
         SET nome = $1, descricao = $2, link = $3 
         WHERE id = $4 AND aluno_id = $5`,
        [nome, descricao, link, id, aluno_id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(403).json({ erro: 'Você não pode editar essa receita' });
    }

    res.json({ mensagem: 'Receita atualizada com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Deletar receita
exports.deletar = async (req, res) => {
  const { id } = req.params;
  const aluno_id = req.user.id;
  const isAdmin = req.user.isAdmin;

  try {
    let result;

    if (isAdmin) {
      result = await pool.query(
        'DELETE FROM receitas WHERE id = $1',
        [id]
      );
    } else {
      result = await pool.query(
        'DELETE FROM receitas WHERE id = $1 AND aluno_id = $2',
        [id, aluno_id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(403).json({ erro: 'Você não pode deletar essa receita' });
    }

    res.json({ mensagem: 'Receita deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Criar categoria (admin)
exports.criarCategoria = async (req, res) => {
  const { nome } = req.body;

  try {
    await pool.query(
      'INSERT INTO categorias (nome) VALUES ($1)',
      [nome]
    );

    res.json({ mensagem: 'Categoria criada' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Vincular categoria
exports.vincularCategoria = async (req, res) => {
  const { receita_id, categoria_id } = req.body;

  try {
    await pool.query(
      'INSERT INTO receita_categorias (receita_id, categoria_id) VALUES ($1, $2)',
      [receita_id, categoria_id]
    );
    res.json({ mensagem: 'Categoria vinculada com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar receitas
exports.listarComCategorias = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.nome,
        r.descricao,
        r.link,
        COALESCE(json_agg(c.nome) FILTER (WHERE c.nome IS NOT NULL), '[]') AS categorias
      FROM receitas r
      LEFT JOIN receita_categoria rc ON r.id = rc.receita_id
      LEFT JOIN categorias c ON rc.categoria_id = c.id
      GROUP BY r.id
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar categorias
exports.listarCategorias = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Editar categoria (admin)
exports.editarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;

  try {
    await pool.query(
      'UPDATE categorias SET nome = $1 WHERE id = $2',
      [nome, id]
    );

    res.json({ mensagem: 'Categoria atualizada' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Deletar categoria (admin)
exports.deletarCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM categorias WHERE id = $1',
      [id]
    );

    res.json({ mensagem: 'Categoria deletada' });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};

// Listar receitas por categria
exports.listarPorCategoria = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT r.* FROM receitas r
      JOIN receita_categorias rc ON r.id = rc.receita_id
      WHERE rc.categoria_id = $1
    `;
    const result = await pool.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao filtrar por categoria:", error);
    res.status(500).json({ erro: error.message });
  }
};

// Relatorio
exports.relatorioProporcao = async (req, res) => {
  try {
    const query = `
      SELECT c.nome as categoria, COUNT(rc.receita_id) as total
      FROM categorias c
      LEFT JOIN receita_categorias rc ON c.id = rc.categoria_id
      GROUP BY c.nome;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};


exports.relatorioProporcao = async (req, res) => {
  try {
    const query = `
      SELECT c.nome as categoria, COUNT(rc.receita_id) as total
      FROM categorias c
      LEFT JOIN receita_categorias rc ON c.id = rc.categoria_id
      GROUP BY c.nome;
    `;
    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json([]);
  }
};

exports.listarPortfolio = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.nome, 
        r.descricao, 
        r.link, 
        a.nome as autor,
        STRING_AGG(c.nome, ', ') as categorias
      FROM receitas r
      JOIN alunos a ON r.aluno_id = a.id
      LEFT JOIN receita_categorias rc ON r.id = rc.receita_id
      LEFT JOIN categorias c ON rc.categoria_id = c.id
      GROUP BY r.id, a.nome;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};