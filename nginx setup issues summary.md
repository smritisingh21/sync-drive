# EC2 & Nginx Deployment Issues Summary

A concise summary of issues encountered during the AWS EC2 deployment and Nginx reverse proxy setup, along with their solutions.

---

### 1. Missing `mongoose` in `package.json`
* **Problem**: PM2 startup failed with `ERR_MODULE_NOT_FOUND: Cannot find package 'mongoose'`. The package was used in code but wasn't tracked in `package.json`.
* **Solution**:
  ```bash
  npm install mongoose
  pm2 restart sync-drive-backend
  ```

---

### 2. macOS vs. Linux Case Sensitivity
* **Problem**: `ERR_MODULE_NOT_FOUND: Cannot find module '.../models/userModel.js'`.
  * macOS filesystem is case-insensitive, so it ran locally.
  * Ubuntu on EC2 is case-sensitive: the file was named `UserModel.js` (capital `U`), but imported as `userModel.js`.
* **Solution**:
  ```bash
  mv /home/ubuntu/app/backend/models/UserModel.js /home/ubuntu/app/backend/models/userModel.js
  pm2 restart sync-drive-backend
  ```

---

### 3. Corrupted / Mismatched Dependency (`math-intrinsics`)
* **Problem**: Node crashed with `Cannot find module '.../math-intrinsics/round.js'` due to a corrupted transitive dependency tree from successive partial installs.
* **Solution**: Purged `node_modules` and lockfile for a fresh, clean install:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm install mongoose
  pm2 restart sync-drive-backend
  ```

---

### 4. Default "Welcome to nginx!" Landing Page Overriding Backend
* **Problem**: Browsing to `http://<EC2-IP>` returned the default Nginx welcome page because Nginx's default site configuration took priority over port 4000.
* **Solution**: Removed the default configuration link:
  ```bash
  sudo rm -f /etc/nginx/sites-enabled/default
  ```

---

### 5. Broken Nginx Symlink (`No such file or directory`)
* **Problem**: `sudo nginx -t` failed with:
  `open() "/etc/nginx/sites-enabled/storage-app" failed (2: No such file or directory)`
  The symlink was created before the config file in `sites-available` was created.
* **Solution**: Created the config file with `sudo tee`, linked it, validated syntax, and restarted Nginx:
  ```bash
  sudo tee /etc/nginx/sites-available/storage-app > /dev/null << 'EOF'
  server {
      listen 80;
      server_name 16.178.195.181;

      client_max_body_size 100M;

      location / {
          proxy_pass http://localhost:4000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  EOF

  sudo ln -sf /etc/nginx/sites-available/storage-app /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  ```
