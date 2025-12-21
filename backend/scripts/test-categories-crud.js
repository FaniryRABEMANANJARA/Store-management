#!/usr/bin/env node
/**
 * Script pour tester les opérations CRUD sur les catégories en production
 * Usage: node scripts/test-categories-crud.js <API_URL>
 * Exemple: node scripts/test-categories-crud.js https://store-management-backend-rho.vercel.app
 */

const https = require('https')
const http = require('http')

const API_URL = process.argv[2] || 'https://store-management-backend-rho.vercel.app'

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
    reset: '\x1b[0m'
  }
  console.log(`${colors[type]}${message}${colors.reset}`)
}

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (data) {
      const postData = JSON.stringify(data)
      options.headers['Content-Length'] = Buffer.byteLength(postData)
    }

    const req = client.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          })
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function testCRUD() {
  log('\n🧪 Test des opérations CRUD sur les catégories\n', 'info')
  log(`📍 API URL: ${API_URL}\n`, 'info')

  let createdCategoryId = null

  try {
    // 1. CREATE - Créer une catégorie
    log('1️⃣  Test CREATE (POST /api/categories)', 'info')
    const createData = {
      name: `Test Category ${Date.now()}`,
      description: 'Catégorie de test pour vérifier le CRUD'
    }
    
    const createResponse = await makeRequest(`${API_URL}/api/categories`, 'POST', createData)
    
    if (createResponse.status === 201) {
      log(`   ✅ Catégorie créée avec succès`, 'success')
      log(`   ID: ${createResponse.data.id}`, 'info')
      log(`   Nom: ${createResponse.data.name}`, 'info')
      createdCategoryId = createResponse.data.id
    } else {
      log(`   ❌ Erreur lors de la création: ${createResponse.status}`, 'error')
      log(`   Réponse: ${JSON.stringify(createResponse.data, null, 2)}`, 'error')
      return
    }

    // 2. READ ALL - Lire toutes les catégories
    log('\n2️⃣  Test READ ALL (GET /api/categories)', 'info')
    const readAllResponse = await makeRequest(`${API_URL}/api/categories`, 'GET')
    
    if (readAllResponse.status === 200) {
      log(`   ✅ ${readAllResponse.data.length} catégorie(s) récupérée(s)`, 'success')
    } else {
      log(`   ❌ Erreur lors de la lecture: ${readAllResponse.status}`, 'error')
      log(`   Réponse: ${JSON.stringify(readAllResponse.data, null, 2)}`, 'error')
    }

    // 3. READ ONE - Lire une catégorie par ID
    if (createdCategoryId) {
      log('\n3️⃣  Test READ ONE (GET /api/categories/[id])', 'info')
      const readOneResponse = await makeRequest(`${API_URL}/api/categories/${createdCategoryId}`, 'GET')
      
      if (readOneResponse.status === 200) {
        log(`   ✅ Catégorie récupérée avec succès`, 'success')
        log(`   Nom: ${readOneResponse.data.name}`, 'info')
      } else {
        log(`   ❌ Erreur lors de la lecture: ${readOneResponse.status}`, 'error')
        log(`   Réponse: ${JSON.stringify(readOneResponse.data, null, 2)}`, 'error')
      }

      // 4. UPDATE - Mettre à jour une catégorie
      log('\n4️⃣  Test UPDATE (PUT /api/categories/[id])', 'info')
      const updateData = {
        name: `Test Category Updated ${Date.now()}`,
        description: 'Description mise à jour'
      }
      
      const updateResponse = await makeRequest(`${API_URL}/api/categories/${createdCategoryId}`, 'PUT', updateData)
      
      if (updateResponse.status === 200) {
        log(`   ✅ Catégorie mise à jour avec succès`, 'success')
        log(`   Nouveau nom: ${updateResponse.data.name}`, 'info')
      } else {
        log(`   ❌ Erreur lors de la mise à jour: ${updateResponse.status}`, 'error')
        log(`   Réponse: ${JSON.stringify(updateResponse.data, null, 2)}`, 'error')
      }

      // 5. DELETE - Supprimer une catégorie
      log('\n5️⃣  Test DELETE (DELETE /api/categories/[id])', 'info')
      const deleteResponse = await makeRequest(`${API_URL}/api/categories/${createdCategoryId}`, 'DELETE')
      
      if (deleteResponse.status === 200) {
        log(`   ✅ Catégorie supprimée avec succès`, 'success')
      } else {
        log(`   ⚠️  Erreur lors de la suppression: ${deleteResponse.status}`, 'warning')
        log(`   Réponse: ${JSON.stringify(deleteResponse.data, null, 2)}`, 'warning')
        log(`   (Peut être normal si la catégorie a des produits associés)`, 'warning')
      }
    }

    // 6. Vérifier les autres endpoints
    log('\n6️⃣  Test des autres endpoints', 'info')
    
    const endpoints = [
      { name: 'Products', url: '/api/products' },
      { name: 'Sales', url: '/api/sales' },
      { name: 'Purchases', url: '/api/purchases' },
      { name: 'Subcategories', url: '/api/subcategories' },
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await makeRequest(`${API_URL}${endpoint.url}`, 'GET')
        if (response.status === 200) {
          log(`   ✅ ${endpoint.name}: OK (${response.status})`, 'success')
        } else {
          log(`   ❌ ${endpoint.name}: Erreur ${response.status}`, 'error')
        }
      } catch (error) {
        log(`   ❌ ${endpoint.name}: ${error.message}`, 'error')
      }
    }

    log('\n✅ Tests terminés!\n', 'success')

  } catch (error) {
    log(`\n❌ Erreur lors des tests: ${error.message}`, 'error')
    console.error(error)
  }
}

testCRUD()

