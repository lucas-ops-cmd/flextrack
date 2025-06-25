# FlexTrack

Projet fullstack avec un backend Node.js et un frontend Angular.

---

## 📁 Structure du projet

```
flextrack/
├── backend/              → Serveur Node.js
├── frontend-flextrack/   → Application Angular
```

---

## ✅ Prérequis

- Node.js installé (v16 ou plus recommandé)
- Angular CLI installé globalement :
  ```
  npm install -g @angular/cli
  ```

---

## ▶️ Lancer le projet

Ouvrir **deux terminaux**.

---

### 1. Terminal 1 : Lancer le backend

```bash
cd backend
npm install     # Installer les dépendances (à faire une seule fois)
node server.js
```

---

### 2. Terminal 2 : Lancer le frontend Angular

```bash
cd frontend-flextrack
npm install     # Installer les dépendances (à faire une seule fois)
ng serve
```

---

### 💻 Accès au site

Ouvrir le navigateur à l'adresse :
[http://localhost:4200](http://localhost:4200)

---

## ℹ️ Remarques

- Le backend doit être lancé avant le frontend.
- Assurez-vous que les ports `3000` (backend) et `4200` (frontend) ne sont pas bloqués par un pare-feu.
- Si vous avez une erreur au lancement, essayez d'exécuter `npm install` dans les deux dossiers.

---

## 👨‍💻 Auteur

Lucas
