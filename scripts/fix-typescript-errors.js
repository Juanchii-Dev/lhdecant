#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores de TypeScript en routes.ts...');

const routesPath = path.join(__dirname, '../server/routes.ts');
let content = fs.readFileSync(routesPath, 'utf8');

// Corregir errores de tipo 'unknown'
content = content.replace(
  /if \(error\.type === 'StripeCardError'\)/g,
  'if ((error as any).type === \'StripeCardError\')'
);

content = content.replace(
  /} else if \(error\.type === 'StripeInvalidRequestError'\)/g,
  '} else if ((error as any).type === \'StripeInvalidRequestError\')'
);

content = content.replace(
  /} else if \(error\.type === 'StripeAPIError'\)/g,
  '} else if ((error as any).type === \'StripeAPIError\')'
);

content = content.replace(
  /return res\.status\(400\)\.send\(`Webhook Error: \${err\.message}`\);/g,
  'return res.status(400).send(`Webhook Error: ${(err as any).message}`);'
);

// Corregir errores de null checks
content = content.replace(
  /const sessionId = session\.metadata\.sessionId;/g,
  'const sessionId = session.metadata?.sessionId;'
);

content = content.replace(
  /payment_intent: session\.payment_intent,/g,
  'payment_intent: session.payment_intent as string,'
);

content = content.replace(
  /amount_total: session\.amount_total \/ 100,/g,
  'amount_total: (session.amount_total || 0) / 100,'
);

content = content.replace(
  /shipping_address: session\.shipping_address,/g,
  'shipping_address: (session as any).shipping_address,'
);

content = content.replace(
  /billing_address: session\.billing_address,/g,
  'billing_address: (session as any).billing_address,'
);

content = content.replace(
  /\${session\.currency\.toUpperCase\(\)}/g,
  '${(session.currency || \'USD\').toUpperCase()}'
);

content = content.replace(
  /to: session\.customer_email,/g,
  'to: session.customer_email || \'customer@example.com\','
);

content = content.replace(
  /<p>\${session\.shipping_address\?\.line1 \|\| ''}<br>/g,
  '<p>${(session as any).shipping_address?.line1 || \'\'}<br>'
);

content = content.replace(
  /\${session\.shipping_address\?\.city \|\| ''}, \${session\.shipping_address\?\.state \|\| ''}<br>/g,
  '${(session as any).shipping_address?.city || \'\'}, ${(session as any).shipping_address?.state || \'\'}<br>'
);

content = content.replace(
  /\${session\.shipping_address\?\.postal_code \|\| ''}, \${session\.shipping_address\?\.country \|\| ''}<\/p>/g,
  '${(session as any).shipping_address?.postal_code || \'\'}, ${(session as any).shipping_address?.country || \'\'}</p>'
);

content = content.replace(
  /amount: session\.amount_total \/ 100,/g,
  'amount: (session.amount_total || 0) / 100,'
);

// Corregir errores de undefined checks
content = content.replace(
  /console\.log\(`✅ Eliminado: \${perfumeData\.name} - \${perfumeData\.brand}`\);/g,
  'console.log(`✅ Eliminado: ${perfumeData?.name || \'Unknown\'} - ${perfumeData?.brand || \'Unknown\'}`);'
);

content = content.replace(
  /name: perfumeData\.name,/g,
  'name: perfumeData?.name || \'Unknown\','
);

content = content.replace(
  /brand: perfumeData\.brand/g,
  'brand: perfumeData?.brand || \'Unknown\''
);

// Corregir errores de sessionId undefined
content = content.replace(
  /const items = await storage\.getCartItems\(sessionId\);/g,
  'const items = await storage.getCartItems(sessionId || \'\');'
);

content = content.replace(
  /await storage\.clearCart\(sessionId\);/g,
  'await storage.clearCart(sessionId || \'\');'
);

fs.writeFileSync(routesPath, content);
console.log('✅ Errores de TypeScript corregidos en routes.ts'); 