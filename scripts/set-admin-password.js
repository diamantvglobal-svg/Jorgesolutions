#!/usr/bin/env node
/**
 * Crea o cambia la contraseña del panel de administración (/admin).
 *
 * El panel tiene un único administrador posible: el usuario "jorge".
 * No existe forma de crear otras cuentas de administrador desde el sitio.
 *
 * NOTA: normalmente NO hace falta usar este script. La primera vez que se
 * entra a /admin sin contraseña configurada, el propio sitio muestra un
 * formulario de bienvenida en el navegador para elegirla, y luego se puede
 * cambiar desde "Mi cuenta" dentro del panel. Este script sigue existiendo
 * como respaldo — sobre todo para restablecer la contraseña por terminal si
 * se olvida y no se puede iniciar sesión.
 *
 * Uso recomendado:
 *   node scripts/set-admin-password.js
 *   (te pedirá la contraseña; se escribe en pantalla, no la compartas)
 *
 * Uso rápido:
 *   node scripts/set-admin-password.js tu-contraseña
 */
const readline = require('readline');
const auth = require('../lib/auth');
const store = require('../lib/store');

const ADMIN_USERNAME = 'jorge';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

(async () => {
  console.log('=== Soluciones Jorge · configurar la contraseña de "jorge" (único administrador) ===\n');

  let [, , argPass] = process.argv;
  let password = argPass;

  if (!password) {
    password = await ask('Nueva contraseña para el usuario "jorge" (mínimo 6 caracteres): ');
  }

  if (!password || password.length < 6) {
    console.log('\n❌ La contraseña debe tener al menos 6 caracteres. Vuelve a ejecutar el script.');
    process.exit(1);
  }

  const { salt, hash } = auth.hashPassword(password);
  store.saveAdmin({ username: ADMIN_USERNAME, salt, hash, updatedAt: new Date().toISOString() });

  console.log(`\n✅ Listo. El usuario "${ADMIN_USERNAME}" ya puede iniciar sesión en /admin con esa contraseña.`);
  console.log('   Recomendación: no compartas esta contraseña ni la escribas en documentos públicos.');
})();
