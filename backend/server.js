const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connexion MySQL
const db = mysql.createConnection({
  host: '109.176.199.97',
  user: 'lucas',
  password: 'lucas',
  database: 'FlexTrack'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données :', err);
  } else {
    console.log('✅ Connecté à la base de données MySQL !');
  }
});

// Route test
app.get('/', (req, res) => {
  res.send('API Backend opérationnelle');
});

// Route login
app.post('/login', (req, res) => {
  const { identifiant, motDePasse } = req.body;
  const sql = 'SELECT * FROM admin WHERE identifiant = ? AND mot_de_passe = ?';

  db.query(sql, [identifiant, motDePasse], (err, results) => {
    if (err) {
      return res.status(500).send('Erreur serveur');
    }

    if (results.length > 0) {
      res.status(200).send({ message: 'Connexion réussie' });
    } else {
      res.status(401).send({ message: 'Identifiant ou mot de passe incorrect' });
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${port}`);
});

// Récupérer tous les étudiants
app.get('/api/etudiants', (req, res) => {
  const sql = 'SELECT * FROM etudiant';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération des étudiants :', err);
      return res.status(500).send('Erreur serveur');
    }
    res.json(results);
  });
});



// Ajouter un étudiant
app.post('/api/etudiants', (req, res) => {
  const { numero_etudiant, nom, prenom, email, id_parcours } = req.body;
  const sql = 'INSERT INTO etudiant (numero_etudiant, nom, prenom, email, id_parcours) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [numero_etudiant, nom, prenom, email, id_parcours], (err, result) => {
    if (err) {
      console.error('❌ Erreur d\'insertion :', err);
      return res.status(500).send('Erreur serveur');
    }
    res.status(200).send('✅ Étudiant ajouté');
  });
});



// ✅ Modifier un étudiant
app.put('/api/etudiants/:id', (req, res) => {
  const id = req.params.id;
  const { nom, prenom, email, id_parcours } = req.body;
  const sql = 'UPDATE etudiant SET nom = ?, prenom = ?, email = ?, id_parcours = ? WHERE id = ?';
  db.query(sql, [nom, prenom, email, id_parcours, id], (err, result) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.status(200).send('Étudiant modifié');
  });
});

// 🗑️ Supprimer un étudiant
app.delete('/api/etudiants/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM etudiant WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Erreur suppression :', err);
      return res.status(500).json({ message: 'Erreur serveur', error: err });
    }

    // ⚠️ Vérifie si un étudiant a été supprimé
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Étudiant non trouvé" });
    }

    return res.status(200).json({ message: 'Étudiant supprimé' });
  });
});

app.post('/api/inscriptions', (req, res) => {
  const { id_etudiant, ue_code } = req.body;

  // 1. On récupère le semestre et les crédits de l'UE à inscrire
  db.query('SELECT semestre, credits FROM ue WHERE code = ?', [ue_code], (err, ueRes) => {
    if (err || ueRes.length === 0) return res.status(500).send('Erreur UE');
    const ueSemestre = ueRes[0].semestre;
    const ueCredits = ueRes[0].credits;

    // 2. Calcul des crédits déjà inscrits pour cet étudiant et ce semestre
    const totalCreditsSql = `
      SELECT IFNULL(SUM(ue.credits), 0) as total
      FROM inscription i
      JOIN ue ON i.ue_code = ue.code
      WHERE i.id_etudiant = ? AND i.id_semestre = ?
    `;

    db.query(totalCreditsSql, [id_etudiant, ueSemestre], (err2, creditsRes) => {
      if (err2) return res.status(500).send('Erreur calcul crédits');
      const totalCredits = creditsRes[0].total;
      const newTotal = Number(totalCredits) + Number(ueCredits);

      // 3. Limite de crédits
      if (newTotal > 39) {
        return res.status(400).send('❌ Inscription refusée : total de crédits > 39 pour ce semestre');
      }

      // 4. Vérification des prérequis (comme avant)
      const prereqSql = 'SELECT prerequis_code FROM prerequis WHERE ue_code = ?';
      db.query(prereqSql, [ue_code], (err3, prereqs) => {
        if (err3) return res.status(500).send('Erreur vérification des prérequis');
        if (prereqs.length === 0) {
          return faireInscription();
        }

        const prereqCodes = prereqs.map(p => `'${p.prerequis_code}'`).join(',');
        const checkSql = `
          SELECT ue_code FROM inscription
          WHERE id_etudiant = ? AND ue_code IN (${prereqCodes}) AND valide = 1
        `;
        db.query(checkSql, [id_etudiant], (err4, valides) => {
          if (err4) return res.status(500).send('Erreur validation prérequis');
          if (valides.length === prereqs.length) {
            return faireInscription();
          } else {
            return res.status(400).send("❌ Étudiant ne remplit pas les prérequis");
          }
        });
      });

      // 5. Fonction d'inscription réelle
      function faireInscription() {
        const sql = `INSERT INTO inscription (id_etudiant, ue_code, id_semestre, valide) VALUES (?, ?, ?, NULL)`;
        db.query(sql, [id_etudiant, ue_code, ueSemestre], (err5) => {
          if (err5) {
            console.error("Erreur SQL à l'insertion inscription:", err5); // <---- AJOUTE CE LOG
            return res.status(500).send("Erreur lors de l'inscription");
  }
          // Si newTotal > 30, on envoie un message d'alerte
          if (newTotal > 30) {
            return res.status(200).send('⚠️ Dérogation : crédits > 30 mais <= 39');
          }
          return res.status(200).send('✅ Étudiant inscrit avec succès');
        });
      }
    });
  });
});



function inscrireEtudiant(id_etudiant, ue_code, id_semestre, res) {
  const sql = `
  INSERT INTO inscription (id_etudiant, ue_code, id_semestre, valide)
  VALUES (?, ?, ?, NULL)
`;
  db.query(sql, [id_etudiant, ue_code, id_semestre], (err) => {
    if (err) return res.status(500).send("Erreur lors de l'inscription");
    return res.status(200).send("✅ Étudiant inscrit avec succès");
  });
}

app.get('/api/ues', (req, res) => {
  db.query('SELECT * FROM ue', (err, result) => {
    if (err) return res.status(500).send('Erreur récupération des UE');
    res.json(result);
  });
});


app.get('/api/etudiants/:id/inscriptions', (req, res) => {
  const id = req.params.id;
  db.query(
    'SELECT * FROM inscription WHERE id_etudiant = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).send('Erreur récupération des inscriptions');
      res.json(results);
    }
  );
});

app.get('/api/prerequis', (req, res) => {
  db.query('SELECT * FROM prerequis', (err, results) => {
    if (err) return res.status(500).send('Erreur récupération des prérequis');
    res.json(results);
  });
});


app.get('/api/ues-dispo/:id_etudiant', (req, res) => {
  const id = req.params.id_etudiant;
  const sql = `
    SELECT ue.*
    FROM ue
    WHERE ue.code NOT IN (
      SELECT ue_code FROM inscription WHERE id_etudiant = ?
    )
    AND (
      ue.code NOT IN (SELECT ue_code FROM prerequis)
      OR NOT EXISTS (
        SELECT 1 FROM prerequis p
        WHERE p.ue_code = ue.code
        AND p.prerequis_code NOT IN (
          SELECT ue_code FROM inscription
          WHERE id_etudiant = ? AND valide = 1
        )
      )
    )
  `;
  db.query(sql, [id, id], (err, result) => {
    if (err) return res.status(500).send('Erreur récupération UE dispo');
    res.json(result);
  });
});


// Récupérer le détail des UE d’un étudiant
app.get('/api/etudiants/:id/ue-details', (req, res) => {
  const id = req.params.id;

  // 1. UE validées
  const ueValideSql = `
    SELECT ue.* FROM ue
    JOIN inscription ON ue.code = inscription.ue_code
    WHERE inscription.id_etudiant = ? AND inscription.valide = 1
  `;

  // 2. UE en cours (inscrit mais pas validé)
  const ueEnCoursSql = `
    SELECT ue.* FROM ue
    JOIN inscription ON ue.code = inscription.ue_code
    WHERE inscription.id_etudiant = ? AND (inscription.valide = 0 OR inscription.valide IS NULL)
  `;

  // 3. UE pour lesquelles il a les prérequis (et PAS encore inscrites/validées)
  const uePrereqSql = `
    SELECT ue.* FROM ue
    WHERE ue.code NOT IN (SELECT ue_code FROM inscription WHERE id_etudiant = ?)
    AND (
      ue.code NOT IN (SELECT ue_code FROM prerequis)
      OR NOT EXISTS (
        SELECT 1 FROM prerequis p
        WHERE p.ue_code = ue.code
        AND p.prerequis_code NOT IN (
          SELECT ue_code FROM inscription WHERE id_etudiant = ? AND valide = 1
        )
      )
    )
  `;

  // On fait les 3 requêtes puis on assemble la réponse
  db.query(ueValideSql, [id], (err, uesValide) => {
    if (err) return res.status(500).send('Erreur UE validées');
    db.query(ueEnCoursSql, [id], (err2, uesCours) => {
      if (err2) return res.status(500).send('Erreur UE en cours');
      db.query(uePrereqSql, [id, id], (err3, uesDispo) => {
        if (err3) return res.status(500).send('Erreur UE dispo');
        res.json({
          validees: uesValide,
          enCours: uesCours,
          dispo: uesDispo
        });
      });
    });
  });
});


// Met à jour la validation d'une inscription (UE)
app.put('/api/inscriptions/:id', (req, res) => {
  const id = req.params.id;
  const { valide } = req.body; // 1 = validée, 0 = échouée
  db.query('UPDATE inscription SET valide = ? WHERE id = ?', [valide, id], (err, result) => {
    if (err) return res.status(500).send('Erreur update');
    res.status(200).send('Validation modifiée');
  });
});


// Vérifie si un semestre est validé pour un étudiant
app.get('/api/etudiants/:id/semestre/:semestreId/validation', (req, res) => {
  const id = req.params.id;
  const semestreId = req.params.semestreId;

  // 1. Somme des crédits validés sur ce semestre
  const sqlCredits = `
    SELECT SUM(ue.credits) AS total
    FROM inscription i
    JOIN ue ON i.ue_code = ue.code
    WHERE i.id_etudiant = ? AND i.id_semestre = ? AND i.valide = 1
  `;

  // 2. Vérifie toutes les UE obligatoires de ce semestre ont été validées
  const sqlOblig = `
    SELECT ue.code FROM ue
    WHERE ue.semestre = ? AND ue.obligatoire = 1
    AND ue.code NOT IN (
      SELECT ue_code FROM inscription
      WHERE id_etudiant = ? AND id_semestre = ? AND valide = 1
    )
  `;

  db.query(sqlCredits, [id, semestreId], (err, result) => {
    if (err) return res.status(500).send('Erreur crédits semestre');
    const credits = result[0].total || 0;
    db.query(sqlOblig, [semestreId, id, semestreId], (err2, result2) => {
      if (err2) return res.status(500).send('Erreur UE obligatoires');
      const obligNonValid = result2.map(row => row.code);
      const valide = credits >= 30 && obligNonValid.length === 0;
      res.json({
        valide,
        credits,
        ueObligNonValidees: obligNonValid // array des codes d’UE oblig non validées
      });
    });
  });
});

// Validation année (par exemple année 1 = semestres 1 et 2)
app.get('/api/etudiants/:id/annee/:anneeId/validation', (req, res) => {
  const id = req.params.id;
  const annee = parseInt(req.params.anneeId, 10);
  const semestreIds = annee === 1 ? [1, 2] : annee === 2 ? [3, 4] : [5, 6];

  // On vérifie la validation des 2 semestres
  const checkSemestre = (semestreId) =>
    new Promise((resolve, reject) => {
      const sqlCredits = `
        SELECT SUM(ue.credits) AS total
        FROM inscription i
        JOIN ue ON i.ue_code = ue.code
        WHERE i.id_etudiant = ? AND i.id_semestre = ? AND i.valide = 1
      `;
      const sqlOblig = `
        SELECT ue.code FROM ue
        WHERE ue.semestre = ? AND ue.obligatoire = 1
        AND ue.code NOT IN (
          SELECT ue_code FROM inscription
          WHERE id_etudiant = ? AND id_semestre = ? AND valide = 1
        )
      `;
      db.query(sqlCredits, [id, semestreId], (err, result) => {
        if (err) return reject(err);
        const credits = result[0].total || 0;
        db.query(sqlOblig, [semestreId, id, semestreId], (err2, result2) => {
          if (err2) return reject(err2);
          const obligNonValid = result2.map(row => row.code);
          const valide = credits >= 30 && obligNonValid.length === 0;
          resolve(valide);
        });
      });
    });

  Promise.all([checkSemestre(semestreIds[0]), checkSemestre(semestreIds[1])])
    .then(([s1, s2]) => {
      res.json({ valide: s1 && s2 });
    })
    .catch(() => res.status(500).send('Erreur validation année'));
});


app.get('/api/etudiants/:id/diplome/validation', (req, res) => {
  const id = req.params.id;

  // Vérifie que les 3 années sont validées
  const checkAnnee = (annee) =>
    new Promise((resolve, reject) => {
      const semestreIds = annee === 1 ? [1, 2] : annee === 2 ? [3, 4] : [5, 6];
      const checkSemestre = (semestreId) =>
        new Promise((resolve, reject) => {
          const sqlCredits = `
            SELECT SUM(ue.credits) AS total
            FROM inscription i
            JOIN ue ON i.ue_code = ue.code
            WHERE i.id_etudiant = ? AND i.id_semestre = ? AND i.valide = 1
          `;
          const sqlOblig = `
            SELECT ue.code FROM ue
            WHERE ue.semestre = ? AND ue.obligatoire = 1
            AND ue.code NOT IN (
              SELECT ue_code FROM inscription
              WHERE id_etudiant = ? AND id_semestre = ? AND valide = 1
            )
          `;
          db.query(sqlCredits, [id, semestreId], (err, result) => {
            if (err) return reject(err);
            const credits = result[0].total || 0;
            db.query(sqlOblig, [semestreId, id, semestreId], (err2, result2) => {
              if (err2) return reject(err2);
              const obligNonValid = result2.map(row => row.code);
              const valide = credits >= 30 && obligNonValid.length === 0;
              resolve(valide);
            });
          });
        });
      Promise.all([checkSemestre(semestreIds[0]), checkSemestre(semestreIds[1])])
        .then(([s1, s2]) => resolve(s1 && s2))
        .catch(() => reject());
    });

  Promise.all([checkAnnee(1), checkAnnee(2), checkAnnee(3)]).then(([a1, a2, a3]) => {
    // Vérification du total de crédits validés
    const sqlTotal = `
      SELECT SUM(ue.credits) AS total
      FROM inscription i
      JOIN ue ON i.ue_code = ue.code
      WHERE i.id_etudiant = ? AND i.valide = 1
    `;
    // Vérification que toutes les UE obligatoires (tous semestres) sont validées
    const sqlOblig = `
      SELECT ue.code FROM ue
      WHERE ue.obligatoire = 1
      AND ue.code NOT IN (
        SELECT ue_code FROM inscription
        WHERE id_etudiant = ? AND valide = 1
      )
    `;
    db.query(sqlTotal, [id], (err, result) => {
      if (err) return res.status(500).send('Erreur total crédits');
      const credits = result[0].total || 0;
      db.query(sqlOblig, [id], (err2, result2) => {
        if (err2) return res.status(500).send('Erreur UE obligatoires totales');
        const obligNonValid = result2.map(row => row.code);
        const valide = a1 && a2 && a3 && credits >= 180 && obligNonValid.length === 0;
        res.json({
          valide,
          credits,
          ueObligNonValidees: obligNonValid
        });
      });
    });
  }).catch(() => res.status(500).send('Erreur validation diplôme'));
});

// Valider une inscription
app.put('/api/inscriptions/:id/valider', (req, res) => {
  const id = req.params.id;
  db.query('UPDATE inscription SET valide = 1 WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send('Erreur validation');
    res.status(200).send({ message: 'UE validée' });
  });
});

// Échouer une inscription
app.put('/api/inscriptions/:id/echouer', (req, res) => {
  const id = req.params.id;
  db.query('UPDATE inscription SET valide = 0 WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send('Erreur échec');
    res.status(200).send({ message: 'UE échouée' });
  });
});


app.get('/api/statistiques/ue', (req, res) => {
  // Pour chaque UE, compter le nb d’inscrits et le nb de validés
  const sql = `
    SELECT ue.code, ue.nom, 
      COUNT(i.id_etudiant) as inscrits,
      SUM(CASE WHEN i.valide=1 THEN 1 ELSE 0 END) as valides
    FROM ue
    LEFT JOIN inscription i ON ue.code = i.ue_code
    GROUP BY ue.code, ue.nom
    ORDER BY ue.code
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send('Erreur stats UE');
    // Calculer le taux
    results.forEach(r => {
      r.taux = r.inscrits ? Math.round(100 * r.valides / r.inscrits) : 0;
    });
    res.json(results);
  });
});

app.get('/api/inscriptions', (req, res) => {
  db.query('SELECT * FROM inscription', (err, rows) => {
    if (err) return res.status(500).send('Erreur DB');
    res.json(rows);
  });
});
