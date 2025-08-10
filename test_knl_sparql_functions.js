#!/usr/bin/env node

/**
 * Test script to verify which SPARQL functions the KNL endpoint supports
 * Tests REGEX, CONTAINS, STRSTARTS, and other string matching functions
 */

const knlEndpoint = 'https://lod.nl.go.kr/sparql';
const proxyUrl = 'http://localhost:8001';

async function testSparqlFunction(functionName, query) {
  console.log(`\n=== Testing ${functionName} ===`);
  console.log('Query:', query.replace(/\s+/g, ' ').trim());
  
  try {
    const encodedQuery = encodeURIComponent(query);
    const knlDirectUrl = `${knlEndpoint}?query=${encodedQuery}&format=json&type=json`;
    const testUrl = `${proxyUrl}/?url=${encodeURIComponent(knlDirectUrl)}`;
    
    const response = await fetch(testUrl, { 
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log('HTTP Status:', response.status);
    
    if (!response.ok) {
      console.log('❌ HTTP Error:', response.status, response.statusText);
      return { supported: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.log('❌ SPARQL Error:', data.error);
      return { supported: false, error: data.error };
    }
    
    if (data.results && data.results.bindings) {
      const resultCount = data.results.bindings.length;
      console.log(`✅ SUCCESS: ${resultCount} results`);
      if (resultCount > 0) {
        console.log('Sample result:', data.results.bindings[0].label?.value || 'No label');
      }
      return { supported: true, resultCount };
    } else {
      console.log('❓ Unexpected response format:', data);
      return { supported: false, error: 'Unexpected response format' };
    }
    
  } catch (error) {
    console.log('❌ Network/Parse Error:', error.message);
    return { supported: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing KNL SPARQL Function Support');
  console.log('Using test search term: "가라타니"');
  
  const testTerm = '가라타니';
  const results = {};
  
  // Test 1: Exact match (baseline - should work)
  results.exact = await testSparqlFunction('EXACT MATCH', `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(?label = "${testTerm}")
}
LIMIT 5`);

  // Test 2: REGEX function
  results.regex = await testSparqlFunction('REGEX', `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(REGEX(?label, "${testTerm}"))
}
LIMIT 5`);

  // Test 3: CONTAINS function
  results.contains = await testSparqlFunction('CONTAINS', `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(CONTAINS(?label, "${testTerm}"))
}
LIMIT 5`);

  // Test 4: STRSTARTS function
  results.strstarts = await testSparqlFunction('STRSTARTS', `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(STRSTARTS(?label, "${testTerm}"))
}
LIMIT 5`);

  // Test 5: STRENDS function
  results.strends = await testSparqlFunction('STRENDS', `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(STRENDS(?label, "고진"))
}
LIMIT 5`);

  // Test 6: Multiple OR conditions (fallback approach)
  results.multipleOr = await testSparqlFunction('MULTIPLE OR', `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX nlon: <http://lod.nl.go.kr/ontology/>
SELECT DISTINCT ?s ?label WHERE { 
    ?s rdf:type nlon:Author .
    ?s rdfs:label ?label .
    FILTER(?label = "가라타니 고진" || ?label = "가라타니")
}
LIMIT 5`);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY OF KNL SPARQL FUNCTION SUPPORT');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([func, result]) => {
    const status = result.supported ? '✅ SUPPORTED' : '❌ NOT SUPPORTED';
    const details = result.supported 
      ? `(${result.resultCount} results)`
      : `(${result.error})`;
    console.log(`${func.padEnd(12)}: ${status} ${details}`);
  });

  // Recommendations
  console.log('\n🔍 RECOMMENDATIONS:');
  if (results.exact.supported) {
    console.log('✅ Exact matching works - use for known complete names');
  }
  if (results.regex.supported) {
    console.log('✅ REGEX works - use for flexible pattern matching');
  } else {
    console.log('❌ REGEX not supported - cannot use pattern matching');
  }
  if (results.contains.supported) {
    console.log('✅ CONTAINS works - use for substring matching');
  } else {
    console.log('❌ CONTAINS not supported - cannot use substring search');
  }
  if (results.strstarts.supported) {
    console.log('✅ STRSTARTS works - use for prefix matching');
  } else {
    console.log('❌ STRSTARTS not supported - cannot use prefix search');
  }
  if (results.multipleOr.supported) {
    console.log('✅ Multiple OR conditions work - use for multi-name search');
  }

  console.log('\n💡 Best strategy for partial search:');
  if (results.regex.supported || results.contains.supported || results.strstarts.supported) {
    console.log('Use native SPARQL string functions for partial matching');
  } else {
    console.log('Use multiple exact matches with OR conditions (current approach is correct)');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSparqlFunction, runTests };